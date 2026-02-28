'use client';

import toast, { Toaster, ToastBar } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1c1c28',
          color: '#f0f0f5',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          iconTheme: { primary: '#3ecf8e', secondary: '#1c1c28' },
          duration: 3000,
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#1c1c28' },
          duration: 4000,
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ ...t.style, padding: '8px 32px 8px 12px', position: 'relative' }}>
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              <button
                onClick={() => toast.dismiss(t.id)}
                style={{
                  position: 'absolute', top: '6px', right: '8px',
                  background: 'transparent', border: 'none', color: '#6b6b80',
                  cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px 4px',
                  borderRadius: '4px', transition: 'color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#f0f0f5')}
                onMouseOut={e => (e.currentTarget.style.color = '#6b6b80')}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
