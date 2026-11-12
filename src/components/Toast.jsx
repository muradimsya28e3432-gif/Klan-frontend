import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const cls = toast.type === 'error' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-emerald-600 shadow-emerald-600/30';
  return (
    <div role="status" className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg ${cls}`}>{toast.text}</div>
  );
}