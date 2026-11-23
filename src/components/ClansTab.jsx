import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Shield, MessageSquare, UserPlus, UserCheck, Loader2, SearchX, Crown, Clock } from 'lucide-react';
import { searchAll, toggleFollow, clearResults } from '../redux/usersSlice';
import { joinClan, fetchMyRequests } from '../redux/clansSlice';
import { openPrivate } from '../redux/chatSlice';
import { initial } from '../utils/money';

const FILTERS = [['all', 'Hamısı'], ['users', 'İstifadəçilər'], ['clans', 'Klanlar']];

export default function SearchTab() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, searching } = useSelector((s) => s.users);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);
  const meId = useSelector((s) => s.auth.user && s.auth.user.id);
  const sent = useSelector((s) => s.clans.sent);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');

  const term = q.trim();
  const valid = term.length >= 2;

  // istək göndərdiyim (hələ cavab gəlməyən) klanların adları
  const pending = new Set(sent.filter((r) => r.status === 'pending').map((r) => r.clanName));

  useEffect(() => { dispatch(fetchMyRequests()); }, [dispatch]);

  // yazdıqca 400ms gözləyib avtomatik axtarır (hər dəfə MongoDB-dən təzə nəticə)
  useEffect(() => {
    if (!valid) { dispatch(clearResults()); return undefined; }
    const t = setTimeout(() => dispatch(searchAll({ q: term, type })), 400);
    return () => clearTimeout(t);
  }, [term, type, valid, dispatch]);

  const run = () => { if (valid) dispatch(searchAll({ q: term, type })); };
  const message = (u) => { dispatch(openPrivate({ id: u.id, username: u.username })); navigate('/duel'); };
  const join = async (id) => { await dispatch(joinClan(id)); run(); }; // istək göndərildikdən sonra nəticələr təzələnir

  const users = results ? results.users : [];
  const clans = results ? results.clans : [];
  const none = results && users.length === 0 && clans.length === 0;

  return (
    <div className="page-wrap flex-grow">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="icon-tile hidden sm:flex"><Search size={28} /></div>
          <div>
            <h2 className="title-page">İstifadəçi və <span className="text-pink">Klan Axtarışı</span></h2>
            <p className="text-sub mt-1">İstifadəçi adı və ya klan adı ilə axtarış et.</p>
          </div>
        </div>

        <div className="card !p-[10px] !rounded-[22px] flex items-center gap-2 h-[72px] md:h-[88px] mt-6 mb-4 focus-within:border-violet focus-within:shadow-[0_0_0_4px_rgba(105,37,255,.2)]">
          <Users size={22} className="text-tx3 ml-3 md:ml-4 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} maxLength={30} placeholder="Ad və ya klan yazın..."
            className="flex-1 min-w-0 bg-transparent text-[16px] md:text-[17px] text-white outline-none px-2 placeholder:text-tx3" />
          <button onClick={run} disabled={searching || !valid} className="btn btn-primary h-[52px] md:h-[68px] w-[56px] md:w-[155px] !rounded-[16px] text-[17px] !px-0 shrink-0">
            {searching ? <Loader2 className="animate-spin" /> : <Search />} <span className="hidden md:inline">Axtar</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {FILTERS.map(([v, l]) => (
            <button key={v} onClick={() => setType(v)} className={`pill ${type === v ? 'pill-on' : ''}`}>
              {l}{results && v === 'users' ? ` (${users.length})` : ''}{results && v === 'clans' ? ` (${clans.length})` : ''}
            </button>
          ))}
          {searching && <Loader2 size={18} className="animate-spin text-tx3 ml-1" />}
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
            <p className="text-sub mt-1">Başqa ad ilə yenidən yoxlayın.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {users.length > 0 && (
              <section>
                <h3 className="title-section inline-flex items-center gap-2 mb-4"><Users size={22} className="text-cyan" /> İstifadəçilər <span className="text-[14px] text-tx3 font-semibold">({users.length})</span></h3>
                <div className="space-y-3">
                  {users.map((u) => (
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

            {clans.length > 0 && (
              <section>
                <h3 className="title-section inline-flex items-center gap-2 mb-4"><Shield size={22} className="text-pink" /> Klanlar <span className="text-[14px] text-tx3 font-semibold">({clans.length})</span></h3>
                <div className="space-y-3">
                  {clans.map((c) => (
                    <div key={c.id} className={`card card-hover !p-4 md:!p-5 flex flex-wrap items-center justify-between gap-3 ${c.joined ? 'card-glow' : ''}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-violet/25 border border-violet/50 text-[#c9b6ff] font-extrabold text-[20px] flex items-center justify-center shrink-0">{(c.name || '?').charAt(0).toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-bold truncate">{c.name}</p>
                          <p className="text-[13px] text-tx2 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="inline-flex items-center gap-1"><Crown size={14} className="text-warn" /> {c.leader || '—'}</span>
                            <span className="inline-flex items-center gap-1"><Users size={14} className="text-cyan" /> {c.memberCount} üzv</span>
                          </p>
                          <p className="text-[12px] text-tx3">ID: {String(c.id).slice(-6)}</p>
                        </div>
                      </div>
                      {c.joined ? (
                        <span className="badge badge-bad !bg-pink/15 !text-pink">Klanınızdır</span>
                      ) : (
                        !myClan && (pending.has(c.name)
                          ? <button disabled className="btn btn-secondary btn-sm !h-11"><Clock /> İstək göndərilib</button>
                          : <button onClick={() => join(c.id)} className="btn btn-primary btn-sm !h-11">İstək göndər</button>)
                      )}
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