import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageSquare, UserMinus, Loader2, Heart } from 'lucide-react';
import { fetchFriends, fetchFriendRequests, acceptFriend, rejectFriend, removeFriend } from '../redux/friendsSlice';
import { openPrivate } from '../redux/chatSlice';
import { initial } from '../utils/money';

// Profil səhifəsində: dostlar siyahısı + gələn dostluq istəkləri
export default function FriendsPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, incoming } = useSelector((s) => s.friends);
  const [busy, setBusy] = useState(null);

  useEffect(() => { dispatch(fetchFriends()); dispatch(fetchFriendRequests()); }, [dispatch]);

  const answer = async (action, id) => { setBusy(id); await dispatch(action(id)); setBusy(null); };
  const message = (u) => { dispatch(openPrivate({ id: u.id, username: u.username })); navigate('/duel'); };
  const remove = (u) => { if (window.confirm(`${u.username} dostlardan silinsin?`)) dispatch(removeFriend(u.id)); };

  return (
    <div className="mt-5 card-inner text-left !p-5 md:!p-6 space-y-5">
      <h3 className="title-card inline-flex items-center gap-2"><Heart size={20} className="text-pink" /> Dostlar <span className="text-[14px] text-tx3 font-semibold">({list.length})</span></h3>

      {incoming.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[13px] font-semibold text-warn">Gələn istəklər ({incoming.length})</p>
          {incoming.map((r) => (
            <div key={r.id} className="row-item flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(r.username)}</div>
                <p className="text-[15px] font-bold truncate">{r.username}</p>
              </div>
              <div className="flex gap-2">
                <button disabled={busy === r.id} onClick={() => answer(acceptFriend, r.id)} className="btn btn-green btn-sm">
                  {busy === r.id ? <Loader2 className="animate-spin" /> : <Check />} Qəbul
                </button>
                <button disabled={busy === r.id} onClick={() => answer(rejectFriend, r.id)} className="btn btn-danger btn-sm"><X /> Rədd</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-[14px] text-tx3">Hələ dostunuz yoxdur. Axtarışdan istifadəçi tapıb dostluq istəyi göndərin.</p>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {list.map((u) => (
            <div key={u.id} className="row-item flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(u.username)}</div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold truncate">{u.username}</p>
                  <p className="text-[12px] text-tx3">{u.clan ? u.clan.name : 'Klansız'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => message(u)} className="btn btn-secondary btn-sm"><MessageSquare /> Mesaj</button>
                <button onClick={() => remove(u)} aria-label="Sil" className="btn btn-secondary btn-sm !px-3"><UserMinus /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}