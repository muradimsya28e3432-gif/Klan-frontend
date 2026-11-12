import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createClan } from '../redux/clansSlice';
import { closeModal } from '../redux/uiSlice';

export default function CreateClanModal() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const submit = () => { if (name.trim().length >= 3) dispatch(createClan(name.trim())); };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <h3 className="font-extrabold text-base mb-4 text-rose-500">🛡️ Yeni Klan Yarat</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} maxLength={24} placeholder="Klanın adı (məs: Qarabag_Fans)"
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs w-full mb-1 focus:outline-none focus:border-rose-500" />
        <p className="text-[10px] text-slate-500 mb-4">3-24 simvol: hərf, rəqəm, _ və boşluq.</p>
        <div className="flex gap-2">
          <button onClick={() => dispatch(closeModal())} className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold transition">Ləğv et</button>
          <button onClick={submit} className="w-full bg-rose-600 hover:bg-rose-500 py-2.5 rounded-xl text-xs font-bold transition">Yarat</button>
        </div>
      </div>
    </div>
  );
}