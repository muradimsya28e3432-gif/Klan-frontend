import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Flame, Shield, Search, CreditCard, User, Settings, LogOut, Plus } from 'lucide-react';
import { logout } from '../redux/authSlice';
import { openModal } from '../redux/uiSlice';
import { azn, initial } from '../utils/money';

export const TABS = [
  { id: 'duel', label: 'Duellər', short: 'Duellər', Icon: Flame },
  { id: 'klans', label: 'Klanlar', short: 'Klanlar', Icon: Shield },
  { id: 'search', label: 'Axtarış', short: 'Axtarış', Icon: Search },
  { id: 'wallet', label: 'Cüzdan', short: 'Cüzdan', Icon: CreditCard },
  { id: 'profile', label: 'Profilim', short: 'Profilim', Icon: User },
  { id: 'admin', label: 'Admin', short: 'Admin', Icon: Settings, admin: true },
];

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const balance = useSelector((s) => s.wallet.balance);
  const tabs = TABS.filter((t) => !t.admin || (user && user.role === 'admin'));

  const desktopCls = ({ isActive }) => `nav-pill ${isActive ? 'on' : ''}`;
  const mobileCls = ({ isActive }) =>
    `flex flex-col items-center gap-1 min-w-[54px] px-2 py-1.5 rounded-xl text-[11px] font-semibold transition ${isActive ? 'text-pink' : 'text-tx3'}`;

  return (
    <>
      <header className="sticky top-0 z-40 h-[64px] md:h-[94px] px-4 md:px-6 flex items-center justify-between gap-3 bg-bg2/95 backdrop-blur border-b border-line">
        <div className="flex items-center gap-4 xl:gap-8 min-w-0">
          <h1 className="text-[27px] md:text-[36px] font-extrabold tracking-tight leading-none text-pink shrink-0">
            KLAN<span className="text-white">.AZ</span>
          </h1>
          <nav className="hidden md:flex items-center gap-2 xl:gap-3">
            {tabs.map((t) => (
              <NavLink key={t.id} to={`/${t.id}`} className={desktopCls} title={t.label}>
                <t.Icon />
                <span className="hidden xl:inline">{t.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4 xl:gap-5">
          <div className="flex items-center gap-2 xl:gap-3">
            <span className="text-[13px] md:text-[15px] text-tx2 whitespace-nowrap">
              <span className="hidden xl:inline">Balans: </span>
              <strong className="text-mint font-bold text-[14px] md:text-[18px]">{azn(balance)}</strong>
            </span>
            <button onClick={() => dispatch(openModal('topUp'))} className="btn btn-green h-[36px] md:h-[42px] px-3 md:px-4 rounded-[12px]">
              <Plus className="hidden md:block" /> Artır
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3 border-l border-line pl-2 md:pl-4">
            <div className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-full bg-pink border-2 border-pink2 text-white font-bold flex items-center justify-center text-[15px] shadow-[0_0_18px_-2px_rgba(255,0,102,.6)]">
              {initial(user?.username)}
            </div>
            <span className="hidden xl:inline text-[15px] font-bold text-white">{user?.username || 'İstifadəçi'}</span>
            <button onClick={() => dispatch(logout())} className="flex items-center gap-1.5 text-[14px] font-semibold text-pink hover:brightness-125 transition p-1" aria-label="Çıxış">
              <LogOut size={18} />
              <span className="hidden lg:inline">Çıxış</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around gap-1 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] bg-bg2/95 backdrop-blur border-t border-line">
        {tabs.map((t) => (
          <NavLink key={t.id} to={`/${t.id}`} className={mobileCls}>
            <t.Icon size={22} />
            {t.short}
          </NavLink>
        ))}
      </nav>
    </>
  );
}