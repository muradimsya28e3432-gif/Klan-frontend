import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Shield } from 'lucide-react';
import { createClan } from '../redux/clansSlice';
import { closeModal } from '../redux/uiSlice';

export default function CreateClanModal() {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const submit = () => { if (name.trim().length >= 3) dispatch(createClan(name.trim())); };

  return (
    <div className="modal-overlay">
      <div className="card card-glow modal-card max-w-[440px] w-full !p-7">
        <h3 className="title-card inline-flex items-center gap-2 mb-5 text-pink"><Shield size={22} /> Yeni Klan Yarat</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} maxLength={24} placeholder="Klanın adı (məs: Qarabag_Fans)" className="input mb-2" />
        <p className="hint mb-5">3-24 simvol: hərf, rəqəm, _ və boşluq.</p>
        <div className="flex gap-3">
          <button onClick={() => dispatch(closeModal())} className="btn btn-secondary w-full">Ləğv et</button>
          <button onClick={submit} className="btn btn-primary !h-[44px] w-full">Yarat</button>
        </div>
      </div>
    </div>
  );
}