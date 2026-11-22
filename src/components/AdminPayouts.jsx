import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminPayouts, approvePayout, rejectPayout } from '../redux/adminSlice';
import { showToast } from '../redux/uiSlice';
import { api } from '../api/client';
import { azn, fmtDate, fmtCard } from '../utils/money';

const STATUS = {
  pending: ['Gözləyir', 'badge-warn'],
  paid: ['Ödənilib', 'badge-ok'],
  rejected: ['Rədd edilib', 'badge-bad'],
};

function PayoutRow({ p }) {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [card, setCard] = useState(null);
  const [label, cls] = STATUS[p.status] || [p.status, 'badge-neutral'];

  // Tam kart nömrəsi təhlükəsizlik üçün Redux-a yazılmır, yalnız bu komponentdə saxlanılır (backend audit yazır)
  const reveal = async () => {
    try { const r = await api(`/admin/payouts/${p._id}/card`); setCard(r.cardNumber); }
    catch (e) { dispatch(showToast({ type: 'error', text: e.message })); }
  };

  return (
    <div className="card card-hover !p-5 space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-2 text-[14px]">
        <span className="font-bold text-[16px]">{p.user ? p.user.username : '—'}</span>
        <span className="text-tx3">{fmtDate(p.createdAt)}</span>
        <span className={`badge ${cls}`}>{label}</span>
      </div>
      <p className="text-[14px] text-tx2">
        {azn(p.amount)} · komissiya {azn(p.fee)} · kartına <strong className="text-mint">{azn(p.netAmount)}</strong> · {p.cardBrand} •••• {p.cardLast4}
      </p>
      {card && <p className="text-[14px] font-mono text-warn">{fmtCard(card)}</p>}
      {p.status === 'pending' && (
        <div className="flex flex-wrap gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={100} placeholder="Köçürmə nömrəsi / ret səbəbi" className="input !h-11 flex-1 min-w-[180px]" />
          <button onClick={reveal} className="btn btn-secondary">Kartı göstər</button>
          <button onClick={() => dispatch(approvePayout({ id: p._id, providerRef: text.trim() }))} className="btn btn-green">Təsdiqlə</button>
          <button onClick={() => dispatch(rejectPayout({ id: p._id, note: text.trim() }))} className="btn btn-danger">Rədd et</button>
        </div>
      )}
      {p.note && <p className="text-[13px] text-tx3">Qeyd: {p.note}</p>}
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
      <div className="flex flex-wrap gap-2 mb-5">
        {[['pending', 'Gözləyən'], ['paid', 'Ödənilmiş'], ['rejected', 'Rədd edilmiş'], ['', 'Hamısı']].map(([v, l]) => (
          <button key={l} onClick={() => setStatus(v)} className={`pill ${status === v ? 'pill-on' : ''}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-4">
        {payouts.map((p) => <PayoutRow key={p._id} p={p} />)}
        {payouts.length === 0 && <p className="text-[14px] text-tx3">Sorğu yoxdur.</p>}
      </div>
    </div>
  );
}