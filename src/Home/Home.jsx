import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchMe } from '../redux/authSlice';
import { fetchProfile } from '../redux/usersSlice';
import useRealtime from '../hooks/useRealtime';
import usePaymentReturn from '../hooks/usePaymentReturn';
import Header from '../components/Header';
import CreateClanModal from '../components/CreateClanModal';
import TopUpModal from '../components/TopUpModal';
import ClanRequestAlert from '../components/ClanRequestAlert';

export default function Home() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const modal = useSelector((s) => s.ui.modal);

  useEffect(() => {
    dispatch(fetchMe()).then((r) => { // token etibarlıdırsa profili yüklə
      if (fetchMe.fulfilled.match(r)) dispatch(fetchProfile());
    });
  }, [dispatch]);
  useRealtime(token);
  usePaymentReturn(); // Stripe-dan qayıdış

  return (
    <div className="text-white min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {modal === 'createClan' && <CreateClanModal />}
      {modal === 'topUp' && <TopUpModal />}
      <ClanRequestAlert />

      <footer className="text-center py-4 text-[13px] text-tx3 border-t border-line">© 2026 Klan.az — Bütün hüquqlar qorunur.</footer>
    </div>
  );
}