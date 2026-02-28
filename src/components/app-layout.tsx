'use client';

import React from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  onLogout: () => void;
  onNewProject?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AppLayout({ children, userEmail, onLogout, onNewProject, breadcrumbs }: AppLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar userEmail={userEmail} onLogout={onLogout} onNewProject={onNewProject} />

      {/* Main content — offset by sidebar width */}
      <div style={{ flex: 1, marginLeft: 256, minHeight: '100vh', transition: 'margin-left 0.25s' }}>
        {/* Top breadcrumb bar */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div style={{
            padding: '14px 40px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight style={{ width: 14, height: 14, color: '#94a3b8' }} />}
                {crumb.href ? (
                  <Link href={crumb.href} style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Content area */}
        <main style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
