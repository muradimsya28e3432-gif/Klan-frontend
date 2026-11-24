import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Gift, Loader2, History, ArrowRight } from 'lucide-react';
import { fetchGifts } from '../redux/duelSlice';
import { api } from '../api/client';
import { azn, fmtDate } from '../utils/money';

export default function GiftsTab() {
  const dispatch = useDispatch();
  const gifts = useSelector((s) => s.duel.gifts);
  const totalGifted = useSelector((s) => s.wallet.totalGifted);
  const [hist, setHist] = useState(null); // null = yüklənir
  const [error, setError] = useState('');

  useEffect(() => { if (!gifts.length) dispatch(fetchGifts()); }, [dispatch, gifts.length]);

  useEffect(() => {
    let cancelled = false;
    api('/users/me/gifts')
      .then((d) => { if (!cancelled) setHist(Array.isArray(d) ? d : []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setHist([]); } });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-wrap max-w-[1100px] flex-grow space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="icon-tile"><Gift size={28} /></div>
          <div>
            <h2 className="title-page">Hədiyyə<span className="text-pink">lər</span></h2>
            <p className="text-sub mt-1">Virtual hədiyyələr, kolleksiya və göndərmə tarixçəsi.</p>
          </div>
        </div>
        <Link to="/duel" className="btn btn-primary">Hədiyyə göndər <ArrowRight /></Link>
      </div>

      <div className="card-balance flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] text-tx2">Ümumi atılan hədiyyə</p>
          <p className="text-[28px] font-extrabold text-mint leading-tight">{azn(totalGifted)}</p>
        </div>
        <span className="badge badge-warn">{gifts.length} kateqoriya</span>
      </div>

      <div className="card">
        <h3 className="title-card mb-4">Kolleksiya</h3>
        {gifts.length === 0 ? <Loader2 className="animate-spin text-tx3" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {gifts.map((g) => {
              const prices = g.subs.map((s) => s.price);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              return (
                <div key={g.category} className="card-inner !p-4 text-center">
                  <div className="text-[40px] leading-none mb-2">{g.icon}</div>
                  <p className="text-[14px] font-bold truncate">{g.name}</p>
                  <p className="text-[12px] text-tx3 mt-1">{(min / 100).toFixed(2)} – {(max / 100).toFixed(2)} ₼</p>
                  <p className="text-[12px] text-tx2">{g.subs.length} çeşid</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="title-card inline-flex items-center gap-2 mb-4"><History size={22} className="text-pink2" /> Göndərmə tarixçəsi</h3>
        {hist === null && <Loader2 className="animate-spin text-tx3" />}
        {error && <p className="text-[14px] text-danger">{error}</p>}
        {hist && !error && hist.length === 0 && <p className="text-[14px] text-tx3">Hələ hədiyyə atmamısınız.</p>}
        {hist && hist.length > 0 && (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {hist.map((t) => (
              <div key={t.id} className="row-item flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px]">
                <div className="min-w-0">
                  <p className="font-semibold inline-flex items-center gap-2"><Gift size={16} className="text-pink shrink-0" /> {t.giftName || 'Hədiyyə'}</p>
                  {t.sideName && <p className="text-[12px] text-tx3 mt-0.5">{t.sideName} tərəfinə</p>}
                </div>
                <span className="text-tx3">{fmtDate(t.createdAt)}</span>
                <span className="font-bold text-mint">{azn(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}