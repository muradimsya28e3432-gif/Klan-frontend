import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { openModal } from '../redux/uiSlice';
import { azn, initial } from '../utils/money';

export const TABS = [
  { id: 'duel', label: '🔥 Duellər', short: 'Duellər' },
  { id: 'klans', label: '🛡️ Klanlar', short: 'Klanlar' },
  { id: 'search', label: '🔍 Axtarış', short: 'Axtarış' },
  { id: 'wallet', label: '💳 Cüzdan', short: 'Cüzdan' },
  { id: 'profile', label: '👤 Profilim', short: 'Profilim' },
  { id: 'admin', label: '⚙️ Admin', short: 'Admin', admin: true },
];

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const balance = useSelector((s) => s.wallet.balance);
  const tabs = TABS.filter((t) => !t.admin || (user && user.role === 'admin'));

  const desktopCls = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg transition ${isActive ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`;
  const mobileCls = ({ isActive }) => (isActive ? 'text-rose-500' : 'text-slate-400');

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-extrabold tracking-wider text-rose-500">KLAN<span className="text-white">.AZ</span></h1>
          <nav className="hidden md:flex items-center gap-3 text-xs font-bold">
            {tabs.map((t) => (
              <NavLink key={t.id} to={`/${t.id}`} className={desktopCls}>{t.label}</NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Balans: <strong className="text-emerald-400 text-sm">{azn(balance)}</strong></span>
            <button onClick={() => dispatch(openModal('topUp'))} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-2.5 py-1.5 rounded-lg transition">+ Artır</button>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <div className="w-8 h-8 rounded-full bg-rose-600 font-bold flex items-center justify-center text-xs border border-rose-400">{initial(user?.username)}</div>
            <span className="text-xs font-bold hidden sm:inline">{user?.username || 'İstifadəçi'}</span>
            <button onClick={() => dispatch(logout())} className="text-xs text-rose-400 hover:underline ml-2">Çıxış</button>
          </div>
        </div>
      </header>

      <div className="md:hidden bg-slate-900 border-b border-slate-800 flex justify-around p-2 text-xs font-bold overflow-x-auto gap-3">
        {tabs.map((t) => (
          <NavLink key={t.id} to={`/${t.id}`} className={mobileCls}>{t.short}</NavLink>
        ))}
      </div>
    </>
  );
}