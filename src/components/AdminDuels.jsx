import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDuel } from '../redux/duelSlice';
import { adminCreateDuel, adminFinishDuel } from '../redux/adminSlice';
import { azn } from '../utils/money';

export default function AdminDuels() {
  const dispatch = useDispatch();
  const duel = useSelector((s) => s.duel.duel);
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  useEffect(() => { dispatch(fetchDuel()); }, [dispatch]);

  const running = duel && duel.status !== 'finished';
  const create = async () => {
    const r = await dispatch(adminCreateDuel({ nameA: a.trim(), nameB: b.trim() }));
    if (adminCreateDuel.fulfilled.match(r)) { setA(''); setB(''); }
  };
  const finish = () => {
    if (window.confirm('Duelı bitirib pulları bölüşdürmək istəyirsiniz?')) dispatch(adminFinishDuel(duel.id));
  };
  const input = 'bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-rose-500';

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-extrabold mb-3">Aktiv duel</h3>
        {running ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-bold">{duel.nameA} vs {duel.nameB}</p>
              <p className="text-slate-400 mt-1">{azn(duel.scoreA)} / {azn(duel.scoreB)} · Fond: {azn(duel.pool)}</p>
            </div>
            <button onClick={finish} className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-4 py-2 rounded-xl transition">Duelı bitir</button>
          </div>
        ) : <p className="text-xs text-slate-500">Aktiv duel yoxdur.</p>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-extrabold mb-3">Yeni duel yarat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input className={input} value={a} onChange={(e) => setA(e.target.value)} maxLength={30} placeholder="1-ci tərəf (məs: Bakı)" />
          <input className={input} value={b} onChange={(e) => setB(e.target.value)} maxLength={30} placeholder="2-ci tərəf (məs: Gəncə)" />
        </div>
        <button onClick={create} disabled={running} className="bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl transition">Duel yarat</button>
        {running && <p className="text-[10px] text-slate-500 mt-2">Yeni duel yaratmaq üçün əvvəl aktiv duelı bitirin.</p>}
      </div>
    </div>
  );
}