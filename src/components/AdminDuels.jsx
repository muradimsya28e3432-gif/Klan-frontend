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

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="title-card mb-4">Aktiv duel</h3>
        {running ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[18px] font-bold"><span className="text-pink">{duel.nameA}</span> vs <span className="text-[#9b6cff]">{duel.nameB}</span></p>
              <p className="text-[14px] text-tx2 mt-1">{azn(duel.scoreA)} / {azn(duel.scoreB)} · Fond: <strong className="text-mint">{azn(duel.pool)}</strong></p>
            </div>
            <button onClick={finish} className="btn btn-danger w-full sm:w-auto">Duelı bitir</button>
          </div>
        ) : <p className="text-[14px] text-tx3">Aktiv duel yoxdur.</p>}
      </div>

      <div className="card">
        <h3 className="title-card mb-4">Yeni duel yarat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input className="input" value={a} onChange={(e) => setA(e.target.value)} maxLength={30} placeholder="1-ci tərəf (məs: Bakı)" />
          <input className="input" value={b} onChange={(e) => setB(e.target.value)} maxLength={30} placeholder="2-ci tərəf (məs: Gəncə)" />
        </div>
        <button onClick={create} disabled={running} className="btn btn-primary w-full sm:w-auto">Duel yarat</button>
        {running && <p className="hint mt-3">Yeni duel yaratmaq üçün əvvəl aktiv duelı bitirin.</p>}
      </div>
    </div>
  );
}