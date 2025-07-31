import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile Phone Recommendation System",
  description: "A DBMS course project demonstrating database normalization with phone filtering and comparison functionality",
  keywords: ["mobile phones", "database", "normalization", "DBMS", "phone comparison", "filter"],
  authors: [{ name: "DBMS Course Project" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📱</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      Mobile Phone Finder
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      DBMS Normalization Demo
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  Home
                </a>
                <a
                  href="/phones"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  Browse Phones
                </a>
                <a
                  href="/compare"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
                >
                  Compare
                </a>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2"
                  aria-label="Toggle menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  About This Project
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A full-stack web application demonstrating database normalization (3NF/BCNF) principles 
                  with a mobile phone recommendation and comparison system.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Features
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Advanced phone filtering</li>
                  <li>• Side-by-side comparison</li>
                  <li>• SQL query visualization</li>
                  <li>• Normalized database design</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Tech Stack
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Next.js + TypeScript</li>
                  <li>• Express.js + MySQL</li>
                  <li>• Tailwind CSS</li>
                  <li>• Database Normalization</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                © 2024 DBMS Course Project - Mobile Phone Recommendation System
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
