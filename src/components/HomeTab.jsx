import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { House, Wallet, Star, Trophy, Bell, Swords, ArrowRight, Heart, Shield, Crown } from 'lucide-react';
import { fetchDuel } from '../redux/duelSlice';
import { fetchProgress, fetchSeason, fetchUserBoard } from '../redux/progressSlice';
import { fetchFriendRequests } from '../redux/friendsSlice';
import { fetchIncoming } from '../redux/clansSlice';
import { azn, initial } from '../utils/money';

const MEDAL = ['🥇', '🥈', '🥉'];

const LINKS = [
  ['/duel', 'Döyüşlər', 'Canlı duelə qoşul'],
  ['/tournaments', 'Turnirlər', 'Gündəlik və mövsümi yarışlar'],
  ['/community', 'İcma', 'Paylaşımlar və şərhlər'],
  ['/shop', 'Mağaza', 'Avatar, çərçivə, nişan'],
];

function Stat({ Icon, label, value, tint, color = 'text-white' }) {
  return (
    <div className="card-inner !p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tint}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-[12px] text-tx2">{label}</p>
        <p className={`text-[18px] md:text-[22px] font-extrabold leading-tight truncate ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function HomeTab() {
  const dispatch = useDispatch();
  const username = useSelector((s) => s.auth.user && s.auth.user.username);
  const balance = useSelector((s) => s.wallet.balance);
  const duel = useSelector((s) => s.duel.duel);
  const { me, season, users, missing } = useSelector((s) => s.progress);
  const friendReq = useSelector((s) => s.friends.incoming);
  const clanReq = useSelector((s) => s.clans.incoming);

  useEffect(() => {
    dispatch(fetchDuel());
    dispatch(fetchProgress());
    dispatch(fetchSeason());
    dispatch(fetchUserBoard('season'));
    dispatch(fetchFriendRequests());
    dispatch(fetchIncoming());
  }, [dispatch]);

  const level = (me && me.level) || 1;
  const seasonPoints = (me && (me.seasonPoints ?? me.seasonScore)) || 0;
  const seasonRank = me && (me.seasonRank ?? me.rank);
  const active = season && (season.active || season.current);
  const live = duel && duel.status === 'active';

  const notices = [];
  if (friendReq.length) notices.push({ to: '/profile', Icon: Heart, text: `${friendReq.length} yeni dostluq istəyi` });
  if (clanReq.length) notices.push({ to: '/klans', Icon: Shield, text: `${clanReq.length} klan qoşulma istəyi` });

  return (
    <div className="page-wrap max-w-[1100px] flex-grow space-y-5">
      <div className="flex items-center gap-4">
        <div className="icon-tile"><House size={28} /></div>
        <div>
          <h2 className="title-page">Xoş gəldin, <span className="text-pink">{username || 'oyunçu'}</span></h2>
          <p className="text-sub mt-1">Yeniliklər, aktiv yarışlar və göstəricilər.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={Wallet} label="Balans" value={azn(balance)} color="text-mint" tint="bg-mint/15 text-mint" />
        <Stat Icon={Star} label="Səviyyə" value={level} tint="bg-warn/15 text-warn" />
        <Stat Icon={Trophy} label="Mövsüm xalı" value={seasonPoints} tint="bg-cyan/15 text-cyan" />
        <Stat Icon={Crown} label="Mövsümdə yerim" value={seasonRank ? `#${seasonRank}` : '—'} color="text-pink" tint="bg-pink/15 text-pink" />
      </div>

      {active && (
        <div className="card-balance flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] text-tx2">Aktiv mövsüm</p>
            <p className="text-[22px] font-extrabold">{active.name || 'Mövsüm'}</p>
          </div>
          <Link to="/rank" className="btn btn-secondary btn-sm">Reytinqə bax <ArrowRight /></Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card card-glow">
          <h3 className="title-card inline-flex items-center gap-2 mb-4"><Swords size={20} className="text-pink" /> Aktiv yarış</h3>
          {live ? (
            <>
              <p className="text-[18px] font-bold mb-1"><span className="text-pink">{duel.nameA}</span> <span className="text-tx3">vs</span> <span className="text-[#9b6cff]">{duel.nameB}</span></p>
              <p className="text-[14px] text-tx2 mb-4">{azn(duel.scoreA)} / {azn(duel.scoreB)} · Fond: <strong className="text-mint">{azn(duel.pool)}</strong></p>
              <Link to="/duel" className="btn btn-primary w-full sm:w-auto">Duelə qoşul <ArrowRight /></Link>
            </>
          ) : <p className="text-[14px] text-tx3">Hazırda aktiv duel yoxdur. Yeni duel başlayanda burada görünəcək.</p>}
        </div>

        <div className="card">
          <h3 className="title-card inline-flex items-center gap-2 mb-4"><Bell size={20} className="text-warn" /> Bildirişlər</h3>
          {notices.length === 0 ? <p className="text-[14px] text-tx3">Yeni bildiriş yoxdur.</p> : (
            <div className="space-y-2.5">
              {notices.map((n) => (
                <Link key={n.to} to={n.to} className="row-item flex items-center justify-between gap-3 text-[14px] hover:border-line2 transition">
                  <span className="inline-flex items-center gap-2"><n.Icon size={16} className="text-pink" /> {n.text}</span>
                  <ArrowRight size={16} className="text-tx3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="title-card inline-flex items-center gap-2"><Trophy size={20} className="text-warn" /> Mövsümün ən yaxşıları</h3>
          <Link to="/rank" className="text-[13px] text-pink font-semibold hover:brightness-125">Hamısı</Link>
        </div>
        {missing.users || users.length === 0 ? <p className="text-[14px] text-tx3">Reytinq hələ boşdur.</p> : (
          <div className="space-y-2.5">
            {users.slice(0, 3).map((u, i) => (
              <div key={u.id} className="row-item flex items-center gap-3">
                <span className="w-8 text-center text-[18px]">{MEDAL[i]}</span>
                <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(u.username)}</div>
                <p className="flex-1 min-w-0 text-[15px] font-bold truncate">{u.username}</p>
                <span className="font-extrabold text-mint">{u.seasonPoints ?? u.points ?? u.xp ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {LINKS.map(([to, title, sub]) => (
          <Link key={to} to={to} className="card card-hover !p-4">
            <p className="text-[16px] font-bold">{title}</p>
            <p className="text-[13px] text-tx3 mt-1">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}