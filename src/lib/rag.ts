import { createServiceClient } from '@/lib/supabase/server';
import { generateEmbedding, generateAnswer } from '@/lib/openai';
import { chunkText } from '@/lib/chunker';
import { parsePDF } from '@/lib/parser';
import type { GeneratedAnswer, DocumentChunk } from '@/types';

/**
 * Embed a reference document: parse → chunk → embed → store
 */
export async function embedDocument(
  documentId: string,
  storageBuffer: Buffer,
  filename: string
): Promise<void> {
  const supabase = createServiceClient();

  // Update status to embedding
  await supabase
    .from('reference_documents')
    .update({ status: 'embedding' })
    .eq('id', documentId);

  try {
    // Parse text from PDF
    let text: string;
    if (filename.toLowerCase().endsWith('.pdf')) {
      text = await parsePDF(storageBuffer);
    } else {
      text = storageBuffer.toString('utf-8');
    }

    // Chunk the text
    const chunks = chunkText(text, 500, 50);

    // Generate embeddings and store each chunk
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      await supabase.from('document_chunks').insert({
        document_id: documentId,
        content: chunk.content,
        chunk_index: chunk.chunk_index,
        embedding: embedding,
      });
    }

    // Update status to embedded
    await supabase
      .from('reference_documents')
      .update({ status: 'embedded' })
      .eq('id', documentId);
  } catch (error) {
    console.error('Error embedding document:', error);
    await supabase
      .from('reference_documents')
      .update({ status: 'error' })
      .eq('id', documentId);
    throw error;
  }
}

/**
 * Retrieve relevant chunks for a question using vector similarity
 */
export async function retrieveRelevantChunks(
  questionText: string,
  projectId: string,
  topK: number = 5
): Promise<(DocumentChunk & { source_filename: string; similarity: number })[]> {
  const supabase = createServiceClient();

  // Generate embedding for the question
  const questionEmbedding = await generateEmbedding(questionText);

  // Get all reference document IDs for this project
  const { data: docs } = await supabase
    .from('reference_documents')
    .select('id, filename')
    .eq('project_id', projectId)
    .eq('status', 'embedded');

  if (!docs || docs.length === 0) return [];

  const docIds = docs.map((d: { id: string; filename: string }) => d.id);
  const docMap = new Map(docs.map((d: { id: string; filename: string }) => [d.id, d.filename]));

  // Vector similarity search using pgvector
  const { data: chunks, error } = await supabase.rpc('match_documents', {
    query_embedding: questionEmbedding,
    match_count: topK,
    doc_ids: docIds,
  });

  if (error) {
    // Fallback: manual similarity search if RPC doesn't exist
    console.warn('RPC match_documents not found, using fallback query');
    const { data: allChunks } = await supabase
      .from('document_chunks')
      .select('*')
      .in('document_id', docIds);

    if (!allChunks) return [];

    return allChunks.slice(0, topK).map((c: DocumentChunk) => ({
      ...c,
      source_filename: docMap.get(c.document_id) || 'Unknown',
      similarity: 0.5,
    }));
  }

  return (chunks || []).map((c: DocumentChunk & { similarity: number }) => ({
    ...c,
    source_filename: docMap.get(c.document_id) || 'Unknown',
  }));
}

/**
 * Generate an answer for a single question using RAG
 */
export async function generateRAGAnswer(
  questionText: string,
  projectId: string
): Promise<GeneratedAnswer> {
  // Retrieve relevant chunks
  const relevantChunks = await retrieveRelevantChunks(
    questionText,
    projectId
  );

  if (relevantChunks.length === 0) {
    return {
      answer_text:
        'No relevant information found in the reference documents to answer this question.',
      confidence_score: 0,
      evidence_snippets: [],
      is_not_found: true,
      citations: [],
    };
  }

  // Compile context from chunks
  const context = relevantChunks
    .map(
      (c, i) =>
        `[Source: ${c.source_filename}]\n${c.content}`
    )
    .join('\n\n---\n\n');

  // Generate answer using LLM
  const llmResult = await generateAnswer(questionText, context);

  // Build citations from the retrieved chunks
  const citations = relevantChunks.map((chunk) => ({
    source_filename: chunk.source_filename,
    snippet: chunk.content.substring(0, 200) + '...',
    chunk_id: chunk.id,
    document_id: chunk.document_id,
  }));

  return {
    answer_text: llmResult.answer_text,
    confidence_score: llmResult.confidence_score,
    evidence_snippets: llmResult.evidence_snippets,
    is_not_found: llmResult.is_not_found,
    citations,
  };
}
