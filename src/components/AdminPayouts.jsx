import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminPayouts, approvePayout, rejectPayout } from '../redux/adminSlice';
import { showToast } from '../redux/uiSlice';
import { api } from '../api/client';
import { azn, fmtDate, fmtCard } from '../utils/money';

const STATUS = {
  pending: ['Gözləyir', 'text-amber-400'],
  paid: ['Ödənilib', 'text-emerald-400'],
  rejected: ['Rədd edilib', 'text-rose-400'],
};

function PayoutRow({ p }) {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [card, setCard] = useState(null);
  const [label, cls] = STATUS[p.status] || [p.status, 'text-slate-400'];

  // Tam kart nömrəsi təhlükəsizlik üçün Redux-a yazılmır, yalnız bu komponentdə saxlanılır (backend audit yazır)
  const reveal = async () => {
    try { const r = await api(`/admin/payouts/${p._id}/card`); setCard(r.cardNumber); }
    catch (e) { dispatch(showToast({ type: 'error', text: e.message })); }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
      <div className="flex justify-between items-center gap-2 text-xs">
        <span className="font-bold">{p.user ? p.user.username : '—'}</span>
        <span className="text-slate-400">{fmtDate(p.createdAt)}</span>
        <span className={`font-bold ${cls}`}>{label}</span>
      </div>
      <p className="text-xs text-slate-300">
        {azn(p.amount)} · komissiya {azn(p.fee)} · kartına <strong className="text-emerald-400">{azn(p.netAmount)}</strong> · {p.cardBrand} •••• {p.cardLast4}
      </p>
      {card && <p className="text-xs font-mono text-amber-300">{fmtCard(card)}</p>}
      {p.status === 'pending' && (
        <div className="flex flex-wrap gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={100} placeholder="Köçürmə nömrəsi / ret səbəbi"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[160px] focus:outline-none focus:border-rose-500" />
          <button onClick={reveal} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition">Kartı göstər</button>
          <button onClick={() => dispatch(approvePayout({ id: p._id, providerRef: text.trim() }))} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-3 py-1.5 rounded-lg transition">Təsdiqlə</button>
          <button onClick={() => dispatch(rejectPayout({ id: p._id, note: text.trim() }))} className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-3 py-1.5 rounded-lg transition">Rədd et</button>
        </div>
      )}
      {p.note && <p className="text-[11px] text-slate-400">Qeyd: {p.note}</p>}
    </div>
  );
}

export default function AdminPayouts() {
  const dispatch = useDispatch();
  const payouts = useSelector((s) => s.admin.payouts);
  const [status, setStatus] = useState('pending');

  useEffect(() => { dispatch(fetchAdminPayouts(status)); }, [dispatch, status]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[['pending', 'Gözləyən'], ['paid', 'Ödənilmiş'], ['rejected', 'Rədd edilmiş'], ['', 'Hamısı']].map(([v, l]) => (
          <button key={l} onClick={() => setStatus(v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${status === v ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {payouts.map((p) => <PayoutRow key={p._id} p={p} />)}
        {payouts.length === 0 && <p className="text-xs text-slate-500">Sorğu yoxdur.</p>}
      </div>
    </div>
  );
}