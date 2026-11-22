import { useState } from 'react';
import { Settings } from 'lucide-react';
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
    <div className="page-wrap max-w-[1100px] flex-grow">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-tile"><Settings size={28} /></div>
        <h2 className="title-page">Admin <span className="text-pink">Paneli</span></h2>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)} className={`pill ${sec === s.id ? 'pill-on' : ''}`}>{s.label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}