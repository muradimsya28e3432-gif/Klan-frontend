import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDuelHistory } from '../redux/duelSlice';
import { azn } from '../utils/money';

export default function DuelHistory() {
  const dispatch = useDispatch();
  const history = useSelector((s) => s.duel.history);
  const status = useSelector((s) => s.duel.duel && s.duel.duel.status);

  // duel bitəndə siyahı təzələnir
  useEffect(() => { dispatch(fetchDuelHistory()); }, [dispatch, status]);

  if (!history.length) return null;
  return (
    <div className="max-w-6xl w-full mx-auto px-4 pb-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 mb-3">🏁 Son duellər</h3>
        <div className="space-y-2">
          {history.map((d) => (
            <div key={d.id} className="flex justify-between items-center text-xs bg-slate-800/50 rounded-lg px-3 py-2">
              <span className="font-bold">{d.nameA} vs {d.nameB}</span>
              <span className="text-emerald-400">{d.winner === 'draw' ? 'Bərabərlik' : `Qalib: ${d.winner === 'A' ? d.nameA : d.nameB}`}</span>
              <span className="text-slate-400">Fond: {azn(d.pool)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}