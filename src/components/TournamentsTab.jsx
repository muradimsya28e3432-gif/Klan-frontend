import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Medal, Hourglass, Loader2, Users, Coins, CalendarClock, SearchX } from 'lucide-react';
import { fetchTournaments, joinTournament } from '../redux/tournamentsSlice';
import { azn, fmtDate } from '../utils/money';

const TYPES = [['all', 'Hamısı'], ['daily', 'Gündəlik'], ['weekly', 'Həftəlik'], ['monthly', 'Aylıq'], ['seasonal', 'Mövsümi']];
const TYPE_LABEL = { daily: 'Gündəlik', weekly: 'Həftəlik', monthly: 'Aylıq', seasonal: 'Mövsümi' };
const STATUS = { upcoming: ['Tezliklə', 'badge-warn'], active: ['Davam edir', 'badge-ok'], finished: ['Bitib', 'badge-neutral'] };

export default function TournamentsTab() {
  const dispatch = useDispatch();
  const { list, loading, missing } = useSelector((s) => s.tournaments);
  const [type, setType] = useState('all');
  const [busy, setBusy] = useState(null);

  useEffect(() => { dispatch(fetchTournaments()); }, [dispatch]);

  const join = async (id) => { setBusy(id); await dispatch(joinTournament(id)); setBusy(null); };
  const shown = type === 'all' ? list : list.filter((t) => t.type === type);

  return (
    <div className="page-wrap max-w-[1100px] flex-grow">
      <div className="flex items-center gap-4 mb-6">
        <div className="icon-tile"><Medal size={28} /></div>
        <div>
          <h2 className="title-page">Tur<span className="text-pink">nirlər</span></h2>
          <p className="text-sub mt-1">Gündəlik, həftəlik, aylıq və mövsümi yarışlar.</p>
        </div>
      </div>

      {missing ? (
        <div className="card text-center py-12">
          <Hourglass size={56} className="mx-auto text-violet mb-4" />
          <p className="title-card">Turnirlər tezliklə aktiv olacaq</p>
          <p className="text-sub mt-1">Server tərəfi hələ hazır deyil. Bir az sonra yenidən yoxlayın.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {TYPES.map(([v, l]) => (
              <button key={v} onClick={() => setType(v)} className={`pill ${type === v ? 'pill-on' : ''}`}>{l}</button>
            ))}
            {loading && <Loader2 size={18} className="animate-spin text-tx3" />}
          </div>

          {!loading && shown.length === 0 ? (
            <div className="card text-center py-12">
              <SearchX size={56} className="mx-auto text-violet mb-4" />
              <p className="title-card">Turnir tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {shown.map((t) => {
                const [label, cls] = STATUS[t.status] || [t.status, 'badge-neutral'];
                const full = t.maxParticipants && t.participants >= t.maxParticipants;
                const canJoin = !t.joined && t.status !== 'finished' && !full;
                return (
                  <div key={t.id} className={`card card-hover ${t.joined ? 'card-glow' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-[12px] text-pink font-bold uppercase tracking-wide">{TYPE_LABEL[t.type] || t.type}</p>
                        <p className="text-[20px] font-bold truncate">{t.name}</p>
                      </div>
                      <span className={`badge ${cls}`}>{label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[14px] text-tx2 mb-4">
                      <span className="inline-flex items-center gap-2"><Coins size={16} className="text-warn" /> Mükafat: <strong className="text-mint">{azn(t.prizePool)}</strong></span>
                      <span className="inline-flex items-center gap-2"><Coins size={16} className="text-cyan" /> Giriş: <strong className="text-white">{t.entryFee ? azn(t.entryFee) : 'Pulsuz'}</strong></span>
                      <span className="inline-flex items-center gap-2"><Users size={16} className="text-cyan" /> {t.participants ?? 0}{t.maxParticipants ? ` / ${t.maxParticipants}` : ''} iştirakçı</span>
                      {t.endsAt && <span className="inline-flex items-center gap-2"><CalendarClock size={16} className="text-pink" /> {fmtDate(t.endsAt)}</span>}
                    </div>

                    {t.joined ? (
                      <button disabled className="btn btn-secondary w-full">Qoşulmusunuz</button>
                    ) : (
                      <button disabled={!canJoin || busy === t.id} onClick={() => join(t.id)} className="btn btn-primary w-full">
                        {busy === t.id && <Loader2 className="animate-spin" />} {full ? 'Yer qalmayıb' : t.status === 'finished' ? 'Bitib' : 'Turnirə qoşul'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}