import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';
import Home from './Home/Home';
import DuelPanel from './components/DuelPanel';
import ChatPanel from './components/ChatPanel';
import DuelHistory from './components/DuelHistory';
import ClansTab from './components/ClansTab';
import SearchTab from './components/SearchTab';
import WalletTab from './components/WalletTab';
import ProfileTab from './components/ProfileTab';
import AdminTab from './components/AdminTab';

function DuelPage() {
  return (
    <>
      <div className="max-w-6xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow my-auto">
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
  return role === 'admin' ? <AdminTab /> : <Navigate to="/duel" replace />;
}

export default function App() {
  const token = useSelector((s) => s.auth.token);

  return (
    <>
      {token ? (
        <Routes>
          <Route element={<Home />}>
            <Route index element={<Navigate to="/duel" replace />} />
            <Route path="/duel" element={<DuelPage />} />
            <Route path="/klans" element={<ClansTab />} />
            <Route path="/search" element={<SearchTab />} />
            <Route path="/wallet" element={<WalletTab />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<Navigate to="/duel" replace />} />
          </Route>
        </Routes>
      ) : (
        <AuthScreen />
      )}
      <Toast />
    </>
  );
}