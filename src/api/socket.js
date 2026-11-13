import { io } from 'socket.io-client';

// VITE_SOCKET_URL yoxdursa VITE_API_URL istifadə olunur (adətən eyni serverdir)
const clean = (v = '') => String(v).trim().replace(/\/+$/, '').replace(/\/api$/, '');
const SOCKET_URL = clean(import.meta.env.VITE_SOCKET_URL) || clean(import.meta.env.VITE_API_URL);

if (import.meta.env.PROD && !SOCKET_URL) {
  console.error('VITE_SOCKET_URL / VITE_API_URL təyin olunmayıb! Socket bağlantısı qurulmayacaq.');
}

let socket = null;

export function connectSocket(token) {
  disconnectSocket();
  socket = io(SOCKET_URL || undefined, { auth: { token } });
  return socket;
}
export const getSocket = () => socket;
export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

// ack ilə mesaj göndərir (backend { ok, message } qaytarır)
export const emitAck = (event, payload) => new Promise((resolve, reject) => {
  if (!socket || !socket.connected) return reject(new Error('Çat bağlantısı yoxdur'));
  socket.timeout(5000).emit(event, payload, (err, res) => {
    if (err) return reject(new Error('Server cavab vermədi'));
    if (res && res.ok) return resolve();
    return reject(new Error((res && res.message) || 'Xəta baş verdi'));
  });
});