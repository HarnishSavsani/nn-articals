'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import {
  generateCode,
  createSenderPeer,
  createReceiverPeer,
  cleanupPeer,
  type ConnectionState,
} from '../lib/peer';
import { sendFile, type TransferProgress as Progress } from '../lib/chunker';
import {
  createAssembler,
  processMessage,
  buildDownloadUrl,
  triggerDownload,
  revokeDownloadUrl,
  formatBytes,
  type AssemblerState,
} from '../lib/assembler';
import FileDropZone from '../components/FileDropZone';
import CodeDisplay from '../components/CodeDisplay';
import CodeInput from '../components/CodeInput';
import TransferProgress from '../components/TransferProgress';
import { IconUpload, IconDownload, IconArrowLeft } from '../components/Icons';

type Mode = 'choose' | 'send' | 'receive';

export default function SharePage() {
  const [mode, setMode] = useState<Mode>('choose');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [code, setCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [receivedMeta, setReceivedMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const assemblerRef = useRef<AssemblerState | null>(null);
  const completedRef = useRef(false); // tracks completion across closures

  // Cleanup on unmount or mode change
  useEffect(() => {
    return () => {
      cleanupPeer(peerRef.current, connRef.current);
      peerRef.current = null;
      connRef.current = null;
    };
  }, [mode]);

  const resetState = useCallback(() => {
    cleanupPeer(peerRef.current, connRef.current);
    peerRef.current = null;
    connRef.current = null;
    assemblerRef.current = null;
    completedRef.current = false;
    if (downloadInfo?.url) revokeDownloadUrl(downloadInfo.url);
    setMode('choose');
    setConnectionState('idle');
    setCode('');
    setFile(null);
    setReceivedMeta(null);
    setProgress(null);
    setError(null);
    setDownloadInfo(null);
  }, [downloadInfo]);

  // ── SENDER FLOW ──────────────────────────────────────────────

  const handleStartSending = useCallback(async () => {
    if (!file) return;

    try {
      const newCode = generateCode();
      setCode(newCode);
      setConnectionState('waiting');
      setError(null);

      const { peer, waitForReceiver, destroy } = await createSenderPeer(newCode);
      peerRef.current = peer;

      // Wait for receiver to connect
      const conn = await waitForReceiver();
      connRef.current = conn;
      setConnectionState('connected');

      // Start transfer immediately
      setConnectionState('transferring');
      await sendFile(conn, file, (p) => setProgress(p));

      setConnectionState('completed');

      // Cleanup after short delay so UI shows "completed"
      setTimeout(() => {
        conn.close();
      }, 2000);
    } catch (err) {
      setConnectionState('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [file]);

  // ── RECEIVER FLOW ────────────────────────────────────────────

  const handleConnect = useCallback(async (enteredCode: string) => {
    try {
      setCode(enteredCode);
      setConnectionState('connecting');
      setError(null);
      completedRef.current = false;

      const { peer, conn, destroy } = await createReceiverPeer(enteredCode);
      peerRef.current = peer;
      connRef.current = conn;
      setConnectionState('connected');

      // Set up assembler
      const assembler = createAssembler();
      assemblerRef.current = assembler;

      conn.on('data', (data: unknown) => {
        const result = processMessage(assembler, data);

        switch (result.event) {
          case 'meta':
            if (assembler.metadata) {
              setReceivedMeta({
                name: assembler.metadata.name,
                size: assembler.metadata.size,
              });
              setConnectionState('transferring');
            }
            break;
          case 'chunk':
            if (result.progress) {
              setProgress(result.progress);
            }
            break;
          case 'complete': {
            completedRef.current = true;
            setConnectionState('completed');

            // Build download URL and attempt auto-download
            const info = buildDownloadUrl(assembler);
            setDownloadInfo(info);
            triggerDownload(info.url, info.filename);

            break;
          }
          case 'error':
            setConnectionState('error');
            setError(result.error ?? 'Transfer error');
            break;
        }
      });

      // Use ref instead of state to avoid stale closure
      conn.on('close', () => {
        if (!completedRef.current) {
          setConnectionState('error');
          setError('Connection closed by sender');
        }
      });

      conn.on('error', (err) => {
        if (!completedRef.current) {
          setConnectionState('error');
          setError(err.message);
        }
      });
    } catch (err) {
      setConnectionState('error');
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, []);

  // ── RENDER ───────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-xl">
      {/* Article-style header */}
      <div className="mb-8">
        <span className="mb-3 inline-block rounded-full bg-nexus-500/10 px-3 py-1 text-xs font-medium text-nexus-500">
          Contributing
        </span>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Share Your Insights
        </h1>
        <p className="text-muted">
          Exchange knowledge resources directly with your colleagues through a
          secure peer-to-peer connection.
        </p>
      </div>

      {/* Mode selector */}
      {mode === 'choose' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => setMode('send')}
            className="group rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-nexus-500/50 hover:shadow-lg hover:shadow-nexus-500/5 sm:p-8"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-nexus-500/10">
              <IconUpload size={24} className="text-nexus-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-nexus-500">
              Share a Resource
            </h3>
            <p className="text-sm text-muted">
              Upload a file and get a sharing code
            </p>
          </button>

          <button
            onClick={() => setMode('receive')}
            className="group rounded-xl border border-border bg-surface p-6 text-left transition-all hover:border-nexus-500/50 hover:shadow-lg hover:shadow-nexus-500/5 sm:p-8"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-nexus-500/10">
              <IconDownload size={24} className="text-nexus-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-nexus-500">
              Receive a Resource
            </h3>
            <p className="text-sm text-muted">
              Enter a code to download a shared file
            </p>
          </button>
        </div>
      )}

      {/* Sender flow */}
      {mode === 'send' && (
        <div className="space-y-6">
          <FileDropZone
            onFileSelected={setFile}
            disabled={connectionState !== 'idle'}
            selectedFile={file}
          />

          {file && connectionState === 'idle' && (
            <button
              onClick={handleStartSending}
              className="w-full rounded-lg bg-nexus-500 px-4 py-3 font-medium text-white transition-colors hover:bg-nexus-600 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Start Sharing
            </button>
          )}

          {connectionState !== 'idle' && code && (
            <CodeDisplay code={code} state={connectionState} />
          )}

          {(connectionState === 'transferring' || connectionState === 'completed') &&
            file && (
              <TransferProgress
                fileName={file.name}
                fileSize={file.size}
                progress={progress}
                role="sender"
                state={connectionState}
              />
            )}

          {connectionState === 'error' && error && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-center">
              <p className="mb-3 text-sm text-danger">{error}</p>
              <button
                onClick={resetState}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90"
              >
                Try Again
              </button>
            </div>
          )}

          {connectionState === 'completed' && (
            <button
              onClick={resetState}
              className="w-full rounded-lg border border-nexus-500 px-4 py-3 font-medium text-nexus-500 transition-colors hover:bg-nexus-500/5"
            >
              Share Another Resource
            </button>
          )}
        </div>
      )}

      {/* Receiver flow */}
      {mode === 'receive' && (
        <div className="space-y-6">
          {connectionState === 'idle' && (
            <CodeInput
              onSubmit={handleConnect}
              disabled={false}
              error={error}
            />
          )}

          {connectionState === 'connecting' && (
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-warning" />
                <span className="text-sm text-muted">
                  Connecting to sender...
                </span>
              </div>
            </div>
          )}

          {receivedMeta && (connectionState === 'transferring' || connectionState === 'completed') && (
            <TransferProgress
              fileName={receivedMeta.name}
              fileSize={receivedMeta.size}
              progress={progress}
              role="receiver"
              state={connectionState}
            />
          )}

          {connectionState === 'error' && error && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-center">
              <p className="mb-3 text-sm text-danger">{error}</p>
              <button
                onClick={resetState}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90"
              >
                Try Again
              </button>
            </div>
          )}

          {connectionState === 'completed' && (
            <div className="space-y-3">
              {downloadInfo && (
                <a
                  href={downloadInfo.url}
                  download={downloadInfo.filename}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-nexus-500 px-4 py-3 font-medium text-white transition-colors hover:bg-nexus-600"
                >
                  <IconDownload size={20} />
                  Save File — {downloadInfo.filename}
                </a>
              )}
              <button
                onClick={resetState}
                className="w-full rounded-lg border border-nexus-500 px-4 py-3 font-medium text-nexus-500 transition-colors hover:bg-nexus-500/5"
              >
                Receive Another Resource
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back button */}
      {mode !== 'choose' && (
        <button
          onClick={resetState}
          className="mt-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <IconArrowLeft size={16} />
          Back to options
        </button>
      )}
    </div>
  );
}
