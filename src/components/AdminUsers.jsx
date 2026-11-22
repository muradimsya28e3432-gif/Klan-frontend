import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { fetchAdminUsers, setBan } from '../redux/adminSlice';
import { azn } from '../utils/money';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.admin.users);
  const [q, setQ] = useState('');

  useEffect(() => { dispatch(fetchAdminUsers('')); }, [dispatch]);

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <div className="input-wrap flex-1">
          <Search className="lead" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dispatch(fetchAdminUsers(q.trim()))} maxLength={30} placeholder="İstifadəçi adı..." className="input" />
        </div>
        <button onClick={() => dispatch(fetchAdminUsers(q.trim()))} className="btn btn-primary">Axtar</button>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <div key={u._id} className="card card-hover !p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[16px] font-bold flex items-center gap-2">{u.username} {u.role === 'admin' && <span className="badge badge-bad !bg-pink/15 !text-pink">admin</span>} {u.isBanned && <span className="badge badge-warn">bloklu</span>}</p>
              <p className="text-[13px] text-tx2 mt-0.5">Balans: <span className="text-mint font-semibold">{azn(u.balance)}</span></p>
            </div>
            {u.role !== 'admin' && (
              <button onClick={() => dispatch(setBan({ id: u._id, banned: !u.isBanned }))} className={`btn ${u.isBanned ? 'btn-green' : 'btn-danger'}`}>{u.isBanned ? 'Blokdan çıxar' : 'Blokla'}</button>
            )}
          </div>
        ))}
        {users.length === 0 && <p className="text-[14px] text-tx3">İstifadəçi tapılmadı.</p>}
      </div>
    </div>
  );
}