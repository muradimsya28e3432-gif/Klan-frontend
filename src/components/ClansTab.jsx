import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Crown, Users, Plus, Handshake, Trophy, Rocket, LogOut } from 'lucide-react';
import { fetchClans, joinClan, leaveClan } from '../redux/clansSlice';
import { openModal } from '../redux/uiSlice';

export default function ClansTab() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.clans);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);

  useEffect(() => { dispatch(fetchClans()); }, [dispatch]);

  const empty = !loading && list.length === 0;

  return (
    <div className="page-wrap flex-grow">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="icon-tile"><Shield size={28} /></div>
          <div>
            <h2 className="text-[24px] md:text-[30px] font-bold text-pink leading-tight">Klanlar Mərkəzi</h2>
            {empty && <p className="text-sub">Hələ klan yoxdur. İlk klanı siz yaradın.</p>}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {myClan && <button onClick={() => dispatch(leaveClan())} className="btn btn-secondary w-full sm:w-auto"><LogOut /> Klandan çıx</button>}
          {!myClan && <button onClick={() => dispatch(openModal('createClan'))} className="btn btn-primary h-[50px] w-full sm:w-auto"><Plus /> Yeni Klan Yarat</button>}
        </div>
      </div>

      {loading && list.length === 0 && <p className="text-sub">Yüklənir...</p>}

      {empty && (
        <div className="card card-glow text-center py-12 md:py-16 px-5">
          <div className="relative w-[240px] h-[170px] mx-auto mb-6">
            <div className="absolute left-0 top-8 w-14 h-14 rounded-2xl bg-field border border-line2 flex items-center justify-center text-violet -rotate-12"><Handshake size={28} /></div>
            <div className="absolute right-0 top-8 w-14 h-14 rounded-2xl bg-field border border-line2 flex items-center justify-center text-violet rotate-12"><Trophy size={28} /></div>
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-28 rounded-[28px] icon-tile !w-28 !h-28"><Shield size={64} /></div>
            <Crown size={28} className="absolute left-1/2 -translate-x-1/2 top-9 text-pink2" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center justify-center w-24 h-24 rounded-full bg-violet/25 border border-violet/50 text-[#b9a0ff]"><Users size={52} /></div>
          </div>
          <h3 className="text-[26px] md:text-[34px] font-extrabold mb-3">Öz Klanınızı Yaradın!</h3>
          <p className="text-[15px] md:text-[17px] text-tx2 max-w-[600px] mx-auto mb-8">Daha böyük komandaya qoşulun, yarışlarda iştirak edin və birlikdə daha güclü olun!</p>
          {!myClan && (
            <button onClick={() => dispatch(openModal('createClan'))} className="btn btn-primary btn-lg w-full max-w-[310px] text-[18px]"><Rocket /> Yeni Klan Yarat</button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((c) => {
          const mine = myClan && myClan.id === c.id;
          return (
            <div key={c.id} className={`card card-hover flex flex-col gap-4 ${mine ? 'card-glow' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet/25 border border-violet/50 text-[#c9b6ff] font-extrabold text-[22px] flex items-center justify-center shrink-0">{(c.name || '?').charAt(0).toUpperCase()}</div>
                <div className="min-w-0">
                  <h3 className="title-card truncate">{c.name}</h3>
                  <p className="text-[12px] text-tx3">ID: {String(c.id).slice(-6)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-tx2">
                <span className="inline-flex items-center gap-1.5"><Crown size={16} className="text-warn" /> {c.leader || '—'}</span>
                <span className="inline-flex items-center gap-1.5"><Users size={16} className="text-cyan" /> {c.memberCount} üzv</span>
              </div>
              {mine ? <span className="badge badge-bad !bg-pink/15 !text-pink self-start">Klanınızdır</span> : (
                <button disabled={!!myClan} onClick={() => dispatch(joinClan(c.id))} className="btn btn-primary btn-sm !h-11 w-full">Klana daxil ol</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}