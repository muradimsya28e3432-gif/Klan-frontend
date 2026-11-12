import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTopUp, devConfirm, clearOrder } from '../redux/walletSlice';
import { closeModal } from '../redux/uiSlice';
import { azn } from '../utils/money';

const PRESETS = [1, 5, 10, 20];

export default function TopUpModal() {
  const dispatch = useDispatch();
  const { order, busy } = useSelector((s) => s.wallet);
  const [amount, setAmount] = useState('5');

  const close = () => { dispatch(clearOrder()); dispatch(closeModal()); };
  const create = async () => {
    const res = await dispatch(createTopUp(amount));
    const url = res.payload && res.payload.paymentUrl;
    if (url && url.startsWith('http')) window.open(url, '_blank', 'noopener'); // provayder səhifəsi
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <h3 className="font-extrabold text-base mb-4 text-emerald-400">💳 Balansı artır</h3>

        {!order ? (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setAmount(String(p))}
                  className={`py-2 rounded-lg text-xs font-bold border transition ${Number(amount) === p ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>{p} ₼</button>
              ))}
            </div>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Məbləğ (AZN)"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs w-full mb-4 focus:outline-none focus:border-emerald-500" />
            <div className="flex gap-2">
              <button onClick={close} className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold transition">Ləğv et</button>
              <button onClick={create} disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition">Ödənişə keç</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-300 mb-4">Sifariş yaradıldı: <strong>{azn(order.amount)}</strong>. Ödəniş təsdiqlənəndən sonra balansınız avtomatik artacaq.</p>
            <div className="flex gap-2">
              <button onClick={close} className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold transition">Bağla</button>
              {import.meta.env.DEV && (
                <button onClick={() => dispatch(devConfirm(order.orderId))} className="w-full bg-amber-600 hover:bg-amber-500 py-2.5 rounded-xl text-xs font-bold transition">Test təsdiqi</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}