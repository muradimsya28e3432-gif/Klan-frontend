import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, XCircle } from 'lucide-react';
import { clearToast } from '../redux/uiSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((s) => s.ui.toast);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => dispatch(clearToast()), 3000);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  if (!toast) return null;
  const err = toast.type === 'error';
  return (
    <div role="status" className={`modal-card fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-32px)] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[14px] font-semibold text-white border backdrop-blur ${err ? 'bg-[#2a0f24]/95 border-danger shadow-[0_0_30px_-6px_rgba(255,69,102,.6)]' : 'bg-[#06241f]/95 border-mint shadow-[0_0_30px_-6px_rgba(0,214,154,.6)]'}`}>
      {err ? <XCircle size={20} className="text-danger shrink-0" /> : <CheckCircle2 size={20} className="text-mint shrink-0" />}
      {toast.text}
    </div>
  );
}