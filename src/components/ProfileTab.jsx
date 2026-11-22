import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, UserPlus, Gift, Crown, Wallet, Coins } from 'lucide-react';
import { fetchProfile } from '../redux/usersSlice';
import { openModal } from '../redux/uiSlice';
import { azn, initial } from '../utils/money';

function Stat({ Icon, label, value, color = 'text-white', tint }) {
  return (
    <div className="card-inner min-h-[110px] flex items-center gap-4 !p-[22px]">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tint}`}><Icon size={24} /></div>
      <div className="min-w-0">
        <p className="text-[15px] text-tx2">{label}</p>
        <p className={`text-[22px] md:text-[28px] font-extrabold leading-tight truncate ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function ProfileTab() {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.users.me);
  const username = useSelector((s) => s.auth.user && s.auth.user.username);
  const balance = useSelector((s) => s.wallet.balance);

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  return (
    <div className="page-wrap flex-grow">
      <div className="card card-glow max-w-[1050px] mx-auto !p-5 sm:!p-10 !rounded-[26px] text-center bg-gradient-to-b from-[#161b4a] to-[#101632]">
        <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-pink border-[3px] border-pink2 text-[40px] md:text-[48px] font-bold flex items-center justify-center mx-auto mb-5 shadow-[0_0_44px_-4px_rgba(255,0,102,.7)]">{initial(username)}</div>
        <h2 className="text-[26px] md:text-[32px] font-extrabold">{username}</h2>
        <p className="inline-flex items-center gap-2 text-[15px] text-tx2 mt-3 bg-bg2/60 border border-line rounded-full px-4 py-2">
          <Crown size={18} className="text-warn" /> Klan: <strong className="text-pink">{me && me.clan ? me.clan.name : 'Hələ qoşulmayıb'}</strong>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
          <Stat Icon={Users} label="İzləyicilər" value={me ? me.followersCount : 0} tint="bg-cyan/15 text-cyan" />
          <Stat Icon={UserPlus} label="İzlədiklərim" value={me ? me.followingCount : 0} tint="bg-violet/20 text-[#b9a0ff]" />
          <Stat Icon={Gift} label="Atılan Hədiyyələr" value={azn(me ? me.totalGifted : 0)} color="text-mint" tint="bg-mint/15 text-mint" />
        </div>

        <div className="mt-5 card-balance flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <Coins size={40} className="text-warn" />
            <div>
              <p className="text-[15px] text-tx2">Balansınız</p>
              <p className="text-[24px] md:text-[28px] font-extrabold text-mint leading-tight">{azn(balance)}</p>
            </div>
          </div>
          <button onClick={() => dispatch(openModal('topUp'))} className="btn btn-primary h-[56px] w-full sm:w-auto sm:min-w-[260px]"><Wallet /> Balans artır</button>
        </div>
      </div>
    </div>
  );
}