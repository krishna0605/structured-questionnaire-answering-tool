import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateAnswer(
  question: string,
  context: string
): Promise<{
  answer_text: string;
  confidence_score: number;
  evidence_snippets: string[];
  is_not_found: boolean;
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert at answering structured questionnaires using provided reference documents. 
Your task is to answer the given question ONLY using the provided context from reference documents.

Rules:
1. Answer ONLY based on the provided context. Do not make up information.
2. If the context does not contain enough information to answer, set is_not_found to true.
3. Provide a confidence_score between 0 and 1 based on how well the context supports your answer.
4. Extract relevant evidence_snippets (exact quotes from the context) that support your answer.
5. Be concise but thorough in your answers.

Respond ONLY with valid JSON in this exact format:
{
  "answer_text": "Your detailed answer here",
  "confidence_score": 0.85,
  "evidence_snippets": ["Exact quote 1 from context", "Exact quote 2 from context"],
  "is_not_found": false
}`,
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nContext from reference documents:\n${context}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content || '';
  try {
    return JSON.parse(content);
  } catch {
    return {
      answer_text: content,
      confidence_score: 0.5,
      evidence_snippets: [],
      is_not_found: false,
    };
  }
}

export default openai;
