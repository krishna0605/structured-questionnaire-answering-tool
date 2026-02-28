'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Shield, FolderPlus, FileText, ChevronRight, Plus, X, Loader2, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { SparklesCore } from '@/components/ui/sparkles';

/* ── Pure CSS Spotlight Card ── */
function SpotlightCard({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={ref} onClick={onClick}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: '14px',
        background: '#16161f',
        borderWidth: '1px', borderStyle: 'solid',
        borderColor: isHovered ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
        padding: '24px', cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        boxShadow: isHovered ? '0 8px 30px rgba(124,58,237,0.08)' : 'none',
      }}
    >
      {/* Radial spotlight follow effect */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: isHovered
          ? `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(124,58,237,0.08), transparent 60%)`
          : 'none',
        transition: 'opacity 0.3s',
        opacity: isHovered ? 1 : 0,
      }} />
      {children}
    </div>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserEmail(user.email || '');
  };

  const loadProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    loadProjects();
    loadUser();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const toastId = toast.loading('Creating project...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not authenticated', { id: toastId }); setCreating(false); return; }
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name: newName.trim(), description: newDesc.trim() || null })
      .select()
      .single();
    if (error || !data) {
      toast.error('Failed to create project', { id: toastId });
    } else {
      toast.success('Project created!', { id: toastId });
      setShowNewProject(false); setNewName(''); setNewDesc('');
      router.push(`/project/${data.id}`);
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
    router.push('/login');
    router.refresh();
  };

  const cardBase: React.CSSProperties = {
    background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 32px', background: 'rgba(10,10,15,0.9)',
          backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring' as const, stiffness: 300 }}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            }}
          >
            <Shield style={{ width: '20px', height: '20px', color: 'white' }} />
          </motion.div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>ShieldSync</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6b6b80' }}>{userEmail}</span>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05, backgroundColor: '#22222f' }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: '#1c1c28', color: '#a0a0b0', fontSize: '14px',
              fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <LogOut style={{ width: '16px', height: '16px' }} /> Logout
          </motion.button>
        </div>
      </motion.nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px' }}
        >
          <div>
            <TextGenerateEffect
              words="Your Projects"
              className="text-[32px] font-extrabold text-white tracking-tight"
              duration={0.4}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontSize: '15px', color: '#6b6b80', marginTop: '6px' }}
            >
              Manage and review your security questionnaires
            </motion.p>
          </div>
          <motion.button
            onClick={() => setShowNewProject(true)}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(124,58,237,0.45)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              fontFamily: 'inherit',
            }}
          >
            <FolderPlus style={{ width: '18px', height: '18px' }} /> New Project
          </motion.button>
        </motion.div>

        {/* New Project Form */}
        <AnimatePresence>
          {showNewProject && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.35, type: 'spring' as const, stiffness: 200, damping: 25 }}
              style={{ overflow: 'hidden', marginBottom: '28px' }}
            >
              <div style={{ ...cardBase, padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Create New Project</h2>
                  <motion.button
                    onClick={() => setShowNewProject(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                      background: '#22222f', color: '#6b6b80', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </motion.button>
                </div>
                <form onSubmit={createProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#d0d0dd', marginBottom: '6px' }}>Project Name *</label>
                    <input
                      value={newName} onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Q4 Vendor Assessment" disabled={creating} required autoFocus
                      style={{
                        width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f17',
                        color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 16px rgba(124,58,237,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#d0d0dd', marginBottom: '6px' }}>Description (Optional)</label>
                    <input
                      value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief description" disabled={creating}
                      style={{
                        width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f17',
                        color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 16px rgba(124,58,237,0.12)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <motion.button type="button" onClick={() => setShowNewProject(false)}
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a0a0b0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Cancel
                    </motion.button>
                    <motion.button type="submit" disabled={creating}
                      whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(124,58,237,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white',
                        fontSize: '14px', fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer',
                        opacity: creating ? 0.6 : 1, fontFamily: 'inherit',
                      }}>
                      {creating ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Plus style={{ width: '16px', height: '16px' }} /> Create Project</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Loader2 style={{ width: '36px', height: '36px', color: '#7c3aed', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '15px', color: '#6b6b80' }}>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 32px', borderRadius: '20px', ...cardBase, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              <SparklesCore id="dashboard-sparkles" background="transparent" minSize={0.6} maxSize={1.4} particleDensity={40} particleColor="#7c3aed" />
            </div>
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <FileText style={{ width: '36px', height: '36px', color: '#a78bfa' }} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>No projects yet</h3>
              <p style={{ fontSize: '15px', color: '#6b6b80', maxWidth: '400px', margin: '0 auto 28px' }}>
                Create your first project to start answering questionnaires with AI.
              </p>
              <motion.button
                onClick={() => setShowNewProject(true)}
                whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(124,58,237,0.45)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)', fontFamily: 'inherit',
                }}
              >
                <FolderPlus style={{ width: '18px', height: '18px' }} /> Create Your First Project
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={item}>
                <SpotlightCard onClick={() => router.push(`/project/${project.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 10 }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                    }}>
                      <FileText style={{ width: '22px', height: '22px', color: '#a78bfa' }} />
                    </div>
                    <ChevronRight style={{ width: '20px', height: '20px', color: '#6b6b80' }} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'white', marginBottom: '6px', position: 'relative', zIndex: 10 }}>{project.name}</h3>
                  {project.description && (
                    <p style={{
                      fontSize: '14px', color: '#6b6b80', marginBottom: '12px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      position: 'relative', zIndex: 10,
                    }}>
                      {project.description}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', color: '#4a4a5e', position: 'relative', zIndex: 10 }}>
                    Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
