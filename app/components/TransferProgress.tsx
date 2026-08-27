'use client';

import type { TransferProgress as Progress } from '../lib/chunker';
import { formatBytes, formatEta } from '../lib/assembler';
import type { ConnectionState } from '../lib/peer';

interface TransferProgressProps {
  fileName: string;
  fileSize: number;
  progress: Progress | null;
  role: 'sender' | 'receiver';
  state: ConnectionState;
}

export default function TransferProgress({
  fileName,
  fileSize,
  progress,
  role,
  state,
}: TransferProgressProps) {
  const percentage = progress?.percentage ?? 0;
  const isComplete = state === 'completed';
  const isError = state === 'error';

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      {/* File info */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-500/10">
          {isComplete ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isError ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nexus-500">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <polyline points="13 2 13 9 20 9" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted">{formatBytes(fileSize)}</p>
        </div>
        {isComplete && (
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
            {role === 'sender' ? 'Sent' : 'Downloaded'}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-3 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-green-500'
              : isError
                ? 'bg-red-500'
                : 'bg-nexus-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {isComplete
            ? 'Transfer complete!'
            : isError
              ? 'Transfer failed'
              : `${percentage}% — ${formatBytes(progress?.bytesSent ?? 0)} / ${formatBytes(fileSize)}`}
        </span>
        {progress && !isComplete && !isError && (
          <div className="flex items-center gap-4">
            <span>{formatBytes(progress.speedBytesPerSec)}/s</span>
            <span>ETA: {formatEta(progress.etaSeconds)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
