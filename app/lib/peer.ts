import Peer, { DataConnection } from 'peerjs';

const PEER_ID_PREFIX = 'nexushare-';
const CONNECTION_TIMEOUT = 30_000; // 30s — corporate networks are slow

const ICE_SERVERS: RTCIceServer[] = [
  // STUN — discovers your public IP / port mapping
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TURN — relay fallback when STUN can't punch through (corporate symmetric NAT)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
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
      debug: 1,
      config: { iceServers: ICE_SERVERS },
    });

    const timeoutId = setTimeout(() => {
      peer.destroy();
      reject(new Error('Peer registration timed out — signaling server may be unreachable'));
    }, CONNECTION_TIMEOUT);

    peer.on('open', () => {
      clearTimeout(timeoutId);
      resolve({
        peer,
        waitForReceiver: () =>
          new Promise<DataConnection>((res, rej) => {
            const waitTimeout = setTimeout(() => {
              peer.destroy();
              rej(new Error('No receiver connected within 2 minutes — share the code and have them connect'));
            }, 120_000);

            peer.on('connection', (conn: DataConnection) => {
              conn.on('open', () => {
                clearTimeout(waitTimeout);
                res(conn);
              });
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
      debug: 1,
      config: { iceServers: ICE_SERVERS },
    });

    const timeoutId = setTimeout(() => {
      peer.destroy();
      reject(new Error('Connection timed out — the sender code may be wrong or networks can\'t reach each other'));
    }, CONNECTION_TIMEOUT);

    peer.on('open', () => {
      const targetId = codeToPeerId(code);
      const conn = peer.connect(targetId, {
        reliable: true,
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
