import { useState } from 'react';
import AdminRevenue from './AdminRevenue';
import AdminDuels from './AdminDuels';
import AdminPayouts from './AdminPayouts';
import AdminUsers from './AdminUsers';

const SECTIONS = [
  { id: 'revenue', label: '📊 Gəlir', C: AdminRevenue },
  { id: 'duels', label: '🔥 Duellər', C: AdminDuels },
  { id: 'payouts', label: '💸 Çıxarışlar', C: AdminPayouts },
  { id: 'users', label: '👥 İstifadəçilər', C: AdminUsers },
];

export default function AdminTab() {
  const [sec, setSec] = useState('revenue');
  const Active = SECTIONS.find((s) => s.id === sec).C;

  return (
    <div className="max-w-4xl w-full mx-auto p-6 flex-grow">
      <h2 className="text-xl font-extrabold text-rose-500 mb-4">⚙️ Admin Paneli</h2>
      <div className="flex flex-wrap gap-2 mb-5">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${sec === s.id ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{s.label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}