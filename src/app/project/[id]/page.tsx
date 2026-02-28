'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Project, Question, Answer, Citation, CoverageSummary } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, UploadCloud, FileText, Database, Zap, RefreshCw,
  Save, History, Download, CheckCircle2, AlertCircle, Clock, ChevronDown,
  Edit3, X, Loader2, ArrowLeft, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';

interface QuestionWithAnswer {
  question: Question;
  answer: Answer | null;
  citations: Citation[];
}

const GENERATION_STEPS = [
  { text: 'Parsing questionnaire...' },
  { text: 'Searching reference documents...' },
  { text: 'Generating answers with AI...' },
  { text: 'Calculating confidence scores...' },
  { text: 'Finalizing results...' },
];

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([]);
  const [refDocs, setRefDocs] = useState<{ id: string; filename: string; status: string }[]>([]);
  const [coverage, setCoverage] = useState<CoverageSummary>({ total_questions: 0, answered: 0, not_found: 0, avg_confidence: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedForRegen, setSelectedForRegen] = useState<Set<string>>(new Set());
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set());
  const [editingAnswer, setEditingAnswer] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);
  const [exporting, setExporting] = useState(false);

  const isUIFrozen = savingVersion || generating || exporting || uploading;

  const loadProject = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (data) setProject(data);
  }, [projectId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await loadProject();

    const { data: docs } = await supabase
      .from('reference_documents')
      .select('id, filename, status')
      .eq('project_id', projectId);
    setRefDocs(docs || []);

    const { data: questionnaires } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('project_id', projectId);

    if (questionnaires && questionnaires.length > 0) {
      const qIds = questionnaires.map((q: { id: string }) => q.id);
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .in('questionnaire_id', qIds)
        .order('question_number');

      if (questions) {
        const qwa: QuestionWithAnswer[] = [];
        for (const q of questions) {
          const { data: answers } = await supabase
            .from('answers')
            .select('*')
            .eq('question_id', q.id)
            .order('version', { ascending: false })
            .limit(1);
          const answer = answers && answers.length > 0 ? answers[0] : null;
          let citations: Citation[] = [];
          if (answer) {
            const { data: cits } = await supabase.from('citations').select('*').eq('answer_id', answer.id);
            citations = cits || [];
          }
          qwa.push({ question: q, answer, citations });
        }
        setQuestionsWithAnswers(qwa);
        const total = qwa.length;
        const answered = qwa.filter((q) => q.answer && !q.answer.is_not_found).length;
        const notFound = qwa.filter((q) => q.answer?.is_not_found).length;
        const confidences = qwa.filter((q) => q.answer?.confidence_score != null).map((q) => q.answer!.confidence_score!);
        const avgConf = confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
        setCoverage({ total_questions: total, answered, not_found: notFound, avg_confidence: avgConf });
      }
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Upload Handlers ── */
  const handleQuestionnaireUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const tid = toast.loading('Uploading questionnaire...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      if (res.ok) { toast.success('Questionnaire processed!', { id: tid }); await loadData(); }
      else { const err = await res.json(); toast.error(`Error: ${err.error}`, { id: tid }); }
    } catch { toast.error('Upload failed', { id: tid }); }
    setUploading(false);
  };

  const handleRefDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const tid = toast.loading(`Uploading ${files.length} document(s)...`);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('projectId', projectId);
      try { await fetch('/api/embed', { method: 'POST', body: fd }); }
      catch { console.error(`Failed: ${file.name}`); }
    }
    toast.success('Reference documents uploaded', { id: tid });
    await loadData();
    setUploading(false);
  };

  /* ── Generate / Regenerate ── */
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId }) });
      if (res.ok) { toast.success('All answers generated!'); await loadData(); }
      else { const err = await res.json(); toast.error(`Error: ${err.error}`); }
    } catch { toast.error('Generation failed'); }
    setGenerating(false);
  };

  const handleRegenerate = async () => {
    if (selectedForRegen.size === 0) return;
    setGenerating(true);
    const tid = toast.loading(`Regenerating ${selectedForRegen.size} answer(s)...`);
    try {
      const res = await fetch('/api/regenerate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, questionIds: Array.from(selectedForRegen) }) });
      if (res.ok) { toast.success('Regenerated!', { id: tid }); setSelectedForRegen(new Set()); await loadData(); }
      else toast.error('Regeneration failed', { id: tid });
    } catch { toast.error('Network error', { id: tid }); }
    setGenerating(false);
  };

  /* ── Edit / Save / Export ── */
  const handleSaveEdit = async (questionId: string, answerId: string) => {
    const { error } = await supabase.from('answers').update({ answer_text: editText, is_edited: true }).eq('id', answerId);
    if (!error) { toast.success('Edit saved'); setEditingAnswer(null); await loadData(); }
    else toast.error('Failed to save');
  };

  const handleSaveVersion = async () => {
    setSavingVersion(true);
    const tid = toast.loading('Saving version snapshot...');
    try {
      const res = await fetch('/api/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId }) });
      if (res.ok) toast.success('Version saved!', { id: tid });
      else toast.error('Save failed', { id: tid });
    } catch { toast.error('Network error', { id: tid }); }
    setSavingVersion(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const tid = toast.loading('Preparing DOCX export...');
    try {
      const res = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId }) });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name || 'answers'}_export.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Export downloaded!', { id: tid });
      } else toast.error('Export failed', { id: tid });
    } catch { toast.error('Network error', { id: tid }); }
    setExporting(false);
  };

  const toggleEvidence = (qid: string) => {
    setExpandedEvidence((p) => { const n = new Set(p); n.has(qid) ? n.delete(qid) : n.add(qid); return n; });
  };

  const toggleRegenSelection = (qid: string) => {
    if (isUIFrozen) return;
    setSelectedForRegen((p) => { const n = new Set(p); n.has(qid) ? n.delete(qid) : n.add(qid); return n; });
  };

  const getConfColor = (score: number | null) => {
    if (score === null) return '#6b6b80';
    const pct = Math.round(score * 100);
    return pct >= 80 ? '#3ecf8e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  };

  const cardStyle: React.CSSProperties = { background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
  const listItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#7c3aed', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#a0a0b0' }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  const hasQuestions = questionsWithAnswers.length > 0;
  const hasAnswers = questionsWithAnswers.some((q) => q.answer);
  const hasRefDocs = refDocs.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: "'Inter', sans-serif" }}>
      {/* Multi-Step Loader Overlay */}
      <MultiStepLoader loadingStates={GENERATION_STEPS} loading={generating} duration={6000} />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
              style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
            </motion.div>
          </Link>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#a0a0b0', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Dashboard
          </Link>
          <span style={{ color: '#4a4a5e' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{project?.name || 'Project'}</span>
        </div>

        {hasAnswers && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <motion.button onClick={handleSaveVersion} disabled={isUIFrozen} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a0a0b0', fontSize: '13px', fontWeight: 600, cursor: isUIFrozen ? 'not-allowed' : 'pointer', opacity: isUIFrozen ? 0.5 : 1, fontFamily: 'inherit' }}>
              {savingVersion ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
              Save Version
            </motion.button>
            <Link href={`/project/${projectId}/history`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a0a0b0', fontSize: '13px', fontWeight: 600, textDecoration: 'none', fontFamily: 'inherit' }}>
              <History style={{ width: '14px', height: '14px' }} /> History
            </Link>
            <motion.button onClick={handleExport} disabled={isUIFrozen} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', fontSize: '13px', fontWeight: 600, cursor: isUIFrozen ? 'not-allowed' : 'pointer', opacity: isUIFrozen ? 0.5 : 1, fontFamily: 'inherit' }}>
              {exporting ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Download style={{ width: '14px', height: '14px' }} />}
              Export DOCX
            </motion.button>
          </div>
        )}
      </motion.nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>
        {/* Coverage Stats with Meteors */}
        {hasQuestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Total', value: coverage.total_questions, icon: FileText, color: '#a78bfa' },
              { label: 'Answered', value: coverage.answered, icon: CheckCircle2, color: '#3ecf8e' },
              { label: 'Not Found', value: coverage.not_found, icon: AlertCircle, color: '#ef4444' },
              { label: 'Avg Confidence', value: coverage.avg_confidence > 0 ? `${Math.round(coverage.avg_confidence * 100)}%` : '—', icon: Zap, color: '#f59e0b' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} whileHover={{ y: -3, boxShadow: `0 8px 30px ${s.color}15` }} transition={{ type: 'spring', stiffness: 300 }}
                  style={{ ...cardStyle, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${s.color}15` }}>
                    <Icon style={{ width: '22px', height: '22px', color: s.color }} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{s.value}</div>
                    <div style={{ fontSize: '13px', color: '#6b6b80' }}>{s.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Upload Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Questionnaire Upload */}
          <motion.div whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.2)' }} style={{ ...cardStyle, padding: '24px', transition: 'border-color 0.3s' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck style={{ width: '20px', height: '20px', color: '#a78bfa' }} /> Upload Questionnaire
            </h3>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '32px 20px',
              cursor: isUIFrozen ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
              background: 'rgba(124,58,237,0.03)',
            }}
              onMouseOver={e => { if (!isUIFrozen) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(124,58,237,0.03)'; }}
            >
              <input type="file" accept=".pdf,.xlsx,.xls,.txt" onChange={handleQuestionnaireUpload} style={{ display: 'none' }} disabled={isUIFrozen} />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
                <UploadCloud style={{ width: '32px', height: '32px', color: '#6b6b80', marginBottom: '10px' }} />
              </motion.div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#a78bfa' }}>Click to upload</span>
              <span style={{ fontSize: '12px', color: '#6b6b80', marginTop: '4px' }}>PDF, XLSX, or TXT</span>
            </label>
            {hasQuestions && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
                marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(62,207,142,0.1)', color: '#3ecf8e',
              }}>
                <CheckCircle2 style={{ width: '16px', height: '16px' }} /> {questionsWithAnswers.length} questions loaded
              </motion.div>
            )}
          </motion.div>

          {/* Reference Docs Upload */}
          <motion.div whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.2)' }} style={{ ...cardStyle, padding: '24px', transition: 'border-color 0.3s' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database style={{ width: '20px', height: '20px', color: '#a78bfa' }} /> Reference Documents
            </h3>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '32px 20px',
              cursor: isUIFrozen ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
              background: 'rgba(124,58,237,0.03)',
            }}
              onMouseOver={e => { if (!isUIFrozen) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; } }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(124,58,237,0.03)'; }}
            >
              <input type="file" accept=".pdf,.txt" multiple onChange={handleRefDocUpload} style={{ display: 'none' }} disabled={isUIFrozen} />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.5 }}>
                <Database style={{ width: '32px', height: '32px', color: '#6b6b80', marginBottom: '10px' }} />
              </motion.div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#a78bfa' }}>Upload reference docs</span>
              <span style={{ fontSize: '12px', color: '#6b6b80', marginTop: '4px' }}>PDF or TXT (multiple)</span>
            </label>
            {refDocs.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {refDocs.map((doc, i) => (
                  <motion.span key={doc.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, background: '#22222f', color: '#a0a0b0' }}>
                    {doc.status === 'embedded'
                      ? <CheckCircle2 style={{ width: '14px', height: '14px', color: '#3ecf8e' }} />
                      : <Clock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />}
                    {doc.filename.length > 20 ? doc.filename.slice(0, 18) + '...' : doc.filename}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Generate Button */}
        {hasQuestions && hasRefDocs && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <motion.button onClick={handleGenerate} disabled={isUIFrozen}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(124,58,237,0.45)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white',
                fontSize: '15px', fontWeight: 700, cursor: isUIFrozen ? 'not-allowed' : 'pointer',
                opacity: isUIFrozen ? 0.5 : 1, boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                fontFamily: 'inherit',
              }}>
              {generating ? <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> : <Zap style={{ width: '18px', height: '18px' }} />}
              Generate All Answers
            </motion.button>
            {selectedForRegen.size > 0 && (
              <motion.button onClick={handleRegenerate} disabled={isUIFrozen}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)', background: '#1c1c28',
                  color: '#a0a0b0', fontSize: '15px', fontWeight: 600,
                  cursor: isUIFrozen ? 'not-allowed' : 'pointer', opacity: isUIFrozen ? 0.5 : 1, fontFamily: 'inherit',
                }}>
                <RefreshCw style={{ width: '18px', height: '18px' }} /> Regenerate ({selectedForRegen.size})
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Q&A List */}
        <motion.div variants={container} initial="hidden" animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: isUIFrozen && !generating ? 0.5 : 1, pointerEvents: isUIFrozen ? 'none' as const : 'auto' as const }}>
          {questionsWithAnswers.map((qa) => (
            <motion.div key={qa.question.id} variants={listItem}
              whileHover={{ borderColor: 'rgba(124,58,237,0.15)', boxShadow: '0 4px 20px rgba(124,58,237,0.06)' }}
              style={{ ...cardStyle, padding: '24px', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                  <motion.div
                    onClick={() => toggleRegenSelection(qa.question.id)}
                    whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: selectedForRegen.has(qa.question.id) ? '#7c3aed' : 'transparent',
                      border: `2px solid ${selectedForRegen.has(qa.question.id) ? '#7c3aed' : 'rgba(255,255,255,0.15)'}`,
                      transition: 'all 0.2s',
                    }}>
                    {selectedForRegen.has(qa.question.id) && <CheckCircle2 style={{ width: '14px', height: '14px', color: 'white' }} />}
                  </motion.div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.05em' }}>Q{qa.question.question_number}</span>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'white', lineHeight: 1.5, marginTop: '2px' }}>{qa.question.question_text}</p>
                  </div>
                </div>
                {qa.answer && qa.answer.confidence_score !== null && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    style={{
                      fontSize: '14px', fontWeight: 800, flexShrink: 0,
                      color: getConfColor(qa.answer.confidence_score),
                      padding: '4px 12px', borderRadius: '8px',
                      background: `${getConfColor(qa.answer.confidence_score)}15`,
                      boxShadow: `0 0 12px ${getConfColor(qa.answer.confidence_score)}10`,
                    }}>
                    {Math.round(qa.answer.confidence_score * 100)}%
                  </motion.span>
                )}
              </div>

              {/* Answer */}
              {qa.answer ? (
                editingAnswer === qa.question.id ? (
                  <div style={{ marginBottom: '12px' }}>
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                      style={{
                        width: '100%', minHeight: '120px', resize: 'vertical', padding: '10px 14px',
                        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f17',
                        color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <motion.button onClick={() => handleSaveEdit(qa.question.id, qa.answer!.id)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Save
                      </motion.button>
                      <motion.button onClick={() => setEditingAnswer(null)}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a0a0b0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#a0a0b0', whiteSpace: 'pre-wrap' }}>{qa.answer.answer_text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                      <motion.button onClick={() => { setEditingAnswer(qa.question.id); setEditText(qa.answer!.answer_text); }}
                        whileHover={{ scale: 1.05, backgroundColor: '#2a2a38' }} whileTap={{ scale: 0.95 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: '#22222f', color: '#a0a0b0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Edit3 style={{ width: '13px', height: '13px' }} /> Edit
                      </motion.button>
                      {qa.citations.length > 0 && (
                        <motion.button onClick={() => toggleEvidence(qa.question.id)}
                          whileHover={{ scale: 1.05, backgroundColor: '#2a2a38' }} whileTap={{ scale: 0.95 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: '#22222f', color: '#a0a0b0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          <ChevronDown style={{ width: '13px', height: '13px', transform: expandedEvidence.has(qa.question.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                          {qa.citations.length} source{qa.citations.length > 1 ? 's' : ''}
                        </motion.button>
                      )}
                      {qa.answer.is_edited && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)' }}>Edited</span>
                      )}
                      {qa.answer.is_not_found && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)' }}>Not Found</span>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#6b6b80' }}>No answer generated yet. Upload reference documents and click Generate.</p>
              )}

              {/* Evidence Panel */}
              <AnimatePresence>
                {expandedEvidence.has(qa.question.id) && qa.citations.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ marginTop: '16px', padding: '16px', borderRadius: '10px', background: '#0f0f17', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#6b6b80', textTransform: 'uppercase' as const, marginBottom: '12px' }}>References</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {qa.citations.map((cit, i) => (
                          <motion.div key={cit.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            style={{ paddingLeft: '14px', borderLeft: '3px solid #7c3aed' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>Source {i + 1}: {cit.source_filename}</div>
                            <p style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: 1.6, color: '#8b8ba0' }}>&ldquo;{cit.snippet}&rdquo;</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
