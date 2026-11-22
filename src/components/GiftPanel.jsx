import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Gift, Zap } from 'lucide-react';
import { fetchGifts, selectGift } from '../redux/duelSlice';
import { azn } from '../utils/money';

export default function GiftPanel() {
  const dispatch = useDispatch();
  const { gifts, selected } = useSelector((s) => s.duel);

  useEffect(() => { if (!gifts.length) dispatch(fetchGifts()); }, [dispatch, gifts.length]);

  const cat = gifts[selected.category];
  const price = cat ? cat.subs[selected.sub].price : 0;

  return (
    <div className="border-t border-line pt-5">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <span className="inline-flex items-center gap-2 text-[16px] md:text-[18px] font-bold"><Gift size={22} className="text-pink" /> Hədiyyələr (10 Əsas / 100 Çeşid)</span>
        {cat && <span className="text-[13px] md:text-[14px] text-mint font-semibold">Seçilib: {cat.icon} {cat.name} Növ {selected.sub + 1} ({azn(price)})</span>}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-[10px] mb-5">
        {gifts.map((g) => (
          <button key={g.category} onClick={() => dispatch(selectGift({ category: g.category }))} title={g.name}
            className={`min-h-[64px] rounded-xl text-[24px] border transition hover:-translate-y-0.5 ${selected.category === g.category ? 'bg-pink/15 border-pink shadow-[0_0_20px_-2px_rgba(255,0,102,.6)]' : 'bg-field border-line2 hover:border-tx3'}`}>{g.icon}</button>
        ))}
      </div>

      <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-tx2 mb-3"><Zap size={16} className="text-warn" /> Məbləğ seçin:</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-[10px]">
        {cat && cat.subs.map((s) => (
          <button key={s.sub} onClick={() => dispatch(selectGift({ sub: s.sub }))}
            className={`h-[42px] rounded-xl text-[13px] font-bold border transition hover:-translate-y-0.5 ${selected.sub === s.sub ? 'bg-mint/15 border-mint text-mint shadow-[0_0_16px_-4px_rgba(0,214,154,.6)]' : 'bg-field border-line2 text-tx2 hover:border-tx3'}`}>
            {(s.price / 100).toFixed(2)} ₼
          </button>
        ))}
      </div>
    </div>
  );
}