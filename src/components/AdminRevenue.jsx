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
    ['Platforma balansı', azn(p && p.balance), 'text-emerald-400'],
    ['Ümumi qazanc', azn(p && p.totalEarned), 'text-white'],
    ['Çıxarılıb', azn(p && p.totalWithdrawn), 'text-slate-300'],
  ];

  const submit = async () => {
    const r = await dispatch(platformWithdraw({ amount, note: note.trim() }));
    if (platformWithdraw.fulfilled.match(r)) { setAmount(''); setNote(''); }
  };
  const input = 'bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-rose-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(([label, value, cls]) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-[11px] text-slate-400">{label}</p>
            <p className={`text-base font-black mt-1 ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-extrabold mb-3">Gəliri çıxar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input className={input} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)" />
          <input className={input} value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Qeyd (istəyə bağlı)" />
        </div>
        <button onClick={submit} className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-4 py-2 rounded-xl transition">Çıxar</button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-extrabold mb-3">Çıxarış tarixçəsi</h3>
        {withdrawals.length === 0 ? <p className="text-xs text-slate-500">Hələ çıxarış yoxdur.</p> : (
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w._id} className="flex justify-between text-xs bg-slate-800/50 rounded-lg px-3 py-2 gap-2">
                <span className="text-slate-400">{fmtDate(w.createdAt)}</span>
                <span className="text-slate-300 flex-1 truncate">{w.note || '—'}</span>
                <span className="font-bold text-rose-400">−{azn(w.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}