import type { DataConnection } from 'peerjs';

export const CHUNK_SIZE = 64 * 1024; // 64 KB
const MAX_BUFFERED_AMOUNT = 1 * 1024 * 1024; // 1 MB backpressure threshold
const BACKPRESSURE_CHECK_INTERVAL = 50; // ms

export interface FileMetadata {
  type: 'file-meta';
  name: string;
  size: number;
  mimeType: string;
  totalChunks: number;
  chunkSize: number;
}

export interface TransferComplete {
  type: 'transfer-complete';
}

export interface TransferProgress {
  bytesSent: number;
  totalBytes: number;
  chunkIndex: number;
  totalChunks: number;
  percentage: number;
  startTime: number;
  elapsedMs: number;
  speedBytesPerSec: number;
  etaSeconds: number;
}

function waitForDrain(conn: DataConnection): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      const dc = (conn as any).dataChannel as RTCDataChannel | undefined;
      if (!dc || dc.bufferedAmount <= MAX_BUFFERED_AMOUNT) {
        resolve();
      } else {
        setTimeout(check, BACKPRESSURE_CHECK_INTERVAL);
      }
    };
    check();
  });
}

function readChunk(file: File, offset: number, size: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const slice = file.slice(offset, offset + size);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file chunk'));
    reader.readAsArrayBuffer(slice);
  });
}

export async function sendFile(
  conn: DataConnection,
  file: File,
  onProgress: (progress: TransferProgress) => void,
): Promise<void> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // Step 1: Send metadata
  const meta: FileMetadata = {
    type: 'file-meta',
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    totalChunks,
    chunkSize: CHUNK_SIZE,
  };
  conn.send(JSON.stringify(meta));

  // Step 2: Stream chunks with backpressure
  const startTime = Date.now();

  for (let i = 0; i < totalChunks; i++) {
    if (!conn.open) {
      throw new Error('Connection closed during transfer');
    }

    const offset = i * CHUNK_SIZE;
    const chunk = await readChunk(file, offset, CHUNK_SIZE);

    await waitForDrain(conn);
    conn.send(chunk);

    // Report progress
    const bytesSent = Math.min(offset + chunk.byteLength, file.size);
    const elapsedMs = Date.now() - startTime;
    const speedBytesPerSec = elapsedMs > 0 ? (bytesSent / elapsedMs) * 1000 : 0;
    const remainingBytes = file.size - bytesSent;
    const etaSeconds = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

    onProgress({
      bytesSent,
      totalBytes: file.size,
      chunkIndex: i,
      totalChunks,
      percentage: Math.round((bytesSent / file.size) * 100),
      startTime,
      elapsedMs,
      speedBytesPerSec,
      etaSeconds,
    });
  }

  // Step 3: Send completion signal
  const complete: TransferComplete = { type: 'transfer-complete' };
  conn.send(JSON.stringify(complete));
}
