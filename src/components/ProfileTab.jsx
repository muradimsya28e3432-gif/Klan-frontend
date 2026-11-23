import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, UserPlus, Gift, Crown, Wallet, Coins, Loader2, X } from 'lucide-react';
import { fetchProfile } from '../redux/usersSlice';
import { openModal } from '../redux/uiSlice';
import { api } from '../api/client';
import { azn, fmtDate, initial } from '../utils/money';

const TITLES = { followers: 'İzləyicilər', following: 'İzlədiklərim', gifts: 'Atılan Hədiyyələr' };

function Stat({ Icon, label, value, color = 'text-white', tint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`card-inner min-h-[110px] flex items-center gap-4 !p-[22px] text-left w-full transition hover:-translate-y-0.5 hover:border-line2 ${active ? '!border-pink shadow-[0_0_24px_-6px_rgba(255,0,102,.6)]' : ''}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tint}`}><Icon size={24} /></div>
      <div className="min-w-0">
        <p className="text-[15px] text-tx2">{label}</p>
        <p className={`text-[22px] md:text-[28px] font-extrabold leading-tight truncate ${color}`}>{value}</p>
      </div>
    </button>
  );
}

// Açılan siyahı: izləyicilər / izlədiklərim / atılan hədiyyələr
function DetailPanel({ view, onClose }) {
  const [items, setItems] = useState(null); // null = yüklənir
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setError('');
    api(`/users/me/${view}`) // followers | following | gifts
      .then((data) => { if (!cancelled) setItems(Array.isArray(data) ? data : []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setItems([]); } });
    return () => { cancelled = true; };
  }, [view]);

  return (
    <div className="mt-5 card-inner text-left !p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="title-card">
          {TITLES[view]} {items && !error && <span className="text-[14px] text-tx3 font-semibold">({items.length})</span>}
        </h3>
        <button onClick={onClose} aria-label="Bağla" className="text-tx3 hover:text-white transition p-1"><X size={20} /></button>
      </div>

      {items === null && <div className="flex justify-center py-6"><Loader2 className="animate-spin text-tx3" /></div>}
      {error && <p className="text-[14px] text-danger">{error}</p>}
      {items && !error && items.length === 0 && (
        <p className="text-[14px] text-tx3">
          {view === 'followers' && 'Hələ izləyiciniz yoxdur.'}
          {view === 'following' && 'Hələ heç kimi izləmirsiniz.'}
          {view === 'gifts' && 'Hələ hədiyyə atmamısınız.'}
        </p>
      )}

      {items && items.length > 0 && (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {view !== 'gifts' && items.map((u) => (
            <div key={u.id} className="row-item flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(u.username)}</div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold truncate">{u.username}</p>
                <p className="text-[12px] text-tx3">{u.clan ? u.clan.name : 'Klansız'}</p>
              </div>
            </div>
          ))}

          {view === 'gifts' && items.map((t) => (
            <div key={t.id} className="row-item flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px]">
              <div className="min-w-0">
                <p className="font-semibold inline-flex items-center gap-2"><Gift size={16} className="text-pink shrink-0" /> {t.giftName || 'Hədiyyə'}</p>
                {t.sideName && <p className="text-[12px] text-tx3 mt-0.5">{t.sideName} tərəfinə</p>}
              </div>
              <span className="text-tx3">{fmtDate(t.createdAt)}</span>
              <span className="font-bold text-mint">{azn(t.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileTab() {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.users.me);
  const username = useSelector((s) => s.auth.user && s.auth.user.username);
  const balance = useSelector((s) => s.wallet.balance);
  const [view, setView] = useState(null); // null | 'followers' | 'following' | 'gifts'

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  const toggle = (v) => setView((cur) => (cur === v ? null : v));

  return (
    <div className="page-wrap flex-grow">
      <div className="card card-glow max-w-[1050px] mx-auto !p-5 sm:!p-10 !rounded-[26px] text-center bg-gradient-to-b from-[#161b4a] to-[#101632]">
        <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-pink border-[3px] border-pink2 text-[40px] md:text-[48px] font-bold flex items-center justify-center mx-auto mb-5 shadow-[0_0_44px_-4px_rgba(255,0,102,.7)]">{initial(username)}</div>
        <h2 className="text-[26px] md:text-[32px] font-extrabold">{username}</h2>
        <p className="inline-flex items-center gap-2 text-[15px] text-tx2 mt-3 bg-bg2/60 border border-line rounded-full px-4 py-2">
          <Crown size={18} className="text-warn" /> Klan: <strong className="text-pink">{me && me.clan ? me.clan.name : 'Hələ qoşulmayıb'}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Stat Icon={Users} label="İzləyicilər" value={me ? me.followersCount : 0} tint="bg-cyan/15 text-cyan"
            active={view === 'followers'} onClick={() => toggle('followers')} />
          <Stat Icon={UserPlus} label="İzlədiklərim" value={me ? me.followingCount : 0} tint="bg-violet/20 text-[#b9a0ff]"
            active={view === 'following'} onClick={() => toggle('following')} />
          <Stat Icon={Gift} label="Atılan Hədiyyələr" value={azn(me ? me.totalGifted : 0)} color="text-mint" tint="bg-mint/15 text-mint"
            active={view === 'gifts'} onClick={() => toggle('gifts')} />
        </div>

        {view && <DetailPanel view={view} onClose={() => setView(null)} />}

        <div className="mt-5 card-balance flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <Coins size={40} className="text-warn" />
            <div>
              <p className="text-[15px] text-tx2">Balansınız</p>
              <p className="text-[24px] md:text-[28px] font-extrabold text-mint leading-tight">{azn(balance)}</p>
            </div>
          </div>
          <button onClick={() => dispatch(openModal('topUp'))} className="btn btn-primary h-[56px] w-full sm:w-auto sm:min-w-[260px]"><Wallet /> Balans artır</button>
        </div>
      </div>
    </div>
  );
}