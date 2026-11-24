import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, Trophy, Gift, MessageCircle, Shield } from 'lucide-react';
import { fetchClanStats, fetchClanMembers } from '../redux/clanHubSlice';
import { setChatMode } from '../redux/chatSlice';
import { azn, initial } from '../utils/money';

function Stat({ Icon, label, value, tint }) {
  return (
    <div className="card-inner !p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${tint}`}><Icon size={20} /></div>
      <div className="min-w-0">
        <p className="text-[12px] text-tx2">{label}</p>
        <p className="text-[18px] md:text-[20px] font-extrabold leading-tight truncate">{value}</p>
      </div>
    </div>
  );
}

// Klan mərkəzi: yalnız klanı olan istifadəçiyə göstərilir (statistika + üzvlər + klan çatı)
export default function ClanHubPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);
  const { stats, members, missing } = useSelector((s) => s.clanHub);
  const clanId = myClan && myClan.id;

  // myClan obyekti hər profil yenilənəndə dəyişir, ona görə asılılıq yalnız klanın ID-sidir
  useEffect(() => {
    if (!clanId) return;
    dispatch(fetchClanStats());
    dispatch(fetchClanMembers());
  }, [dispatch, clanId]);

  if (!myClan) return null;
  // backend-də klan mərkəzi hələ yoxdursa (404) panel tamamilə gizlənir, səhifədə boş/xəta bloku qalmır
  if (missing.stats && missing.members) return null;

  const points = stats && (stats.points ?? stats.seasonPoints ?? stats.score);
  const rank = stats && (stats.rank ?? stats.seasonRank);
  const gifted = stats && (stats.totalGifted ?? stats.gifted);
  const count = (stats && stats.memberCount) ?? members.length;

  const openChat = () => { dispatch(setChatMode('clan')); navigate('/duel'); };

  return (
    <div className="card card-glow mb-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="title-card inline-flex items-center gap-2"><Shield size={22} className="text-pink" /> {myClan.name} <span className="text-tx3 text-[14px] font-semibold">· Klan mərkəzi</span></h3>
        <button onClick={openChat} className="btn btn-primary btn-sm"><MessageCircle /> Klan çatı</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat Icon={Users} label="Üzvlər" value={count} tint="bg-cyan/15 text-cyan" />
        <Stat Icon={Trophy} label="Mövsüm xalı" value={points ?? '—'} tint="bg-warn/15 text-warn" />
        <Stat Icon={Crown} label="Klan sırası" value={rank ? `#${rank}` : '—'} tint="bg-pink/15 text-pink" />
        <Stat Icon={Gift} label="Atılan hədiyyə" value={gifted != null ? azn(gifted) : '—'} tint="bg-mint/15 text-mint" />
      </div>

      <div>
        <h4 className="text-[16px] font-bold mb-3">Üzvlər ({members.length})</h4>
        {members.length === 0 ? <p className="text-[14px] text-tx3">Üzv tapılmadı.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {members.map((m) => {
              const leader = m.role === 'leader' || m.isLeader;
              return (
                <div key={m.id} className="row-item flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(m.username)}</div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold truncate inline-flex items-center gap-1.5">
                        {m.username} {leader && <Crown size={14} className="text-warn" />}
                      </p>
                      <p className="text-[12px] text-tx3">{m.level ? `Səviyyə ${m.level}` : leader ? 'Lider' : 'Üzv'}</p>
                    </div>
                  </div>
                  {(m.points ?? m.seasonPoints) != null && <span className="text-[13px] font-bold text-mint">{m.points ?? m.seasonPoints} xal</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}