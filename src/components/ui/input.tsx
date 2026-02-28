"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={type}
          ref={ref}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          style={{
            display: 'flex', width: '100%', height: '48px',
            borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
            background: '#0f0f17', padding: '0 16px',
            fontSize: '15px', color: 'white', outline: 'none',
            fontFamily: 'inherit', transition: 'border-color 0.2s',
            borderColor: isFocused ? '#7c3aed' : 'rgba(255,255,255,0.1)',
            ...style,
          }}
          {...props}
        />
        {/* Animated bottom border glow */}
        <motion.div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
            borderRadius: '0 0 10px 10px',
            background: 'linear-gradient(90deg, #7c3aed 0%, #6366f1 50%, #a78bfa 100%)',
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
