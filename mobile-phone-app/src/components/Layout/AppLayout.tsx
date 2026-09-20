'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/phones', label: 'Browse Phones', icon: '▣' },
  { href: '/compare', label: 'Compare', icon: '⇄' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className={
        isScrolled
          ? 'sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/95'
          : 'sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
      }>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <Link href="/" className="flex items-center gap-3" aria-label="PhoneDB home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-lg font-bold text-white">
                P
              </span>
              <span>
                <span className="block text-lg font-bold text-gray-950 dark:text-white">PhoneDB</span>
                <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">Mobile phone catalogue</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={
                    isActive(item.href)
                      ? 'rounded-lg bg-primary-50 px-4 py-2 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'rounded-lg px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }
                >
                  <span aria-hidden="true" className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span aria-hidden="true" className="text-xl">{isMobileMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 top-16 z-30 bg-black/30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div id="mobile-navigation" className="relative z-40 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
              <div className="mx-auto max-w-7xl space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={
                      isActive(item.href)
                        ? 'block rounded-lg bg-primary-50 px-4 py-3 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'block rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  >
                    <span aria-hidden="true" className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="font-semibold text-gray-950 dark:text-white">PhoneDB</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">
              A structured catalogue for researching and comparing mobile phone specifications.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-950 dark:text-white">Explore</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/phones" className="hover:text-primary-600 dark:hover:text-primary-400">Browse phones</Link>
              <Link href="/compare" className="hover:text-primary-600 dark:hover:text-primary-400">Compare devices</Link>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-950 dark:text-white">Technology</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Next.js, React, TypeScript, Express, and MySQL.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
          PhoneDB · Structured device information for informed comparison
        </div>
      </footer>
    </div>
  );
}
