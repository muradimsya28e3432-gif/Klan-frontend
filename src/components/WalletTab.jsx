import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Wallet, Plus, Send, CreditCard, Info, History, BarChart3, Loader2 } from 'lucide-react';
import { fetchBalance, fetchHistory, fetchPayouts, requestPayout } from '../redux/walletSlice';
import { openModal } from '../redux/uiSlice';
import { azn, fmtDate, fmtCard } from '../utils/money';

const TYPES = { topup: 'Balans artırma', gift: 'Hədiyyə', refund: 'Geri qaytarma', duel_win: 'Duel qazancı', payout: 'Çıxarış sorğusu', payout_refund: 'Çıxarış qaytarıldı' };
const STATUS = { pending: ['Gözləyir', 'badge-warn'], paid: ['Ödənilib', 'badge-ok'], rejected: ['Rədd edilib', 'badge-bad'] };

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

  return (
    <div className="page-wrap max-w-[1100px] flex-grow space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="icon-tile"><Wallet size={28} /></div>
          <div>
            <h2 className="title-page">Cüzdan</h2>
            <p className="text-sub">Balansınızı idarə edin, əməliyyatlarınızı izləyin.</p>
          </div>
        </div>
      </div>

      <div className="card-balance min-h-[120px] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BarChart3 size={40} className="text-[#b9a0ff]" />
          <div>
            <p className="text-[15px] text-tx2">Cari balans</p>
            <p className="text-[28px] md:text-[36px] font-extrabold text-mint leading-tight">{azn(balance)}</p>
          </div>
        </div>
        <button onClick={() => dispatch(openModal('topUp'))} className="btn btn-green h-[54px] rounded-[14px] px-6 w-full sm:w-auto"><Plus /> Balansı artır</button>
      </div>

      <div className="card !p-5 md:!p-8">
        <h3 className="text-[22px] font-bold inline-flex items-center gap-2 mb-5"><Send size={22} className="text-pink2" /> Pul çıxar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="input-wrap">
            <CreditCard className="lead" />
            <input className="input input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)" />
          </div>
          <div className="input-wrap">
            <CreditCard className="lead" />
            <input className="input input-lg" value={card} onChange={(e) => setCard(fmtCard(e.target.value))} inputMode="numeric" placeholder="Kart nömrəsi" />
          </div>
        </div>
        <p className="hint flex items-start gap-2 mb-5"><Info size={16} className="text-cyan shrink-0 mt-px" /> Sorğu admin tərəfindən yoxlanılır. Komissiya sorğudan sonra göstərilir. Rədd olunarsa, pul balansa qayıdır.</p>
        <button onClick={submit} disabled={payoutBusy} className="btn btn-primary btn-lg w-full">
          {payoutBusy ? <Loader2 className="animate-spin" /> : <Send />} Sorğu göndər
        </button>
      </div>

      <div className="card">
        <h3 className="title-card inline-flex items-center gap-2 mb-4"><History size={22} className="text-pink2" /> Çıxarış sorğularım</h3>
        {payouts.length === 0 ? <p className="text-sub !text-[14px]">Hələ sorğu yoxdur.</p> : (
          <div className="space-y-2.5">
            {payouts.map((p) => {
              const [label, cls] = STATUS[p.status] || [p.status, 'badge-neutral'];
              return (
                <div key={p._id} className="row-item flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-[14px]">
                  <span className="font-semibold">{p.cardBrand} •••• {p.cardLast4}</span>
                  <span className="text-tx2">{azn(p.amount)} (komissiya {azn(p.fee)}, kartına {azn(p.netAmount)})</span>
                  <span className={`badge ${cls}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="title-card inline-flex items-center gap-2 mb-4"><BarChart3 size={22} className="text-violet" /> Əməliyyat tarixçəsi</h3>
        {history.length === 0 ? <p className="text-sub !text-[14px]">Hələ əməliyyat yoxdur.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[520px]">
              <thead>
                <tr className="text-left text-[13px] text-tx3">
                  <th className="pb-3 font-medium">Əməliyyat</th>
                  <th className="pb-3 font-medium">Məbləğ</th>
                  <th className="pb-3 font-medium">Tarix</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((t) => (
                  <tr key={t._id} className="border-t border-line">
                    <td className="py-3 text-tx">{TYPES[t.type] || t.type}{t.giftName ? ` · ${t.giftName}` : ''}</td>
                    <td className={`py-3 font-bold ${t.direction === 'in' ? 'text-mint' : 'text-pink'}`}>{t.direction === 'in' ? '+' : '−'}{azn(t.amount)}</td>
                    <td className="py-3 text-tx3">{fmtDate(t.createdAt)}</td>
                    <td className="py-3 text-right"><span className="badge badge-ok">Tamamlandı</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}