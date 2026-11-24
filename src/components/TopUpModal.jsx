import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { createTopUp, devConfirm, clearOrder } from '../redux/walletSlice';
import { closeModal } from '../redux/uiSlice';
import { azn } from '../utils/money';

const PRESETS = [1, 5, 10, 20];

// Yalnız Stripe-ın öz ödəniş səhifəsinə yönləndiririk (başqa ünvana yox)
const isStripeUrl = (u) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' && (x.hostname === 'checkout.stripe.com' || x.hostname.endsWith('.stripe.com'));
  } catch { return false; }
};

export default function TopUpModal() {
  const dispatch = useDispatch();
  const { order, busy } = useSelector((s) => s.wallet);
  const [amount, setAmount] = useState('5');

  const close = () => { dispatch(clearOrder()); dispatch(closeModal()); };
  const toStripe = Boolean(order && isStripeUrl(order.paymentUrl));

  // Stripe-dan "geri" düyməsi ilə qayıdanda modal ilişib qalmasın
  useEffect(() => {
    const onShow = (e) => { if (e.persisted) { dispatch(clearOrder()); dispatch(closeModal()); } };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [dispatch]);

  const create = async () => {
    const res = await dispatch(createTopUp(amount));
    const url = res.payload && res.payload.paymentUrl;
    if (isStripeUrl(url)) window.location.assign(url); // eyni tabda Stripe səhifəsi
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-card max-w-[440px] w-full !p-7" style={{ borderColor: 'rgba(0,214,154,.45)' }}>
        <h3 className="title-card inline-flex items-center gap-2 mb-5 text-mint"><CreditCard size={22} /> Balansı artır</h3>

        {!order ? (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setAmount(String(p))}
                  className={`h-11 rounded-xl text-[14px] font-bold border transition ${Number(amount) === p ? 'bg-mint/15 border-mint text-mint' : 'bg-field border-line2 text-tx2 hover:text-white'}`}>{p} ₼</button>
              ))}
            </div>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)" className="input mb-4 focus:!border-mint" />
            <p className="hint flex items-center gap-2 mb-5"><ShieldCheck size={16} className="text-mint shrink-0" /> Ödəniş Stripe-ın təhlükəsiz səhifəsində aparılır.</p>
            <div className="flex gap-3">
              <button onClick={close} className="btn btn-secondary w-full">Ləğv et</button>
              <button onClick={create} disabled={busy} className="btn btn-green w-full">{busy && <Loader2 className="animate-spin" />} Ödənişə keç</button>
            </div>
          </>
        ) : toStripe ? (
          <>
            <div className="flex items-center gap-3 text-[14px] text-tx2 mb-5">
              <Loader2 className="animate-spin text-mint shrink-0" /> Stripe ödəniş səhifəsinə yönləndirilir...
            </div>
            <div className="flex gap-3">
              <button onClick={close} className="btn btn-secondary w-full">Ləğv et</button>
              <a href={order.paymentUrl} className="btn btn-green w-full">Açılmadısa bura basın</a>
            </div>
          </>
        ) : (
          <>
            <p className="text-[14px] text-tx2 mb-5">Sifariş yaradıldı: <strong className="text-white">{azn(order.amount)}</strong>. Ödəniş sistemi hələ qurulmayıb, adminlə əlaqə saxlayın.</p>
            <div className="flex gap-3">
              <button onClick={close} className="btn btn-secondary w-full">Bağla</button>
              {import.meta.env.DEV && (
                <button onClick={() => dispatch(devConfirm(order.orderId))} className="btn w-full h-11 rounded-xl bg-warn !text-[#1b1200]">Test təsdiqi</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}