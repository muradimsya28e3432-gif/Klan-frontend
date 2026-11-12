import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGifts, selectGift } from '../redux/duelSlice';
import { azn } from '../utils/money';

export default function GiftPanel() {
  const dispatch = useDispatch();
  const { gifts, selected } = useSelector((s) => s.duel);

  useEffect(() => { if (!gifts.length) dispatch(fetchGifts()); }, [dispatch, gifts.length]);

  const cat = gifts[selected.category];
  const price = cat ? cat.subs[selected.sub].price : 0;

  return (
    <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
      <div className="flex justify-between items-center mb-2 gap-2">
        <span className="text-xs font-bold text-slate-300">🎁 Hədiyyələr (10 Əsas / 100 Çeşid)</span>
        {cat && <span className="text-xs text-emerald-400 font-semibold">Seçilib: {cat.icon} {cat.name} Növ {selected.sub + 1} ({azn(price)})</span>}
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {gifts.map((g) => (
          <button key={g.category} onClick={() => dispatch(selectGift({ category: g.category }))} title={g.name}
            className={`py-2 rounded-lg text-lg border transition ${selected.category === g.category ? 'bg-rose-600/20 border-rose-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>{g.icon}</button>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mb-1">Alt Növlər:</p>
      <div className="grid grid-cols-5 gap-1.5">
        {cat && cat.subs.map((s) => (
          <button key={s.sub} onClick={() => dispatch(selectGift({ sub: s.sub }))}
            className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${selected.sub === s.sub ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}>
            {(s.price / 100).toFixed(2)} ₼
          </button>
        ))}
      </div>
    </div>
  );
}