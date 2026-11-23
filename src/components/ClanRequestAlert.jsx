import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, X, ChevronUp, Loader2 } from 'lucide-react';
import { fetchIncoming, fetchMyRequests, acceptRequest, rejectRequest } from '../redux/clansSlice';
import { showToast } from '../redux/uiSlice';
import { unseenRejected, markRejectedSeen } from '../utils/seenRequests';
import { initial } from '../utils/money';

const VISIBLE = 3; // eyni anda maksimum 3 kart göstərilir

export default function ClanRequestAlert() {
  const dispatch = useDispatch();
  const incoming = useSelector((s) => s.clans.incoming);
  const [busy, setBusy] = useState(null); // cavab verilən istəyin ID-si
  const [open, setOpen] = useState(true); // alert açıq/gizli
  const prevCount = useRef(0);

  // Sayt açılanda: gələn istəklər (lider üçün) + oflayn olanda rədd edilmişlər (oyunçu üçün)
  useEffect(() => {
    dispatch(fetchIncoming());
    dispatch(fetchMyRequests()).then((r) => {
      if (!fetchMyRequests.fulfilled.match(r)) return;
      const fresh = unseenRejected(r.payload);
      if (fresh.length > 0) {
        dispatch(showToast({ type: 'error', text: fresh[0].message || 'Klan sahibi tərəfindən qəbul edilmədiniz' }));
        markRejectedSeen(r.payload);
      }
    });
  }, [dispatch]);

  // Yeni istək gələndə gizlədilmiş alert yenidən açılır
  useEffect(() => {
    if (incoming.length > prevCount.current) setOpen(true);
    prevCount.current = incoming.length;
  }, [incoming.length]);

  const answer = async (action, id) => {
    setBusy(id);
    await dispatch(action(id));
    setBusy(null);
  };

  if (incoming.length === 0) return null;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed z-[55] right-4 top-[76px] md:top-[106px] badge badge-warn !h-10 !px-4 shadow-[0_0_24px_-6px_rgba(255,181,71,.7)]">
        <Bell size={16} /> {incoming.length} klan istəyi
      </button>
    );
  }

  return (
    <div className="fixed z-[55] right-4 top-[76px] md:top-[106px] w-[calc(100vw-32px)] max-w-[380px] space-y-3">
      <div className="flex items-center justify-between">
        <span className="badge badge-warn"><Bell size={14} /> {incoming.length} klan istəyi</span>
        <button onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-[12px] text-tx3 hover:text-white transition">
          Gizlət <ChevronUp size={14} />
        </button>
      </div>

      {incoming.slice(0, VISIBLE).map((r) => (
        <div key={r.id} role="alert" className="card card-glow modal-card !p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-pink border-2 border-pink2 font-bold flex items-center justify-center shrink-0">{initial(r.username)}</div>
            <p className="text-[14px] text-tx leading-snug">
              <strong className="text-pink">{r.username}</strong> oyunçusu <strong>{r.clanName}</strong> klanına qoşulmaq üçün istək göndərib
            </p>
          </div>
          <div className="flex gap-2">
            <button disabled={busy === r.id} onClick={() => answer(acceptRequest, r.id)} className="btn btn-green btn-sm !h-10 flex-1">
              {busy === r.id ? <Loader2 className="animate-spin" /> : <Check />} Qəbul et
            </button>
            <button disabled={busy === r.id} onClick={() => answer(rejectRequest, r.id)} className="btn btn-danger btn-sm !h-10 flex-1">
              <X /> Rədd et
            </button>
          </div>
        </div>
      ))}

      {incoming.length > VISIBLE && <p className="text-[12px] text-tx3 text-center">+{incoming.length - VISIBLE} istək daha var</p>}
    </div>
  );
}