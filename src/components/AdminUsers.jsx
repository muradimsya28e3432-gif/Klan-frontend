import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, setBan } from '../redux/adminSlice';
import { azn } from '../utils/money';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.admin.users);
  const [q, setQ] = useState('');

  useEffect(() => { dispatch(fetchAdminUsers('')); }, [dispatch]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dispatch(fetchAdminUsers(q.trim()))} maxLength={30} placeholder="İstifadəçi adı..."
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-rose-500" />
        <button onClick={() => dispatch(fetchAdminUsers(q.trim()))} className="bg-rose-600 hover:bg-rose-500 px-5 py-2.5 rounded-xl text-xs font-bold transition">Axtar</button>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u._id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-bold">{u.username} {u.role === 'admin' && <span className="text-[10px] text-rose-400">admin</span>} {u.isBanned && <span className="text-[10px] text-amber-400">bloklu</span>}</p>
              <p className="text-[11px] text-slate-400">Balans: {azn(u.balance)}</p>
            </div>
            {u.role !== 'admin' && (
              <button onClick={() => dispatch(setBan({ id: u._id, banned: !u.isBanned }))}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${u.isBanned ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>{u.isBanned ? 'Blokdan çıxar' : 'Blokla'}</button>
            )}
          </div>
        ))}
        {users.length === 0 && <p className="text-xs text-slate-500">İstifadəçi tapılmadı.</p>}
      </div>
    </div>
  );
}