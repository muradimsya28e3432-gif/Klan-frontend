import { io } from 'socket.io-client';

const clean = (v = '') => String(v).trim().replace(/\/+$/, '').replace(/\/api$/, '');
const PROD_API = 'https://klan-backend-production.up.railway.app';
const SOCKET_URL = clean(import.meta.env.VITE_SOCKET_URL) || clean(import.meta.env.VITE_API_URL) || PROD_API;

let socket = null;

export function connectSocket(token) {
  disconnectSocket();
  socket = io(SOCKET_URL, { auth: { token } });
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