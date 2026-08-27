import type { FileMetadata, TransferProgress } from './chunker';

export interface AssemblerState {
  metadata: FileMetadata | null;
  chunks: ArrayBuffer[];
  receivedCount: number;
  bytesReceived: number;
  startTime: number;
  isComplete: boolean;
}

export function createAssembler(): AssemblerState {
  return {
    metadata: null,
    chunks: [],
    receivedCount: 0,
    bytesReceived: 0,
    startTime: 0,
    isComplete: false,
  };
}

export function processMessage(
  state: AssemblerState,
  data: unknown,
): {
  event: 'meta' | 'chunk' | 'complete' | 'error';
  progress?: TransferProgress;
  error?: string;
} {
  // JSON string = control message
  if (typeof data === 'string') {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'file-meta') {
        state.metadata = msg as FileMetadata;
        state.chunks = [];
        state.receivedCount = 0;
        state.bytesReceived = 0;
        state.startTime = Date.now();
        state.isComplete = false;
        return { event: 'meta' };
      }

      if (msg.type === 'transfer-complete') {
        state.isComplete = true;
        return { event: 'complete' };
      }

      return { event: 'error', error: `Unknown message type: ${msg.type}` };
    } catch {
      return { event: 'error', error: 'Failed to parse control message' };
    }
  }

  // ArrayBuffer or Uint8Array = file chunk
  // PeerJS binary serialization may deliver either type
  let buffer: ArrayBuffer | null = null;
  if (data instanceof ArrayBuffer) {
    buffer = data;
  } else if (data instanceof Uint8Array) {
    buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  }

  if (buffer) {
    if (!state.metadata) {
      return { event: 'error', error: 'Received chunk before metadata' };
    }

    state.chunks.push(buffer);
    state.receivedCount++;
    state.bytesReceived += buffer.byteLength;

    const elapsedMs = Date.now() - state.startTime;
    const speedBytesPerSec =
      elapsedMs > 0 ? (state.bytesReceived / elapsedMs) * 1000 : 0;
    const remainingBytes = state.metadata.size - state.bytesReceived;
    const etaSeconds =
      speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

    const progress: TransferProgress = {
      bytesSent: state.bytesReceived,
      totalBytes: state.metadata.size,
      chunkIndex: state.receivedCount - 1,
      totalChunks: state.metadata.totalChunks,
      percentage: Math.round(
        (state.bytesReceived / state.metadata.size) * 100,
      ),
      startTime: state.startTime,
      elapsedMs,
      speedBytesPerSec,
      etaSeconds,
    };

    return { event: 'chunk', progress };
  }

  return { event: 'error', error: `Unexpected data type: ${typeof data}` };
}

export function downloadFile(state: AssemblerState): void {
  if (!state.metadata || !state.isComplete) {
    throw new Error('Cannot download: transfer not complete');
  }

  const blob = new Blob(state.chunks, { type: state.metadata.mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = state.metadata.name;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  // Release chunk memory
  state.chunks = [];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatEta(seconds: number): string {
  if (seconds < 1) return '< 1s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}
