import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Shield, MessageSquare, UserPlus, UserCheck, Loader2, SearchX, Crown } from 'lucide-react';
import { searchAll, toggleFollow } from '../redux/usersSlice';
import { joinClan } from '../redux/clansSlice';
import { openPrivate } from '../redux/chatSlice';
import { initial } from '../utils/money';

export default function SearchTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, searching } = useSelector((s) => s.users);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);
  const meId = useSelector((s) => s.auth.user && s.auth.user.id);
  const [q, setQ] = useState('');

  const run = () => { if (q.trim().length >= 2) dispatch(searchAll(q.trim())); };
  const message = (u) => { dispatch(openPrivate({ id: u.id, username: u.username })); navigate('/duel'); };
  const none = results && results.users.length === 0 && results.clans.length === 0;

  return (
    <div className="page-wrap flex-grow">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="icon-tile hidden sm:flex"><Search size={28} /></div>
          <div>
            <h2 className="title-page">İstifadəçi və <span className="text-pink">Klan Axtarışı</span></h2>
            <p className="text-sub mt-1">İstifadəçi adı, klan adı və ya ID ilə axtarış et.</p>
          </div>
        </div>

        <div className="card !p-[10px] !rounded-[22px] flex items-center gap-2 h-[72px] md:h-[88px] mt-6 mb-8 focus-within:border-violet focus-within:shadow-[0_0_0_4px_rgba(105,37,255,.2)]">
          <Users size={22} className="text-tx3 ml-3 md:ml-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} maxLength={30} placeholder="Ad və ya klan yazın..."
            className="flex-1 min-w-0 bg-transparent text-[16px] md:text-[17px] text-white outline-none px-2 placeholder:text-tx3" />
          <button onClick={run} disabled={searching} className="btn btn-primary h-[52px] md:h-[68px] w-[56px] md:w-[155px] !rounded-[16px] text-[17px] !px-0 shrink-0">
            {searching ? <Loader2 className="animate-spin" /> : <Search />} <span className="hidden md:inline">Axtar</span>
          </button>
        </div>

        {!results ? (
          <div className="card text-center py-12">
            <Search size={56} className="mx-auto text-violet mb-4" />
            <p className="text-sub">Axtarış etmək üçün yuxarıya ən az 2 simvol daxil edin.</p>
          </div>
        ) : none ? (
          <div className="card text-center py-12">
            <SearchX size={56} className="mx-auto text-violet mb-4" />
            <p className="title-card">Nəticə tapılmadı</p>
            <p className="text-sub mt-1">Başqa ad və ya ID ilə yenidən yoxlayın.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.users.length > 0 && (
              <section>
                <h3 className="title-section inline-flex items-center gap-2 mb-4"><Users size={22} className="text-cyan" /> İstifadəçilər</h3>
                <div className="space-y-3">
                  {results.users.map((u) => (
                    <div key={u.id} className="card card-hover !p-4 md:!p-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(u.username)}</div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-bold truncate">{u.username}</p>
                          <p className="text-[13px] text-tx2">{u.clan ? u.clan.name : 'Klansız'} · {u.followersCount} izləyici</p>
                          <p className="text-[12px] text-tx3">ID: {String(u.id).slice(-6)}</p>
                        </div>
                      </div>
                      {u.id !== meId && (
                        <div className="flex gap-2">
                          <button onClick={() => message(u)} className="btn btn-secondary btn-sm !h-11"><MessageSquare /> Mesaj</button>
                          <button onClick={() => dispatch(toggleFollow(u.id))}
                            className={`btn btn-sm !h-11 ${u.followed ? 'btn-secondary' : 'btn-primary'}`}>{u.followed ? <><UserCheck /> İzlənilir</> : <><UserPlus /> İzlə</>}</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {results.clans.length > 0 && (
              <section>
                <h3 className="title-section inline-flex items-center gap-2 mb-4"><Shield size={22} className="text-pink" /> Klanlar</h3>
                <div className="space-y-3">
                  {results.clans.map((c) => (
                    <div key={c.id} className="card card-hover !p-4 md:!p-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-violet/25 border border-violet/50 text-[#c9b6ff] flex items-center justify-center shrink-0"><Shield size={24} /></div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-bold truncate">{c.name}</p>
                          <p className="text-[13px] text-tx2 inline-flex items-center gap-3">
                            {c.leader && <span className="inline-flex items-center gap-1"><Crown size={14} className="text-warn" /> {c.leader}</span>}
                            <span>{c.memberCount} üzv</span>
                          </p>
                        </div>
                      </div>
                      {!myClan && <button onClick={() => dispatch(joinClan(c.id))} className="btn btn-primary btn-sm !h-11">Klana qoşul</button>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}