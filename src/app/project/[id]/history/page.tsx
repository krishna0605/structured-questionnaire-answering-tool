'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, History, GitCompare, Loader2, Calendar } from 'lucide-react';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';

type VersionSnapshot = {
  id: string;
  label: string;
  saved_at: string;
  snapshot: { question_id: string; question_text: string; question_number: number; answer_text: string; confidence_score: number | null; is_not_found: boolean; is_edited: boolean }[];
};

export default function HistoryPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<VersionSnapshot | null>(null);
  const [compareVersions, setCompareVersions] = useState<[VersionSnapshot | null, VersionSnapshot | null]>([null, null]);
  const [mode, setMode] = useState<'view' | 'compare'>('view');

  /* eslint-disable react-hooks/exhaustive-deps */
  const loadVersions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('answer_versions').select('*').eq('project_id', projectId).order('saved_at', { ascending: false });
    if (data) {
      const mapped = data.map((v: { id: string; label: string; saved_at: string; snapshot: string }) => ({
        id: v.id, label: v.label, saved_at: v.saved_at,
        snapshot: typeof v.snapshot === 'string' ? JSON.parse(v.snapshot) : v.snapshot,
      }));
      setVersions(mapped);
      if (mapped.length > 0 && !selectedVersion) setSelectedVersion(mapped[0]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadVersions(); }, [loadVersions]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const cardStyle: React.CSSProperties = { background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' };

  const getConfColor = (score: number | null) => {
    if (score === null) return '#6b6b80';
    const pct = Math.round(score * 100);
    return pct >= 80 ? '#3ecf8e' : pct >= 50 ? '#f59e0b' : '#ef4444';
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: '48px', height: '48px', color: '#7c3aed', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#a0a0b0' }}>Loading version history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: "'Inter', sans-serif" }}>
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
          <Link href={`/project/${projectId}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
              style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>
              <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
            </motion.div>
          </Link>
          <Link href={`/project/${projectId}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#a0a0b0', textDecoration: 'none' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Project
          </Link>
        </div>
      </motion.nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <History style={{ width: '28px', height: '28px', color: '#a78bfa' }} />
              <TextGenerateEffect
                words="Version History"
                className="text-[28px] font-extrabold text-white tracking-tight"
                duration={0.4}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '15px', color: '#a0a0b0' }}
            >
              {versions.length} saved version{versions.length !== 1 ? 's' : ''}
            </motion.p>
          </div>
          {versions.length >= 2 && (
            <motion.button
              onClick={() => { setMode(mode === 'compare' ? 'view' : 'compare'); setCompareVersions([null, null]); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: mode === 'compare' ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : '#1c1c28',
                color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                boxShadow: mode === 'compare' ? '0 4px 20px rgba(124,58,237,0.35)' : 'none',
                transition: 'background 0.3s', fontFamily: 'inherit',
              }}
            >
              <GitCompare style={{ width: '18px', height: '18px' }} /> {mode === 'compare' ? 'Exit Compare' : 'Compare Versions'}
            </motion.button>
          )}
        </motion.div>

        {versions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 32px', borderRadius: '20px', ...cardStyle }}
          >
            <History style={{ width: '56px', height: '56px', color: '#6b6b80', opacity: 0.5, margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>No versions saved yet</h3>
            <p style={{ fontSize: '15px', color: '#a0a0b0' }}>
              Save a version from the project workspace to see it here.
            </p>
          </motion.div>
        ) : mode === 'view' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
            {/* Version List */}
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {versions.map((v, idx) => (
                <motion.button key={v.id} variants={item}
                  onClick={() => setSelectedVersion(v)}
                  whileHover={{ x: 4 }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '18px', borderRadius: '12px',
                    border: `1px solid ${selectedVersion?.id === v.id ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    background: selectedVersion?.id === v.id ? '#1c1c28' : '#16161f',
                    boxShadow: selectedVersion?.id === v.id ? '0 0 24px rgba(124,58,237,0.1)' : 'none',
                    cursor: 'pointer', transition: 'all 0.25s', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <motion.div
                      animate={selectedVersion?.id === v.id ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: 800,
                        background: selectedVersion?.id === v.id ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : '#22222f',
                        color: selectedVersion?.id === v.id ? 'white' : '#6b6b80',
                      }}
                    >
                      V{versions.length - idx}
                    </motion.div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.label || `Version ${versions.length - idx}`}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b6b80', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        {new Date(v.saved_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Version Detail */}
            <div>
              {selectedVersion ? (
                <AnimatePresence mode="wait">
                  <motion.div key={selectedVersion.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ ...cardStyle, padding: '28px' }}
                  >
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '20px' }}>
                      {selectedVersion.label || 'Version Snapshot'} — {selectedVersion.snapshot?.length || 0} answers
                    </h3>
                    <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedVersion.snapshot?.map((snapItem, i) => (
                        <motion.div key={i} variants={item}
                          whileHover={{ borderColor: 'rgba(124,58,237,0.15)' }}
                          style={{ padding: '20px', borderRadius: '12px', background: '#0f0f17', border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.3s' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', lineHeight: 1.5 }}>
                              <span style={{ color: '#a78bfa' }}>Q{snapItem.question_number}:</span> {snapItem.question_text}
                            </div>
                            {snapItem.confidence_score !== null && (
                              <span style={{ fontSize: '13px', fontWeight: 700, flexShrink: 0, color: getConfColor(snapItem.confidence_score) }}>
                                {Math.round(snapItem.confidence_score * 100)}%
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#a0a0b0' }}>{snapItem.answer_text}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#6b6b80', fontSize: '15px' }}>Select a version to view</div>
              )}
            </div>
          </div>
        ) : (
          /* Compare Mode */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              {[0, 1].map((slot) => (
                <div key={slot}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#6b6b80', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
                    {slot === 0 ? 'Version A' : 'Version B'}
                  </label>
                  <select
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', outline: 'none', background: '#16161f', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f5', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                    value={compareVersions[slot]?.id || ''} onChange={(e) => {
                      const v = versions.find((x) => x.id === e.target.value) || null;
                      setCompareVersions((prev) => { const n = [...prev] as [VersionSnapshot | null, VersionSnapshot | null]; n[slot] = v; return n; });
                    }}
                    onFocus={e => (e.target.style.borderColor = '#7c3aed')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  >
                    <option value="">Select version...</option>
                    {versions.map((v, i) => <option key={v.id} value={v.id}>{v.label || `Version ${versions.length - i}`}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {compareVersions[0] && compareVersions[1] && (
              <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {compareVersions[0].snapshot?.map((itemA, i) => {
                  const itemB = compareVersions[1]!.snapshot?.find((x) => x.question_id === itemA.question_id);
                  const isDiff = itemB && itemA.answer_text !== itemB.answer_text;
                  return (
                    <motion.div key={i} variants={item}
                      whileHover={{ borderColor: isDiff ? 'rgba(245,158,11,0.4)' : 'rgba(124,58,237,0.15)' }}
                      style={{ ...cardStyle, padding: '24px', borderColor: isDiff ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)', transition: 'border-color 0.3s' }}
                    >
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '16px', lineHeight: 1.5 }}>
                        <span style={{ color: '#a78bfa' }}>Q{itemA.question_number}:</span> {itemA.question_text}
                        {isDiff && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                            style={{ marginLeft: '10px', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Changed</motion.span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '16px', borderRadius: '10px', background: '#0f0f17', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b80', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Version A</div>
                          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#a0a0b0' }}>{itemA.answer_text}</p>
                        </div>
                        <div style={{ padding: '16px', borderRadius: '10px', background: '#0f0f17', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b80', textTransform: 'uppercase' as const, marginBottom: '10px' }}>Version B</div>
                          <p style={{ fontSize: '14px', lineHeight: 1.7, color: itemB ? '#a0a0b0' : '#6b6b80' }}>
                            {itemB ? itemB.answer_text : 'Not in this version'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
