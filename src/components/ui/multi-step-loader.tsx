"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ active }: { active?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
    style={{ width: '22px', height: '22px', color: active ? '#3ecf8e' : '#a0a0b0' }}>
    <path fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd" />
  </svg>
);

type LoadingState = { text: string };

const LoaderCore = ({ loadingStates, value = 0 }: { loadingStates: LoadingState[]; value?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '400px', margin: '0 auto' }}>
    {loadingStates.map((state, index) => {
      const distance = Math.abs(index - value);
      const opacity = Math.max(1 - distance * 0.25, 0.15);
      const isActive = index === value;
      const isDone = index < value;

      return (
        <motion.div
          key={index}
          animate={{ opacity, x: isActive ? 4 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 16px', borderRadius: '10px',
            background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
          }}
        >
          <div style={{ flexShrink: 0 }}>
            {isDone ? (
              <CheckFilled />
            ) : isActive ? (
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: '2px solid #7c3aed', borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <CheckIcon />
            )}
          </div>
          <span style={{
            fontSize: '15px', fontWeight: isActive ? 600 : 400,
            color: isActive ? '#d4b5ff' : isDone ? '#3ecf8e' : '#6b6b80',
            transition: 'color 0.3s ease',
          }}>
            {state.text}
          </span>
        </motion.div>
      );
    })}
  </div>
);

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prev) =>
        loop
          ? prev === loadingStates.length - 1 ? 0 : prev + 1
          : Math.min(prev + 1, loadingStates.length - 1)
      );
    }, duration);
    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(6,6,12,0.92)', backdropFilter: 'blur(20px)',
          }}
        >
          {/* Subtle gradient glow behind loader */}
          <div style={{
            position: 'absolute', width: '500px', height: '500px',
            borderRadius: '50%', filter: 'blur(120px)', opacity: 0.25,
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          }} />

          {/* Loader card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{
              position: 'relative', zIndex: 10,
              padding: '40px 36px', borderRadius: '20px',
              background: 'rgba(22,22,31,0.85)', border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.1)',
              minWidth: '420px',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '28px', paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" style={{ width: '18px', height: '18px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
                Generating Answers
              </span>
            </div>

            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
