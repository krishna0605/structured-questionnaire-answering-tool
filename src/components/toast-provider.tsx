'use client';

import { useToaster, toast } from 'react-hot-toast';

export default function ToastProvider() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  return (
    <div
      onMouseEnter={startPause}
      onMouseLeave={endPause}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '8px',
      }}
    >
      {toasts
        .filter((t) => t.visible)
        .map((t) => {
          // Determine icon based on type
          let icon = '⏳';
          let iconColor = '#a0a0b0';
          if (t.type === 'success') { icon = '✓'; iconColor = '#3ecf8e'; }
          else if (t.type === 'error') { icon = '✕'; iconColor = '#ef4444'; }
          else if (t.type === 'loading') { icon = ''; iconColor = '#a78bfa'; }

          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 40px 12px 14px',
                borderRadius: '10px',
                background: '#1c1c28',
                color: '#f0f0f5',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                position: 'relative',
                animation: 'toastSlideIn 0.3s ease-out',
                maxWidth: '380px',
              }}
            >
              {/* Icon */}
              {t.type === 'loading' ? (
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(167,139,250,0.3)',
                  borderTopColor: '#a78bfa',
                  animation: 'spin 1s linear infinite',
                  flexShrink: 0,
                }} />
              ) : (
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  background: `${iconColor}20`, color: iconColor,
                }}>
                  {icon}
                </span>
              )}

              {/* Message */}
              <span style={{ flex: 1 }}>
                {typeof t.message === 'function' ? t.message(t) : t.message}
              </span>

              {/* Dismiss button */}
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  position: 'absolute', top: '50%', right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: '#6b6b80',
                  cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                  padding: '2px 4px', borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#f0f0f5')}
                onMouseOut={e => (e.currentTarget.style.color = '#6b6b80')}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          );
        })}

      {/* Injected keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
