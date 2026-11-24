import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import { fetchFriends } from '../redux/friendsSlice';
import { openPrivate } from '../redux/chatSlice';
import { initial } from '../utils/money';
import ChatPanel from './ChatPanel';

export default function MessagesTab() {
  const dispatch = useDispatch();
  const friends = useSelector((s) => s.friends.list);
  const target = useSelector((s) => s.chat.target);

  useEffect(() => { dispatch(fetchFriends()); }, [dispatch]);

  return (
    <div className="page-wrap max-w-[900px] flex-grow">
      <div className="flex items-center gap-4 mb-5">
        <div className="icon-tile"><MessageCircle size={28} /></div>
        <div>
          <h2 className="title-page">Mesaj<span className="text-pink">lar</span></h2>
          <p className="text-sub mt-1">Ümumi, klan və şəxsi çatlar.</p>
        </div>
      </div>

      {friends.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
          {friends.map((u) => {
            const on = target && String(target.id) === String(u.id);
            return (
              <button key={u.id} onClick={() => dispatch(openPrivate({ id: u.id, username: u.username }))}
                className={`pill shrink-0 inline-flex items-center gap-2 ${on ? 'pill-on' : ''}`}>
                <span className="w-6 h-6 rounded-full bg-pink/80 text-[12px] font-bold flex items-center justify-center">{initial(u.username)}</span>
                {u.username}
              </button>
            );
          })}
        </div>
      )}

      <ChatPanel full />
    </div>
  );
}