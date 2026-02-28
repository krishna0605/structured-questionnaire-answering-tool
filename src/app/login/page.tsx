'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Spotlight } from '@/components/ui/spotlight';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); }
      else { toast.success('Welcome back!'); router.push('/dashboard'); router.refresh(); }
    } catch { toast.error('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px', padding: '0 16px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f17',
    color: 'white', fontSize: '15px', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '24px', background: '#0a0a0f' }}>
      <BackgroundBeams />
      <Spotlight className="top-0 left-1/4" fill="#7c3aed" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}
      >
        <div style={{
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
          padding: '48px 40px', background: '#16161f',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.08)',
        }}>
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            }}>
              <Shield style={{ width: '30px', height: '30px', color: 'white' }} />
            </div>
          </motion.div>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <TextGenerateEffect
              words="Welcome Back"
              className="text-[28px] font-extrabold text-white tracking-tight"
              duration={0.5}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ fontSize: '15px', color: '#6b6b80', marginTop: '8px' }}
            >
              Sign in to your questionnaire-answering-tool account
            </motion.p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#d0d0dd', marginBottom: '8px' }}>Email Address</label>
              <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#d0d0dd', marginBottom: '8px' }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white',
                fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px',
              }}
            >
              {loading ? <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Signing in...</> : <>Sign In <ArrowRight style={{ width: '18px', height: '18px' }} /></>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b6b80' }}
          >
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
