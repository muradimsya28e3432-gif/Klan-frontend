import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trophy, Medal, Lock } from 'lucide-react';
import { fetchProgress, fetchAchievements } from '../redux/progressSlice';

const clamp = (n) => Math.max(0, Math.min(100, n));

// Profil səhifəsində: səviyyə, XP, mövsüm xalı, nailiyyətlər və medallar
export default function ProgressCard() {
  const dispatch = useDispatch();
  const { me, achievements, medals } = useSelector((s) => s.progress);

  useEffect(() => { dispatch(fetchProgress()); dispatch(fetchAchievements()); }, [dispatch]);

  const level = (me && me.level) || 1;
  const xp = (me && me.xp) || 0;
  const cur = (me && (me.levelXp ?? me.currentLevelXp)) || 0;
  const next = me && (me.nextLevelXp ?? me.xpForNext);
  const pct = me && me.progressPercent != null
    ? clamp(me.progressPercent)
    : next && next > cur ? clamp(((xp - cur) / (next - cur)) * 100) : 0;
  const seasonPoints = (me && (me.seasonPoints ?? me.seasonScore)) || 0;
  const seasonRank = me && (me.seasonRank ?? me.rank);

  const isOn = (a) => Boolean(a.unlocked ?? a.earned ?? a.unlockedAt);
  const done = achievements.filter(isOn).length;

  return (
    <div className="mt-5 card-inner text-left !p-5 md:!p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet/25 border border-violet/50 flex items-center justify-center text-[22px] font-extrabold text-[#c9b6ff]">{level}</div>
          <div>
            <p className="text-[13px] text-tx2">Səviyyə</p>
            <p className="title-card inline-flex items-center gap-2"><Star size={18} className="text-warn" /> Səviyyə {level}</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[13px] text-tx2">Mövsüm xalı</p>
            <p className="text-[22px] font-extrabold text-mint leading-tight">{seasonPoints}</p>
          </div>
          <div>
            <p className="text-[13px] text-tx2">Mövsümdə yerim</p>
            <p className="text-[22px] font-extrabold text-pink leading-tight">{seasonRank ? `#${seasonRank}` : '—'}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[12px] text-tx3 mb-1.5">
          <span>{xp} XP</span>
          <span>{next ? `${next} XP` : 'Maks.'}</span>
        </div>
        <div className="h-3 rounded-full bg-field border border-line overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-pink to-violet transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div>
        <h4 className="text-[16px] font-bold inline-flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-warn" /> Nailiyyətlər <span className="text-[13px] text-tx3 font-semibold">({done}/{achievements.length})</span>
        </h4>
        {achievements.length === 0 ? <p className="text-[14px] text-tx3">Hələ nailiyyət yoxdur.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {achievements.map((a) => {
              const on = isOn(a);
              return (
                <div key={a.id || a.key || a.name} className={`row-item flex items-center gap-3 ${on ? '' : 'opacity-50'}`}>
                  <div className="w-10 h-10 rounded-xl bg-field border border-line2 flex items-center justify-center text-[20px] shrink-0">
                    {on ? (a.icon || '🏆') : <Lock size={16} className="text-tx3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold truncate">{a.name || a.title}</p>
                    <p className="text-[12px] text-tx3 line-clamp-2">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-[16px] font-bold inline-flex items-center gap-2 mb-3"><Medal size={18} className="text-pink" /> Medallar</h4>
        {medals.length === 0 ? <p className="text-[14px] text-tx3">Hələ medalınız yoxdur. Mövsüm bitəndə ilk yerlər medal qazanır.</p> : (
          <div className="flex flex-wrap gap-2.5">
            {medals.map((m, i) => (
              <span key={m.id || i} className="badge badge-warn !h-9 !text-[13px]">
                {m.icon || '🏅'} {m.name || m.title || `Medal`}{m.seasonName || m.season ? ` · ${m.seasonName || (typeof m.season === 'string' ? m.season : m.season.name)}` : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}