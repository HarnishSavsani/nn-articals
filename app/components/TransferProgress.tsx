'use client';

import type { TransferProgress as Progress } from '../lib/chunker';
import { formatBytes, formatEta } from '../lib/assembler';
import type { ConnectionState } from '../lib/peer';
import { IconFile, IconCheck, IconX } from './Icons';

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
    <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      {/* File info */}
      <div className="mb-4 flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          isComplete ? 'bg-success/10' : isError ? 'bg-danger/10' : 'bg-nexus-500/10'
        }`}>
          {isComplete ? (
            <IconCheck size={20} className="text-success" />
          ) : isError ? (
            <IconX size={20} className="text-danger" />
          ) : (
            <IconFile size={20} className="text-nexus-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{fileName}</p>
          <p className="text-sm text-muted">{formatBytes(fileSize)}</p>
        </div>
        {isComplete && (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            {role === 'sender' ? 'Sent' : 'Downloaded'}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-3 overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-success'
              : isError
                ? 'bg-danger'
                : 'bg-nexus-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
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
