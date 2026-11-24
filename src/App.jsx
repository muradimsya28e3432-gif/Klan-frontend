import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';
import Home from './Home/Home';
import HomeTab from './components/HomeTab';
import DuelPanel from './components/DuelPanel';
import ChatPanel from './components/ChatPanel';
import DuelHistory from './components/DuelHistory';
import ClansTab from './components/ClansTab';
import TournamentsTab from './components/TournamentsTab';
import RankTab from './components/RankTab';
import SearchTab from './components/SearchTab';
import MessagesTab from './components/MessagesTab';
import CommunityTab from './components/CommunityTab';
import GiftsTab from './components/GiftsTab';
import ShopTab from './components/ShopTab';
import WalletTab from './components/WalletTab';
import ProfileTab from './components/ProfileTab';
import AdminTab from './components/AdminTab';

function DuelPage() {
  return (
    <>
      <div className="page-wrap grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-5 xl:gap-6 items-start">
        <DuelPanel />
        <ChatPanel />
      </div>
      <DuelHistory />
    </>
  );
}

function AdminRoute() {
  const role = useSelector((s) => s.auth.user && s.auth.user.role);
  const user = useSelector((s) => s.auth.user);
  if (!user) return null; // user hələ yüklənir
  return role === 'admin' ? <AdminTab /> : <Navigate to="/home" replace />;
}

export default function App() {
  const token = useSelector((s) => s.auth.token);

  return (
    <>
      {token ? (
        <Routes>
          <Route element={<Home />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeTab />} />
            <Route path="/duel" element={<DuelPage />} />
            <Route path="/klans" element={<ClansTab />} />
            <Route path="/tournaments" element={<TournamentsTab />} />
            <Route path="/rank" element={<RankTab />} />
            <Route path="/search" element={<SearchTab />} />
            <Route path="/messages" element={<MessagesTab />} />
            <Route path="/community" element={<CommunityTab />} />
            <Route path="/gifts" element={<GiftsTab />} />
            <Route path="/shop" element={<ShopTab />} />
            <Route path="/wallet" element={<WalletTab />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      ) : (
        <AuthScreen />
      )}
      <Toast />
    </>
  );
}