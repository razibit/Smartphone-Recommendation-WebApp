'use client';

import React, { useState, useEffect } from 'react';

interface ModalSQLPopupProps {
  query: string;
  executionTime?: number;
  resultCount?: number;
  onClose: () => void;
}

export default function ModalSQLPopup({ 
  query, 
  executionTime, 
  resultCount,
  onClose 
}: ModalSQLPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  const formatExecutionTime = (time?: number) => {
    if (!time && time !== 0) return 'N/A';
    if (time < 1) return '<1ms';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  // Get preview text (first 2-3 lines)
  const getPreviewText = (sqlQuery: string) => {
    const lines = sqlQuery.split('\n').filter(line => line.trim());
    return lines.slice(0, 3).join('\n');
  };

  // SQL Syntax Highlighter (simplified for preview)
  const highlightSQL = (sqlQuery: string): React.ReactNode[] => {
    if (!sqlQuery) return [];

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS',
      'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MIN', 'MAX', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
      'IS', 'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION'
    ];

    const tokenRegex = new RegExp([
      '(--[^\r\n]*)', // Comments
      '(\'(?:[^\']|\'\')*\'|"(?:[^"]|"")*")', // Strings
      '(\\b\\d+(?:\\.\\d+)?\\b)', // Numbers
      `(\\b(?:${keywords.join('|')})\\b)`, // Keywords
      '([\\+\\-\\*\\/\\=\\<\\>\\!\\(\\)\\,\\;\\.])', // Operators
      '(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)', // Identifiers
      '(\\s+)' // Whitespace
    ].join('|'), 'gi');

    const tokens: React.ReactNode[] = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(sqlQuery)) !== null) {
      if (match.index > lastIndex) {
        const unmatched = sqlQuery.slice(lastIndex, match.index);
        tokens.push(<span key={`unmatched-${lastIndex}`}>{unmatched}</span>);
      }

      const matchText = match[0];
      let tokenClass = 'text-gray-700 dark:text-gray-300';

      if (match[1]) tokenClass = 'text-green-600 dark:text-green-400 italic'; // Comment
      else if (match[2]) tokenClass = 'text-amber-600 dark:text-amber-400'; // String
      else if (match[3]) tokenClass = 'text-blue-600 dark:text-blue-400'; // Number
      else if (match[4]) tokenClass = 'text-purple-600 dark:text-purple-400 font-semibold'; // Keyword
      else if (match[5]) tokenClass = 'text-pink-600 dark:text-pink-400'; // Operator
      else if (match[6]) tokenClass = 'text-cyan-600 dark:text-cyan-400'; // Identifier

      tokens.push(
        <span key={`token-${match.index}`} className={tokenClass}>
          {matchText}
        </span>
      );

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < sqlQuery.length) {
      const remaining = sqlQuery.slice(lastIndex);
      tokens.push(<span key={`remaining-${lastIndex}`}>{remaining}</span>);
    }

    return tokens;
  };

  if (!query) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-80 max-w-sm">
      <div className={`transition-all duration-300 flex flex-col ${
        isExpanded ? 'max-h-96' : 'max-h-32'
      }`}>
        
        {/* Header - Always Visible */}
        <div 
          className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0 ${
            !isExpanded ? 'border-b border-gray-200 dark:border-gray-700' : ''
          }`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
                SQL Details
              </h3>
              
              {/* Stats */}
              <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                {executionTime !== undefined && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatExecutionTime(executionTime)}</span>
                  </div>
                )}
                
                {resultCount !== undefined && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{resultCount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Expand/Collapse Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                <svg 
                  className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Close"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview Text (when minimized) */}
          {!isExpanded && (
            <div className="mt-2">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <div className="max-h-16 overflow-hidden">
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    <code>
                      {highlightSQL(getPreviewText(query))}
                    </code>
                  </pre>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Click to expand...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '240px' }}>
            {/* Action Buttons */}
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {query.length} characters
              </div>
              <button
                onClick={handleCopyQuery}
                className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 transition-colors duration-200"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Full Query Display - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900" 
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF #F3F4F6'
              }}
            >
              <div className="p-3">
                <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  <code>
                    {highlightSQL(query)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}