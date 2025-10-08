'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="bg-white shadow-sm" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                aria-label="Content Generator Home"
              >
                Content Generator
              </Link>
            </div>

            {/* Navigation Links */}
            <div
              className="hidden sm:ml-8 sm:flex sm:space-x-8"
              role="navigation"
            >
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${
                    isActive(item.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500" aria-label="API endpoint">
              API: {process.env.NEXT_PUBLIC_API_URL || 'localhost:8000'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
