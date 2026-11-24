import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarClock, Flag } from 'lucide-react';
import { fetchSeasons, endSeason } from '../redux/adminSlice';
import { fmtDate } from '../utils/money';

export default function AdminSeasons() {
  const dispatch = useDispatch();
  const raw = useSelector((s) => s.admin.seasons);

  useEffect(() => { dispatch(fetchSeasons()); }, [dispatch]);

  // backend ya massiv, ya da { active, past } qaytara bilər
  const list = Array.isArray(raw) ? raw : [...(raw && raw.active ? [raw.active] : []), ...((raw && raw.past) || [])];
  const isActive = (s) => s.status === 'active' || s.active === true || (!s.endedAt && !s.status);
  const current = list.find(isActive);

  const end = () => {
    if (window.confirm('Mövsüm bitirilsin? Reytinq üzrə ilk yerlərə medal veriləcək və yeni mövsüm başlayacaq.')) dispatch(endSeason());
  };

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="title-card mb-4 inline-flex items-center gap-2"><CalendarClock size={20} className="text-pink" /> Aktiv mövsüm</h3>
        {current ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[18px] font-bold">{current.name || 'Mövsüm'}</p>
              <p className="text-[14px] text-tx2 mt-1">
                {current.startsAt || current.startedAt || current.createdAt ? `Başlayıb: ${fmtDate(current.startsAt || current.startedAt || current.createdAt)}` : ''}
                {current.endsAt ? ` · Bitir: ${fmtDate(current.endsAt)}` : ''}
              </p>
            </div>
            <button onClick={end} className="btn btn-danger w-full sm:w-auto"><Flag /> Mövsümü bitir</button>
          </div>
        ) : <p className="text-[14px] text-tx3">Aktiv mövsüm yoxdur.</p>}
      </div>

      <div className="card">
        <h3 className="title-card mb-4">Mövsüm tarixçəsi</h3>
        {list.length === 0 ? <p className="text-[14px] text-tx3">Hələ mövsüm yoxdur.</p> : (
          <div className="space-y-2.5">
            {list.map((s, i) => (
              <div key={s._id || s.id || i} className="row-item flex flex-wrap items-center justify-between gap-2 text-[14px]">
                <span className="font-bold">{s.name || `Mövsüm ${list.length - i}`}</span>
                <span className="text-tx3">{s.endedAt ? fmtDate(s.endedAt) : s.endsAt ? fmtDate(s.endsAt) : '—'}</span>
                <span className={`badge ${isActive(s) ? 'badge-ok' : 'badge-neutral'}`}>{isActive(s) ? 'Aktiv' : 'Bitib'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}