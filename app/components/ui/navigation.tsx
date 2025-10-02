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
    { href: '/generate', label: 'Generate' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/templates', label: 'Templates' },
    { href: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string): boolean => pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Content Generator
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              API: {process.env.NEXT_PUBLIC_API_URL || 'localhost:8000'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
