import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket';
import { duelUpdated } from '../redux/duelSlice';
import { addMessage } from '../redux/chatSlice';
import { fetchBalance } from '../redux/walletSlice';
import { addIncoming, fetchClans, fetchMyRequests } from '../redux/clansSlice';
import { fetchProfile } from '../redux/usersSlice';
import { showToast } from '../redux/uiSlice';
import { markRejectedSeen } from '../utils/seenRequests';
import { logout } from '../redux/authSlice';

// Socket bağlantısı: token olanda qoşulur, çıxışda bağlanır
export default function useRealtime(token) {
  const dispatch = useDispatch();
  const store = useStore();
  const duelId = useSelector((s) => s.duel.duel && s.duel.duel.id);

  useEffect(() => {
    if (!token) return undefined;
    const s = connectSocket(token);
    const join = () => { const id = store.getState().duel.duel?.id; if (id) s.emit('duel:join', id); };
    s.on('connect', join); // yenidən qoşulanda da duel otağına qayıt
    s.on('duel:update', (d) => dispatch(duelUpdated(d)));
    s.on('duel:finished', (d) => { dispatch(duelUpdated(d)); dispatch(fetchBalance()); });
    s.on('chat:message', (m) => dispatch(addMessage({ message: m, meId: store.getState().auth.user?.id })));

    // --- Klan istəkləri ---
    // Klan sahibi: yeni istək gəldi (alert komponenti Redux-dan oxuyub göstərir)
    s.on('clan:request', (r) => dispatch(addIncoming(r)));
    // Oyunçu: istək qəbul edildi
    s.on('clan:accepted', (d) => {
      dispatch(fetchProfile()); dispatch(fetchClans()); dispatch(fetchMyRequests());
      dispatch(showToast({ type: 'success', text: d.message }));
    });
    // Oyunçu: istək rədd edildi
    s.on('clan:rejected', (d) => {
      dispatch(showToast({ type: 'error', text: d.message }));
      dispatch(fetchMyRequests()).then((r) => { // bu rədd sonradan təkrar göstərilməsin
        if (fetchMyRequests.fulfilled.match(r)) markRejectedSeen(r.payload);
      });
    });

    s.on('connect_error', (e) => { if (/Giriş/.test(e.message)) dispatch(logout()); });
    return () => disconnectSocket();
  }, [token, dispatch, store]);

  useEffect(() => { if (duelId) getSocket()?.emit('duel:join', duelId); }, [duelId]);
}