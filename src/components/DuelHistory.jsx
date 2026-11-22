import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Flag } from 'lucide-react';
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
    <div className="page-wrap !pt-0">
      <div className="card">
        <h3 className="title-card inline-flex items-center gap-2 mb-4"><Flag size={22} className="text-pink" /> Son duellər</h3>
        <div className="space-y-2.5">
          {history.map((d) => (
            <div key={d.id} className="row-item flex flex-wrap justify-between items-center gap-2 text-[14px]">
              <span className="font-bold">{d.nameA} vs {d.nameB}</span>
              <span className="text-mint font-semibold">{d.winner === 'draw' ? 'Bərabərlik' : `Qalib: ${d.winner === 'A' ? d.nameA : d.nameB}`}</span>
              <span className="text-tx2">Fond: {azn(d.pool)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}