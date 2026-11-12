import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/usersSlice';
import { azn, initial } from '../utils/money';

export default function ProfileTab() {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.users.me);
  const username = useSelector((s) => s.auth.user && s.auth.user.username);
  const balance = useSelector((s) => s.wallet.balance);

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  return (
    <div className="max-w-2xl w-full mx-auto p-6 flex-grow">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
        <div className="w-24 h-24 rounded-full bg-rose-600 text-3xl font-extrabold flex items-center justify-center mx-auto border-2 border-rose-400 mb-4 shadow-lg">{initial(username)}</div>
        <h2 className="text-xl font-extrabold">{username}</h2>
        <p className="text-xs text-slate-400 mt-1">Klan: <strong className="text-rose-400">{me && me.clan ? me.clan.name : 'Hələ qoşulmayıb'}</strong></p>

        <div className="flex justify-center gap-6 my-6 border-y border-slate-800 py-4">
          <div><p className="text-xs text-slate-400">Takibçilər</p><p className="text-lg font-bold">{me ? me.followersCount : 0}</p></div>
          <div><p className="text-xs text-slate-400">Takib Edilənlər</p><p className="text-lg font-bold">{me ? me.followingCount : 0}</p></div>
          <div><p className="text-xs text-slate-400">Atılan Hədiyyələr</p><p className="text-lg font-bold text-emerald-400">{azn(me ? me.totalGifted : 0)}</p></div>
        </div>
        <p className="text-xs text-slate-400">Balans: <strong className="text-emerald-400">{azn(balance)}</strong></p>
      </div>
    </div>
  );
}