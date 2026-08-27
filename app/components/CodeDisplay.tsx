'use client';

import { useState } from 'react';
import type { ConnectionState } from '../lib/peer';

interface CodeDisplayProps {
  code: string;
  state: ConnectionState;
}

export default function CodeDisplay({ code, state }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
    }
  };

  const formatted = code.slice(0, 3) + ' ' + code.slice(3);

  const statusConfig: Record<string, { color: string; text: string; pulse?: boolean }> = {
    waiting: { color: 'bg-amber-500', text: 'Waiting for receiver...', pulse: true },
    connecting: { color: 'bg-amber-500', text: 'Connecting...', pulse: true },
    connected: { color: 'bg-green-500', text: 'Receiver connected' },
    transferring: { color: 'bg-nexus-500', text: 'Transferring...', pulse: true },
    completed: { color: 'bg-green-500', text: 'Transfer complete' },
    error: { color: 'bg-red-500', text: 'Connection error' },
  };

  const status = statusConfig[state];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-center">
      <p className="mb-4 text-sm text-muted">Share this code with the receiver</p>
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="font-mono text-4xl font-bold tracking-[0.3em] text-foreground">
          {formatted}
        </span>
        <button
          onClick={handleCopy}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          title="Copy code"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      {status && (
        <div className="flex items-center justify-center gap-2">
          <span className={`inline-block h-2 w-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-muted">{status.text}</span>
        </div>
      )}
    </div>
  );
}
