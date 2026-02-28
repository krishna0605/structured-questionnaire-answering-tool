'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Spotlight } from '@/components/ui/spotlight';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { toast.error(error.message); }
      else { toast.success('Account created!'); router.push('/dashboard'); router.refresh(); }
    } catch { toast.error('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px', padding: '0 16px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)', background: '#0f0f17',
    color: 'white', fontSize: '15px', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const fields = [
    { label: 'Email Address', type: 'email', placeholder: 'you@company.com', value: email, onChange: (v: string) => setEmail(v), autoComplete: 'email' },
    { label: 'Password', type: 'password', placeholder: 'Min. 6 characters', value: password, onChange: (v: string) => setPassword(v), autoComplete: 'new-password' },
    { label: 'Confirm Password', type: 'password', placeholder: 'Re-enter your password', value: confirmPassword, onChange: (v: string) => setConfirmPassword(v), autoComplete: 'new-password' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '24px', background: '#0a0a0f' }}>
      <BackgroundBeams />
      <Spotlight className="top-0 left-3/4" fill="#3ecf8e" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}
      >
        <div style={{
          borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)',
          padding: '48px 40px', background: '#16161f',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(62,207,142,0.06)',
        }}>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}
          >
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c3aed, #3ecf8e)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            }}>
              <Shield style={{ width: '30px', height: '30px', color: 'white' }} />
            </div>
          </motion.div>

          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <TextGenerateEffect
              words="Create Account"
              className="text-[28px] font-extrabold text-white tracking-tight"
              duration={0.5}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: '15px', color: '#6b6b80', marginTop: '8px' }}
            >
              Start automating your questionnaire answers
            </motion.p>
          </div>

          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {fields.map((field, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#d0d0dd', marginBottom: '8px' }}>{field.label}</label>
                <input
                  type={field.type} placeholder={field.placeholder} value={field.value}
                  onChange={(e) => field.onChange(e.target.value)} required autoComplete={field.autoComplete}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 20px rgba(124,58,237,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </motion.div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white',
                fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
                transition: 'all 0.2s', fontFamily: 'inherit', marginTop: '4px',
              }}
            >
              {loading ? <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Creating account...</> : <><UserPlus style={{ width: '18px', height: '18px' }} /> Create Account</>}
            </motion.button>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b6b80' }}
          >
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
