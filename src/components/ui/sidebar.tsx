'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, History, Settings, Shield, LogOut, FolderPlus,
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';

interface SidebarProps {
  userEmail: string;
  onLogout: () => void;
  onNewProject?: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'History', href: '#', icon: History, disabled: true },
  { label: 'Settings', href: '#', icon: Settings, disabled: true },
];

export function Sidebar({ userEmail, onLogout, onNewProject }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const w = collapsed ? 72 : 256;

  return (
    <aside style={{
      width: w, minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column',
      background: '#ffffff', borderRight: '1px solid #e2e8f0',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Brand */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
        }}>
          <Shield style={{ width: 20, height: 20, color: 'white' }} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>ShieldSync</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Compliance Suite</div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname?.startsWith('/project'));
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.disabled ? '#' : item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '10px 14px' : '10px 16px',
                borderRadius: 10, textDecoration: 'none',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#3b82f6' : '#64748b',
                fontWeight: isActive ? 600 : 500, fontSize: 14,
                transition: 'all 0.15s',
                opacity: item.disabled ? 0.4 : 1,
                cursor: item.disabled ? 'default' : 'pointer',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* New Project Button */}
      {onNewProject && (
        <div style={{ padding: '0 12px 12px' }}>
          <button onClick={onNewProject} style={{
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
            <FolderPlus style={{ width: 18, height: 18, flexShrink: 0 }} />
            {!collapsed && 'New Project'}
          </button>
        </div>
      )}

      {/* Help */}
      <div style={{ padding: '0 12px 8px' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: collapsed ? '10px 14px' : '10px 16px',
          borderRadius: 10, border: 'none', background: 'transparent',
          color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}>
          <HelpCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
          {!collapsed && 'Help & Support'}
        </button>
      </div>

      {/* Logout */}
      <div style={{ padding: '0 12px 8px' }}>
        <button onClick={onLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: collapsed ? '10px 14px' : '10px 16px',
          borderRadius: 10, border: 'none', background: 'transparent',
          color: '#94a3b8', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}>
          <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
          {!collapsed && 'Log Out'}
        </button>
      </div>

      {/* User Profile */}
      <div style={{
        padding: collapsed ? '14px 12px' : '14px 20px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
        }}>
          {userEmail ? userEmail[0].toUpperCase() : 'U'}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail || 'User'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Admin</div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        position: 'absolute', top: 28, right: -14,
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', border: '1px solid #e2e8f0',
        color: '#64748b', cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        transition: 'all 0.2s', zIndex: 60,
      }}>
        {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <ChevronLeft style={{ width: 14, height: 14 }} />}
      </button>
    </aside>
  );
}
