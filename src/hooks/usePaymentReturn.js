import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { fetchBalance, fetchHistory } from '../redux/walletSlice';
import { showToast } from '../redux/uiSlice';

const handled = new Set(); // eyni qayıdış iki dəfə işlənməsin (StrictMode)

// Stripe-dan qayıdanda (?payment=success&order=ID) ödənişin təsdiqini gözləyir və balansı yeniləyir
export default function usePaymentReturn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search, pathname } = useLocation();

  useEffect(() => {
    const p = new URLSearchParams(search);
    const payment = p.get('payment');
    const orderId = p.get('order');
    if (!payment) return;

    const key = `${payment}:${orderId}`;
    if (handled.has(key)) return;
    handled.add(key);
    navigate(pathname, { replace: true }); // ünvan sətrini təmizlə

    if (payment === 'cancel') {
      dispatch(showToast({ type: 'error', text: 'Ödəniş ləğv edildi' }));
      return;
    }
    if (payment !== 'success' || !orderId) return;

    (async () => {
      dispatch(showToast({ type: 'success', text: 'Ödəniş təsdiqlənir...' }));
      for (let i = 0; i < 15; i += 1) { // webhook gələnə qədər 30 saniyəyə qədər gözləyirik
        try {
          const orders = await api('/payments/orders');
          const o = orders.find((x) => x._id === orderId);
          if (o && o.status === 'paid') {
            dispatch(fetchBalance()); dispatch(fetchHistory());
            dispatch(showToast({ type: 'success', text: 'Ödəniş uğurludur, balansınız artırıldı' }));
            return;
          }
          if (o && o.status === 'failed') {
            dispatch(showToast({ type: 'error', text: 'Ödəniş alınmadı' }));
            return;
          }
        } catch { /* növbəti cəhd */ }
        await new Promise((r) => setTimeout(r, 2000));
      }
      dispatch(fetchBalance());
      dispatch(showToast({ type: 'error', text: 'Təsdiq gecikir. Pul çıxıbsa balans tezliklə yenilənəcək' }));
    })();
  }, [search, pathname, navigate, dispatch]);
}