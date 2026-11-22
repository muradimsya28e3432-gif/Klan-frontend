import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats, fetchWithdrawals, platformWithdraw } from '../redux/adminSlice';
import { azn, fmtDate } from '../utils/money';

export default function AdminRevenue() {
  const dispatch = useDispatch();
  const { stats, withdrawals } = useSelector((s) => s.admin);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { dispatch(fetchAdminStats()); dispatch(fetchWithdrawals()); }, [dispatch]);

  const p = stats && stats.platform;
  const cards = [
    ['İstifadəçilər', stats ? stats.users : 0, 'text-white'],
    ['Platforma balansı', azn(p && p.balance), 'text-mint'],
    ['Ümumi qazanc', azn(p && p.totalEarned), 'text-white'],
    ['Çıxarılıb', azn(p && p.totalWithdrawn), 'text-tx2'],
  ];

  const submit = async () => {
    const r = await dispatch(platformWithdraw({ amount, note: note.trim() }));
    if (platformWithdraw.fulfilled.match(r)) { setAmount(''); setNote(''); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(([label, value, cls]) => (
          <div key={label} className="card-inner card-hover transition !p-5">
            <p className="text-[13px] text-tx2">{label}</p>
            <p className={`text-[22px] md:text-[28px] font-extrabold mt-1 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="title-card mb-4">Gəliri çıxar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)" />
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Qeyd (istəyə bağlı)" />
        </div>
        <button onClick={submit} className="btn btn-primary w-full sm:w-auto">Çıxar</button>
      </div>

      <div className="card">
        <h3 className="title-card mb-4">Çıxarış tarixçəsi</h3>
        {withdrawals.length === 0 ? <p className="text-[14px] text-tx3">Hələ çıxarış yoxdur.</p> : (
          <div className="space-y-2.5">
            {withdrawals.map((w) => (
              <div key={w._id} className="row-item flex flex-wrap justify-between gap-2 text-[14px]">
                <span className="text-tx3">{fmtDate(w.createdAt)}</span>
                <span className="text-tx2 flex-1 truncate">{w.note || '—'}</span>
                <span className="font-bold text-pink">−{azn(w.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}