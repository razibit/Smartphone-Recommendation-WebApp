'use client';

import React, { useState, useEffect } from 'react';

interface SQLQueryBoxProps {
  query: string;
  visible?: boolean;
  executionTime?: number;
  resultCount?: number;
  onToggleVisibility?: (visible: boolean) => void;
}

interface SQLToken {
  type: 'keyword' | 'string' | 'number' | 'operator' | 'identifier' | 'comment' | 'whitespace';
  value: string;
}

export default function SQLQueryBox({ 
  query, 
  visible = true, 
  executionTime, 
  resultCount,
  onToggleVisibility 
}: SQLQueryBoxProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleToggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onToggleVisibility?.(newVisibility);
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy query:', err);
    }
  };

  // SQL Syntax Highlighter
  const highlightSQL = (sqlQuery: string): JSX.Element[] => {
    if (!sqlQuery) return [];

    // SQL Keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS',
      'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MIN', 'MAX', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
      'IS', 'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION',
      'INTERSECT', 'EXCEPT', 'WITH', 'RECURSIVE', 'CTE', 'OVER', 'PARTITION', 'ROW_NUMBER',
      'INT', 'VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'DECIMAL', 'BOOLEAN', 'PRIMARY',
      'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'NOT', 'AUTO_INCREMENT', 'DEFAULT',
      'COALESCE', 'GREATEST', 'LEAST', 'JSON_OBJECT', 'JSON_ARRAYAGG'
    ];

    // Create regex for tokenization
    const tokenRegex = new RegExp([
      // Comments (-- comment)
      '(--[^\r\n]*)',
      // Strings (single or double quoted)
      '(\'(?:[^\']|\'\')*\'|"(?:[^"]|"")*")',
      // Numbers (integers and decimals)
      '(\\b\\d+(?:\\.\\d+)?\\b)',
      // Keywords
      `(\\b(?:${keywords.join('|')})\\b)`,
      // Operators and punctuation
      '([\\+\\-\\*\\/\\=\\<\\>\\!\\(\\)\\,\\;\\.])',
      // Identifiers (table names, column names, etc.)
      '(\\b[a-zA-Z_][a-zA-Z0-9_]*\\b)',
      // Whitespace
      '(\\s+)'
    ].join('|'), 'gi');

    const tokens: JSX.Element[] = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(sqlQuery)) !== null) {
      // Add any unmatched content before this match
      if (match.index > lastIndex) {
        const unmatched = sqlQuery.slice(lastIndex, match.index);
        tokens.push(<span key={`unmatched-${lastIndex}`}>{unmatched}</span>);
      }

      const matchText = match[0];
      let tokenType: string = 'default';
      let tokenClass = 'text-gray-300';

      // Determine token type and styling
      if (match[1]) { // Comment
        tokenType = 'comment';
        tokenClass = 'text-green-400 italic';
      } else if (match[2]) { // String
        tokenType = 'string';
        tokenClass = 'text-yellow-300';
      } else if (match[3]) { // Number
        tokenType = 'number';
        tokenClass = 'text-blue-300';
      } else if (match[4]) { // Keyword
        tokenType = 'keyword';
        tokenClass = 'text-purple-300 font-semibold';
      } else if (match[5]) { // Operator
        tokenType = 'operator';
        tokenClass = 'text-pink-300';
      } else if (match[6]) { // Identifier
        tokenType = 'identifier';
        tokenClass = 'text-cyan-300';
      } else if (match[7]) { // Whitespace
        tokenType = 'whitespace';
        tokenClass = '';
      }

      tokens.push(
        <span key={`${tokenType}-${match.index}`} className={tokenClass}>
          {matchText}
        </span>
      );

      lastIndex = tokenRegex.lastIndex;
    }

    // Add any remaining content
    if (lastIndex < sqlQuery.length) {
      const remaining = sqlQuery.slice(lastIndex);
      tokens.push(<span key={`remaining-${lastIndex}`}>{remaining}</span>);
    }

    return tokens;
  };

  const formatExecutionTime = (time?: number) => {
    if (!time && time !== 0) return 'N/A';
    if (time < 1) return '<1ms';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              SQL Query Visualization
            </h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {executionTime !== undefined && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formatExecutionTime(executionTime)}</span>
                </div>
              )}
              
              {resultCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">{resultCount} results</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 dark:text-green-400 font-medium">Executed</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyQuery}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title="Copy query to clipboard"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleVisibility}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title={isVisible ? "Hide query" : "Show query"}
              >
                {isVisible ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Query Content */}
      {isVisible && (
        <div className="relative">
          {/* Code Block */}
          <div className="bg-gray-900 dark:bg-gray-950 p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
              <code>
                {highlightSQL(query)}
              </code>
            </pre>
          </div>

          {/* Query Analysis Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Query Length: {query.length} characters</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span>Normalized Tables: {(query.match(/FROM|JOIN/gi) || []).length} joins</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 This query demonstrates database normalization across multiple related tables
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed State */}
      {!isVisible && (
        <div className="px-6 py-4 text-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Click "Show" to view the SQL query that generated these results
          </div>
        </div>
      )}
    </div>
  );
}