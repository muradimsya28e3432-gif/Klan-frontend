import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchAll, toggleFollow } from '../redux/usersSlice';
import { joinClan } from '../redux/clansSlice';
import { openPrivate } from '../redux/chatSlice';
import { setTab } from '../redux/uiSlice';
import { initial } from '../utils/money';

export default function SearchTab() {
  const dispatch = useDispatch();
  const { results, searching } = useSelector((s) => s.users);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);
  const meId = useSelector((s) => s.auth.user && s.auth.user.id);
  const [q, setQ] = useState('');

  const run = () => { if (q.trim().length >= 2) dispatch(searchAll(q.trim())); };
  const message = (u) => { dispatch(openPrivate({ id: u.id, username: u.username })); dispatch(setTab('duel')); };

  return (
    <div className="max-w-3xl w-full mx-auto p-6 flex-grow">
      <h2 className="text-xl font-extrabold text-rose-500 mb-4">🔍 İstifadəçi və Klan Axtarışı</h2>
      <div className="flex gap-2 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} maxLength={30} placeholder="Ad və ya klan yazın..."
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-rose-500" />
        <button onClick={run} disabled={searching} className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-5 py-2.5 rounded-xl text-xs font-bold transition">Axtar</button>
      </div>

      {!results ? (
        <p className="text-xs text-slate-500">Axtarış etmək üçün yuxarıya ən az 2 simvol daxil edin.</p>
      ) : (
        <div className="space-y-3">
          {results.users.length === 0 && results.clans.length === 0 && <p className="text-xs text-slate-500">Nəticə tapılmadı.</p>}

          {results.users.map((u) => (
            <div key={u.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-600 font-bold flex items-center justify-center text-xs border border-rose-400">{initial(u.username)}</div>
                <div>
                  <p className="text-sm font-bold">{u.username}</p>
                  <p className="text-[11px] text-slate-400">{u.clan ? u.clan.name : 'Klansız'} · {u.followersCount} izləyici</p>
                </div>
              </div>
              {u.id !== meId && (
                <div className="flex gap-2">
                  <button onClick={() => message(u)} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition">Mesaj</button>
                  <button onClick={() => dispatch(toggleFollow(u.id))}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${u.followed ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-rose-600 hover:bg-rose-500'}`}>{u.followed ? 'İzlənilir' : 'İzlə'}</button>
                </div>
              )}
            </div>
          ))}

          {results.clans.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">🛡️ {c.name}</p>
                <p className="text-[11px] text-slate-400">{c.memberCount} üzv</p>
              </div>
              {!myClan && <button onClick={() => dispatch(joinClan(c.id))} className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-3 py-1.5 rounded-lg transition">Qoşul</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}