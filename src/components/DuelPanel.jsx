import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDuel, sendGift } from '../redux/duelSlice';
import { azn } from '../utils/money';
import GiftPanel from './GiftPanel';

const SIDES = {
  A: { text: 'text-rose-400', btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' },
  B: { text: 'text-indigo-400', btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' },
};

function Team({ side, name, score, disabled, onSend }) {
  const c = SIDES[side];
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
      <h3 className={`font-extrabold text-base uppercase ${c.text}`}>{name}</h3>
      <p className="text-xl font-black mt-1">{azn(score)}</p>
      <button disabled={disabled} onClick={() => onSend(side)}
        className={`mt-3 w-full text-xs font-bold py-2 rounded-lg transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${c.btn}`}>
        {name} tərəfinə at
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
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl gap-4">
      {!duel ? (
        <div className="text-center py-10">
          <p className="text-sm font-bold text-slate-300">{loaded ? 'Hazırda aktiv duel yoxdur' : 'Yüklənir...'}</p>
          <p className="text-xs text-slate-500 mt-1">Yeni duel başlayanda burada görünəcək.</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${active ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700/50 text-slate-300'}`}>
              {active ? '🔥 Canlı Duel' : duel.status === 'settling' ? '⏳ Hesablanır' : '🏁 Bitdi'}
            </span>
            <span className="text-xs text-slate-400">Fond: <strong className="text-white">{azn(duel.pool)}</strong></span>
          </div>

          <h2 className="text-center text-sm font-bold mb-4 text-slate-400">{duel.nameA} vs {duel.nameB}</h2>
          {duel.status === 'finished' && <p className="text-center text-sm font-bold text-emerald-400 mb-4">{winnerText}</p>}

          <div className="grid grid-cols-2 gap-4 mb-2">
            <Team side="A" name={duel.nameA} score={duel.scoreA} disabled={!active || sending} onSend={send} />
            <Team side="B" name={duel.nameB} score={duel.scoreB} disabled={!active || sending} onSend={send} />
          </div>
        </div>
      )}
      <GiftPanel />
    </div>
  );
}