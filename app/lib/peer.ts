import Peer, { DataConnection } from 'peerjs';

const PEER_ID_PREFIX = 'nexushare-';
const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type ConnectionState =
  | 'idle'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'error';

export function generateCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 900000 + 100000).toString();
}

export function codeToPeerId(code: string): string {
  return `${PEER_ID_PREFIX}${code}`;
}

export function createSenderPeer(code: string): Promise<{
  peer: Peer;
  waitForReceiver: () => Promise<DataConnection>;
  destroy: () => void;
}> {
  return new Promise((resolve, reject) => {
    const peerId = codeToPeerId(code);
    const peer = new Peer(peerId, {
      debug: 0,
      config: { iceServers: STUN_SERVERS },
    });

    const timeoutId = setTimeout(() => {
      peer.destroy();
      reject(new Error('Peer registration timed out (15s)'));
    }, 15000);

    peer.on('open', () => {
      clearTimeout(timeoutId);
      resolve({
        peer,
        waitForReceiver: () =>
          new Promise<DataConnection>((res) => {
            peer.on('connection', (conn: DataConnection) => {
              conn.on('open', () => res(conn));
            });
          }),
        destroy: () => peer.destroy(),
      });
    });

    peer.on('error', (err) => {
      clearTimeout(timeoutId);
      if (err.type === 'unavailable-id') {
        reject(new Error('Code already in use. Please try again.'));
      } else {
        reject(new Error(`Connection error: ${err.message}`));
      }
    });
  });
}

export function createReceiverPeer(code: string): Promise<{
  peer: Peer;
  conn: DataConnection;
  destroy: () => void;
}> {
  return new Promise((resolve, reject) => {
    const peer = new Peer({
      debug: 0,
      config: { iceServers: STUN_SERVERS },
    });

    const timeoutId = setTimeout(() => {
      peer.destroy();
      reject(new Error('Connection timed out (15s)'));
    }, 15000);

    peer.on('open', () => {
      const targetId = codeToPeerId(code);
      const conn = peer.connect(targetId, {
        reliable: true,
        serialization: 'none',
      });

      conn.on('open', () => {
        clearTimeout(timeoutId);
        resolve({
          peer,
          conn,
          destroy: () => {
            conn.close();
            peer.destroy();
          },
        });
      });

      conn.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(new Error(`Connection error: ${err.message}`));
      });
    });

    peer.on('error', (err) => {
      clearTimeout(timeoutId);
      if (err.type === 'peer-unavailable') {
        reject(new Error('Invalid code or sender is not available.'));
      } else {
        reject(new Error(`Connection error: ${err.message}`));
      }
    });
  });
}

export function cleanupPeer(peer: Peer | null, conn: DataConnection | null): void {
  try {
    if (conn && conn.open) conn.close();
  } catch { /* ignore */ }
  try {
    if (peer && !peer.destroyed) peer.destroy();
  } catch { /* ignore */ }
}
