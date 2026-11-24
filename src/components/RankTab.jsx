import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trophy, Users, Shield, Crown, Loader2, CalendarClock } from 'lucide-react';
import { fetchUserBoard, fetchClanBoard, fetchSeason } from '../redux/progressSlice';
import { fmtDate, initial } from '../utils/money';

const VIEWS = [['users', 'Oyunçular'], ['clans', 'Klanlar']];
const SORTS = [['season', 'Mövsüm'], ['xp', 'Ümumi XP']];
const MEDAL = ['🥇', '🥈', '🥉'];

function Place({ i }) {
  return (
    <span className="w-9 text-center text-[18px] font-extrabold shrink-0">
      {i < 3 ? MEDAL[i] : <span className="text-[15px] text-tx3">{i + 1}</span>}
    </span>
  );
}

export default function RankTab() {
  const dispatch = useDispatch();
  const { users, clans, season, by } = useSelector((s) => s.progress);
  const meId = useSelector((s) => s.auth.user && s.auth.user.id);
  const myClanId = useSelector((s) => s.users.me && s.users.me.clan && s.users.me.clan.id);
  const [view, setView] = useState('users');
  const [loading, setLoading] = useState(false);

  useEffect(() => { dispatch(fetchSeason()); }, [dispatch]);
  useEffect(() => {
    setLoading(true);
    const p = view === 'users' ? dispatch(fetchUserBoard(by)) : dispatch(fetchClanBoard());
    p.finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, view]);

  const changeSort = (v) => { setLoading(true); dispatch(fetchUserBoard(v)).finally(() => setLoading(false)); };

  const active = season && (season.active || season.current);
  const endsAt = active && (active.endsAt || active.endDate);

  return (
    <div className="page-wrap max-w-[1000px] flex-grow">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-tile"><Trophy size={28} /></div>
        <div>
          <h2 className="title-page">Reytinq <span className="text-pink">Cədvəli</span></h2>
          <p className="text-sub mt-1">Ən güclü oyunçular və klanlar.</p>
        </div>
      </div>

      {active && (
        <div className="card-balance mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-tx2">Aktiv mövsüm</p>
            <p className="text-[22px] font-extrabold">{active.name || 'Mövsüm'}</p>
          </div>
          {endsAt && <span className="badge badge-warn !h-9"><CalendarClock size={14} /> Bitir: {fmtDate(endsAt)}</span>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {VIEWS.map(([v, l]) => (
          <button key={v} onClick={() => setView(v)} className={`pill ${view === v ? 'pill-on' : ''}`}>
            {v === 'users' ? <Users size={14} className="inline mr-1.5 -mt-0.5" /> : <Shield size={14} className="inline mr-1.5 -mt-0.5" />}{l}
          </button>
        ))}
        {view === 'users' && (
          <span className="ml-auto flex gap-2">
            {SORTS.map(([v, l]) => (
              <button key={v} onClick={() => changeSort(v)} className={`pill !h-9 !text-[13px] ${by === v ? 'pill-on' : ''}`}>{l}</button>
            ))}
          </span>
        )}
        {loading && <Loader2 size={18} className="animate-spin text-tx3" />}
      </div>

      {view === 'users' ? (
        users.length === 0 ? <div className="card text-center py-12"><Trophy size={56} className="mx-auto text-violet mb-4" /><p className="title-card">Reytinq hələ boşdur</p></div> : (
          <div className="space-y-2.5">
            {users.map((u, i) => {
              const mine = String(u.id) === String(meId);
              const score = by === 'xp' ? (u.xp ?? u.points) : (u.seasonPoints ?? u.points ?? u.xp);
              return (
                <div key={u.id} className={`card !p-4 flex items-center gap-3 ${mine ? 'card-glow' : ''}`}>
                  <Place i={i} />
                  <div className="w-11 h-11 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(u.username)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-bold truncate">{u.username} {mine && <span className="badge badge-bad !bg-pink/15 !text-pink ml-1">Siz</span>}</p>
                    <p className="text-[12px] text-tx3">{u.clan ? u.clan.name : 'Klansız'}{u.level ? ` · Səviyyə ${u.level}` : ''}</p>
                  </div>
                  <span className="text-[18px] font-extrabold text-mint">{score ?? 0}</span>
                </div>
              );
            })}
          </div>
        )
      ) : (
        clans.length === 0 ? <div className="card text-center py-12"><Shield size={56} className="mx-auto text-violet mb-4" /><p className="title-card">Klan reytinqi hələ boşdur</p></div> : (
          <div className="space-y-2.5">
            {clans.map((c, i) => {
              const mine = myClanId && String(c.id) === String(myClanId);
              return (
                <div key={c.id} className={`card !p-4 flex items-center gap-3 ${mine ? 'card-glow' : ''}`}>
                  <Place i={i} />
                  <div className="w-11 h-11 rounded-2xl bg-violet/25 border border-violet/50 text-[#c9b6ff] font-extrabold text-[18px] flex items-center justify-center shrink-0">{(c.name || '?').charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-bold truncate">{c.name} {mine && <span className="badge badge-bad !bg-pink/15 !text-pink ml-1">Klanınız</span>}</p>
                    <p className="text-[12px] text-tx3 inline-flex items-center gap-3">
                      {c.leader && <span className="inline-flex items-center gap-1"><Crown size={12} className="text-warn" /> {c.leader}</span>}
                      {c.memberCount != null && <span>{c.memberCount} üzv</span>}
                    </p>
                  </div>
                  <span className="text-[18px] font-extrabold text-mint">{c.points ?? c.seasonPoints ?? c.score ?? 0}</span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}