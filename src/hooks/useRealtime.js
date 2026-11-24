import { useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket';
import { duelUpdated } from '../redux/duelSlice';
import { addMessage } from '../redux/chatSlice';
import { fetchBalance } from '../redux/walletSlice';
import { addIncoming, fetchClans, fetchMyRequests } from '../redux/clansSlice';
import { addFriendIncoming, fetchFriends, fetchFriendRequests } from '../redux/friendsSlice';
import { fetchProfile } from '../redux/usersSlice';
import { fetchProgress } from '../redux/progressSlice';
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
    const join = () => {
      const id = store.getState().duel.duel?.id;
      if (id) s.emit('duel:join', id);
      s.emit('clan:join'); // klan otağına qoşul (klan çatı üçün)
    };
    s.on('connect', join); // yenidən qoşulanda da otaqlara qayıt
    s.on('duel:update', (d) => dispatch(duelUpdated(d)));
    s.on('duel:finished', (d) => { dispatch(duelUpdated(d)); dispatch(fetchBalance()); dispatch(fetchProgress()); });
    s.on('chat:message', (m) => dispatch(addMessage({ message: m, meId: store.getState().auth.user?.id })));

    // --- Klan istəkləri ---
    s.on('clan:request', (r) => dispatch(addIncoming(r)));
    s.on('clan:accepted', (d) => {
      dispatch(fetchProfile()); dispatch(fetchClans()); dispatch(fetchMyRequests());
      s.emit('clan:join'); // yeni klanın otağına qoşul
      dispatch(showToast({ type: 'success', text: d.message }));
    });
    s.on('clan:rejected', (d) => {
      dispatch(showToast({ type: 'error', text: d.message }));
      dispatch(fetchMyRequests()).then((r) => { // bu rədd sonradan təkrar göstərilməsin
        if (fetchMyRequests.fulfilled.match(r)) markRejectedSeen(r.payload);
      });
    });

    // --- Dostluq ---
    s.on('friend:request', (r) => {
      dispatch(addFriendIncoming(r));
      dispatch(showToast({ type: 'success', text: `${r.username || 'İstifadəçi'} sizə dostluq istəyi göndərdi` }));
    });
    s.on('friend:accepted', (d) => {
      dispatch(fetchFriends()); dispatch(fetchFriendRequests());
      if (d && d.message) dispatch(showToast({ type: 'success', text: d.message }));
    });

    s.on('connect_error', (e) => { if (/Giriş/.test(e.message)) dispatch(logout()); });
    return () => disconnectSocket();
  }, [token, dispatch, store]);

  useEffect(() => { if (duelId) getSocket()?.emit('duel:join', duelId); }, [duelId]);
}