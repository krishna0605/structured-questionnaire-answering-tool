"use client";

import React from "react";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ style, ...props }, ref) => (
  <label
    ref={ref}
    style={{
      display: 'block', fontSize: '14px', fontWeight: 600,
      color: '#d0d0dd', marginBottom: '8px', lineHeight: 1,
      ...style,
    }}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
