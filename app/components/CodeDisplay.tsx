'use client';

import { useState } from 'react';
import type { ConnectionState } from '../lib/peer';
import { IconCopy, IconCheck } from './Icons';

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
    waiting: { color: 'bg-warning', text: 'Waiting for receiver...', pulse: true },
    connecting: { color: 'bg-warning', text: 'Connecting...', pulse: true },
    connected: { color: 'bg-success', text: 'Receiver connected' },
    transferring: { color: 'bg-nexus-500', text: 'Transferring...', pulse: true },
    completed: { color: 'bg-success', text: 'Transfer complete' },
    error: { color: 'bg-danger', text: 'Connection error' },
  };

  const status = statusConfig[state];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 text-center">
      <p className="mb-4 text-sm text-muted">Share this code with the receiver</p>
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="font-mono text-3xl font-bold tracking-[0.3em] text-foreground sm:text-4xl">
          {formatted}
        </span>
        <button
          onClick={handleCopy}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          title="Copy code"
        >
          {copied ? (
            <IconCheck size={20} className="text-success" />
          ) : (
            <IconCopy size={20} />
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
