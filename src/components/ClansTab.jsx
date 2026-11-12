import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClans, joinClan, leaveClan } from '../redux/clansSlice';
import { openModal } from '../redux/uiSlice';

export default function ClansTab() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.clans);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);

  useEffect(() => { dispatch(fetchClans()); }, [dispatch]);

  return (
    <div className="max-w-4xl w-full mx-auto p-6 flex-grow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-extrabold text-rose-500">🛡️ Klanlar Mərkəzi</h2>
        <div className="flex gap-2">
          {myClan && <button onClick={() => dispatch(leaveClan())} className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition">Klandan çıx</button>}
          {!myClan && <button onClick={() => dispatch(openModal('createClan'))} className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-4 py-2 rounded-xl transition">+ Yeni Klan Yarat</button>}
        </div>
      </div>

      {loading && list.length === 0 && <p className="text-xs text-slate-500">Yüklənir...</p>}
      {!loading && list.length === 0 && <p className="text-xs text-slate-500">Hələ klan yoxdur. İlk klanı siz yaradın.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((c) => {
          const mine = myClan && myClan.id === c.id;
          return (
            <div key={c.id} className={`bg-slate-900 border rounded-2xl p-4 flex items-center justify-between ${mine ? 'border-rose-500' : 'border-slate-800'}`}>
              <div>
                <h3 className="font-extrabold text-sm">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Lider: {c.leader || '—'} · {c.memberCount} üzv</p>
              </div>
              {mine ? <span className="text-xs font-bold text-rose-400">Klanınızdır</span> : (
                <button disabled={!!myClan} onClick={() => dispatch(joinClan(c.id))}
                  className="bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold px-3 py-1.5 rounded-lg transition">Qoşul</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}