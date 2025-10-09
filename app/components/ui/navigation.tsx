'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './theme-toggle';

/**
 * Navigation Component
 * Main navigation bar for the dashboard
 */
const Navigation = (): React.ReactElement => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/campaigns', label: 'Campaigns' },
    { href: '/generate', label: 'Generate' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/history', label: 'History' },
    { href: '/templates', label: 'Templates' },
    { href: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string): boolean => pathname === path;

  return (
    <nav className="tb-topbar" aria-label="Main navigation">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="brand"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent)', textDecoration: 'none' }}
          aria-label="Content Generator Home"
        >
          Content Generator
        </Link>

        {/* Navigation Links */}
        <div className="hidden sm:flex gap-2 ml-4" role="navigation">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'tb-btn primary'
                  : 'tb-btn ghost'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              style={isActive(item.href) ? {} : { padding: '8px 12px' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="right">
        <ThemeToggle />
        <span className="text-sm tb-chip" aria-label="API endpoint" style={{ fontSize: '0.75rem' }}>
          API: {process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname : 'localhost:8000'}
        </span>
      </div>
    </nav>
  );
};

export default Navigation;
