import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Swords, Activity } from 'lucide-react';
import { fetchDuel, sendGift } from '../redux/duelSlice';
import { azn } from '../utils/money';
import GiftPanel from './GiftPanel';

const SIDES = {
  A: { box: 'team-a', text: 'text-pink', btn: 'bg-pink shadow-[0_8px_24px_-8px_rgba(255,0,102,.75)]' },
  B: { box: 'team-b', text: 'text-[#9b6cff]', btn: 'bg-violet shadow-[0_8px_24px_-8px_rgba(105,37,255,.8)]' },
};

function Team({ side, name, score, disabled, onSend }) {
  const c = SIDES[side];
  return (
    <div className={`team ${c.box} p-5 min-h-[190px] flex flex-col items-center justify-between text-center`}>
      <h3 className={`font-extrabold text-[20px] uppercase tracking-wide ${c.text}`}>{name}</h3>
      <p className="text-[26px] md:text-[30px] font-bold text-white my-3">{azn(score)}</p>
      <button disabled={disabled} onClick={() => onSend(side)} className={`btn w-full h-12 rounded-[13px] ${c.btn}`}>
        <Send /> {name} tərəfinə at
      </button>
    </div>
  );
}

export default function DuelPanel() {
  const dispatch = useDispatch();
  const { duel, loaded, sending } = useSelector((s) => s.duel);

  useEffect(() => { dispatch(fetchDuel()); }, [dispatch]);

  // Duel bitibsə və ya yoxdursa, yenisi başlayana qədər 10 saniyədən bir yoxla
  const active = duel && duel.status === 'active';
  useEffect(() => {
    if (active) return undefined;
    const t = setInterval(() => dispatch(fetchDuel()), 10000);
    return () => clearInterval(t);
  }, [active, dispatch]);

  const send = (side) => dispatch(sendGift(side));
  const winnerText = !duel ? '' : duel.winner === 'draw' ? 'Bərabərlik — pullar qaytarıldı' : `Qalib: ${duel.winner === 'A' ? duel.nameA : duel.nameB}`;

  return (
    <div className="card card-glow flex flex-col gap-6">
      {!duel ? (
        <div className="text-center py-12">
          <Swords className="mx-auto text-violet mb-4" size={56} />
          <p className="title-card text-tx">{loaded ? 'Hazırda aktiv duel yoxdur' : 'Yüklənir...'}</p>
          <p className="text-[13px] text-tx3 mt-1">Yeni duel başlayanda burada görünəcək.</p>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3">
            {active ? (
              <span className="inline-flex items-center gap-2 bg-pink text-white text-[14px] md:text-[16px] font-bold px-4 py-1.5 rounded-full shadow-[0_0_22px_-4px_rgba(255,0,102,.8)]">
                <span className="live-dot w-2.5 h-2.5 rounded-full bg-white" /> Canlı Duel <Activity size={16} />
              </span>
            ) : (
              <span className="badge badge-neutral !h-9 !text-[14px]">{duel.status === 'settling' ? '⏳ Hesablanır' : '🏁 Bitdi'}</span>
            )}
            <span className="inline-flex items-center gap-2 bg-field border border-line rounded-xl px-4 py-2 text-[14px] text-tx2">
              Fond: <strong className="text-white">{azn(duel.pool)}</strong>
            </span>
          </div>

          <h2 className="text-center text-[22px] font-bold my-5">
            🏆 <span className="text-pink">{duel.nameA}</span> <span className="text-tx3 font-semibold">vs</span> <span className="text-[#9b6cff]">{duel.nameB}</span>
          </h2>
          {duel.status === 'finished' && <p className="text-center text-[16px] font-bold text-mint mb-4">{winnerText}</p>}

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Team side="A" name={duel.nameA} score={duel.scoreA} disabled={!active || sending} onSend={send} />
            <Team side="B" name={duel.nameB} score={duel.scoreB} disabled={!active || sending} onSend={send} />
            <span className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-bg2 border border-line2 items-center justify-center font-extrabold italic text-pink shadow-[0_0_20px_-4px_rgba(255,0,102,.6)]">VS</span>
          </div>
        </div>
      )}
      <GiftPanel />
    </div>
  );
}