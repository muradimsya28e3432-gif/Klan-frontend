import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Plus, Crown, Users, Clock, Loader2, LogOut } from 'lucide-react';
import { fetchClans, fetchMyRequests, joinClan, leaveClan } from '../redux/clansSlice';
import { openModal } from '../redux/uiSlice';

export default function ClansTab() {
  const dispatch = useDispatch();
  const { list, loading, sent } = useSelector((s) => s.clans);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);

  useEffect(() => { dispatch(fetchClans()); dispatch(fetchMyRequests()); }, [dispatch]);

  // istək göndərdiyim (hələ cavab gəlməyən) klanların adları
  const pending = new Set(sent.filter((r) => r.status === 'pending').map((r) => r.clanName));

  const leave = () => { if (window.confirm('Klandan çıxmaq istəyirsiniz?')) dispatch(leaveClan()); };

  return (
    <div className="page-wrap flex-grow">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="icon-tile"><Shield size={28} /></div>
          <h2 className="title-page text-pink">Klanlar Mərkəzi</h2>
        </div>
        {!myClan && (
          <button onClick={() => dispatch(openModal('createClan'))} className="btn btn-primary">
            <Plus /> Yeni Klan Yarat
          </button>
        )}
      </div>

      {loading && list.length === 0 && <Loader2 className="animate-spin text-tx3" />}
      {!loading && list.length === 0 && <p className="text-sub">Hələ klan yoxdur.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((c) => {
          const mine = myClan && myClan.id === c.id;
          return (
            <div key={c.id} className={`card card-hover ${mine ? 'card-glow' : ''}`}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-[84px] h-[84px] rounded-2xl bg-violet/25 border border-violet/50 text-[#c9b6ff] font-extrabold text-[30px] flex items-center justify-center shrink-0">
                  {(c.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[22px] font-bold truncate">{c.name}</p>
                  <p className="text-[14px] text-tx3">ID: {String(c.id).slice(-6)}</p>
                </div>
              </div>

              <p className="text-[16px] text-tx2 inline-flex flex-wrap items-center gap-x-5 gap-y-1 mb-5">
                <span className="inline-flex items-center gap-2"><Crown size={20} className="text-warn" /> {c.leader || '—'}</span>
                <span className="inline-flex items-center gap-2"><Users size={20} className="text-cyan" /> {c.memberCount} üzv</span>
              </p>

              {mine ? (
                <button onClick={leave} className="btn btn-secondary w-full !h-[56px]"><LogOut /> Klandan çıx</button>
              ) : myClan ? (
                <button disabled className="btn btn-secondary w-full !h-[56px]">Artıq klandasınız</button>
              ) : pending.has(c.name) ? (
                <button disabled className="btn btn-secondary w-full !h-[56px]"><Clock /> İstək göndərilib</button>
              ) : (
                <button onClick={() => dispatch(joinClan(c.id))} className="btn btn-primary w-full !h-[56px]">Klana daxil ol</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}