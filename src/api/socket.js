import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  disconnectSocket();
  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, { auth: { token } });
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