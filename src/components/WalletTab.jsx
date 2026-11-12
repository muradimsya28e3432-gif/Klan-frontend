import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalance, fetchHistory, fetchPayouts, requestPayout } from '../redux/walletSlice';
import { openModal } from '../redux/uiSlice';
import { azn, fmtDate, fmtCard } from '../utils/money';

const TYPES = { topup: 'Balans artırma', gift: 'Hədiyyə', refund: 'Geri qaytarma', duel_win: 'Duel qazancı', payout: 'Çıxarış sorğusu', payout_refund: 'Çıxarış qaytarıldı' };
const STATUS = { pending: ['Gözləyir', 'text-amber-400'], paid: ['Ödənilib', 'text-emerald-400'], rejected: ['Rədd edilib', 'text-rose-400'] };

export default function WalletTab() {
  const dispatch = useDispatch();
  const { balance, history, payouts, payoutBusy } = useSelector((s) => s.wallet);
  const [amount, setAmount] = useState('');
  const [card, setCard] = useState('');

  useEffect(() => { dispatch(fetchBalance()); dispatch(fetchHistory()); dispatch(fetchPayouts()); }, [dispatch]);

  const submit = async () => {
    const res = await dispatch(requestPayout({ amount, cardNumber: card }));
    if (requestPayout.fulfilled.match(res)) { setAmount(''); setCard(''); }
  };
  const input = 'bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-rose-500';

  return (
    <div className="max-w-3xl w-full mx-auto p-6 flex-grow space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xl">
        <div>
          <p className="text-xs text-slate-400">Cari balans</p>
          <p className="text-2xl font-black text-emerald-400">{azn(balance)}</p>
        </div>
        <button onClick={() => dispatch(openModal('topUp'))} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-4 py-2 rounded-xl transition">+ Balansı artır</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-rose-500 mb-3">💸 Pul çıxar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input className={input} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)" />
          <input className={input} value={card} onChange={(e) => setCard(fmtCard(e.target.value))} inputMode="numeric" placeholder="Kart nömrəsi" />
        </div>
        <p className="text-[10px] text-slate-500 mb-3">Sorğu admin tərəfindən yoxlanılır. Komissiya sorğudan sonra göstərilir. Rədd olunarsa, pul balansa qayıdır.</p>
        <button onClick={submit} disabled={payoutBusy} className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition">Sorğu göndər</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-rose-500 mb-3">Çıxarış sorğularım</h3>
        {payouts.length === 0 ? <p className="text-xs text-slate-500">Hələ sorğu yoxdur.</p> : (
          <div className="space-y-2">
            {payouts.map((p) => {
              const [label, cls] = STATUS[p.status] || [p.status, 'text-slate-400'];
              return (
                <div key={p._id} className="flex justify-between items-center text-xs bg-slate-800/50 rounded-lg px-3 py-2 gap-2">
                  <span>{p.cardBrand} •••• {p.cardLast4}</span>
                  <span className="text-slate-300">{azn(p.amount)} (komissiya {azn(p.fee)}, kartına {azn(p.netAmount)})</span>
                  <span className={`font-bold ${cls}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-extrabold text-rose-500 mb-3">Əməliyyat tarixçəsi</h3>
        {history.length === 0 ? <p className="text-xs text-slate-500">Hələ əməliyyat yoxdur.</p> : (
          <div className="space-y-2">
            {history.map((t) => (
              <div key={t._id} className="flex justify-between items-center text-xs bg-slate-800/50 rounded-lg px-3 py-2 gap-2">
                <span className="text-slate-300">{TYPES[t.type] || t.type}{t.giftName ? ` · ${t.giftName}` : ''}</span>
                <span className="text-slate-500">{fmtDate(t.createdAt)}</span>
                <span className={`font-bold ${t.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>{t.direction === 'in' ? '+' : '−'}{azn(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}