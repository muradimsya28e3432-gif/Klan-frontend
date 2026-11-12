import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchMe } from '../redux/authSlice';
import { fetchProfile } from '../redux/usersSlice';
import useRealtime from '../hooks/useRealtime';
import Header from '../components/Header';
import CreateClanModal from '../components/CreateClanModal';
import TopUpModal from '../components/TopUpModal';

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

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col justify-between">
      <div className="flex flex-col min-h-screen justify-between">
        <Header />
        <Outlet />
      </div>

      {modal === 'createClan' && <CreateClanModal />}
      {modal === 'topUp' && <TopUpModal />}

      <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-900">© 2026 Klan.az — Bütün hüquqlar qorunur.</footer>
    </div>
  );
}