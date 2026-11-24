import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Lock, Send, MessagesSquare, Shield } from 'lucide-react';
import { loadGlobal, loadPrivate, loadClan, setChatMode, openPrivate } from '../redux/chatSlice';
import { showToast } from '../redux/uiSlice';
import { emitAck } from '../api/socket';

const EVENTS = { global: 'chat:global', private: 'chat:private', clan: 'chat:clan' };

export default function ChatPanel({ full = false }) {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.auth.user);
  const myClan = useSelector((s) => s.users.me && s.users.me.clan);
  const { mode, target, global, priv, clan } = useSelector((s) => s.chat);
  const [text, setText] = useState('');
  const box = useRef(null);

  // klanı olmayan istifadəçi "clan" rejimində qalıbsa ümumi çata qaytarılır
  const effMode = mode === 'clan' && !myClan ? 'global' : mode;
  const list = effMode === 'global' ? global : effMode === 'clan' ? clan : (target ? priv[target.id] || [] : []);

  useEffect(() => { dispatch(loadGlobal()); }, [dispatch]);
  useEffect(() => { if (effMode === 'private' && target) dispatch(loadPrivate(target.id)); }, [effMode, target, dispatch]);
  useEffect(() => { if (effMode === 'clan') dispatch(loadClan()); }, [effMode, dispatch]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [list.length, effMode]);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    if (effMode === 'private' && !target) { dispatch(showToast({ type: 'error', text: 'Əvvəl Axtarışdan istifadəçi seçin' })); return; }
    try {
      await emitAck(EVENTS[effMode], effMode === 'private' ? { to: target.id, text: t } : { text: t });
      setText('');
    } catch (e) { dispatch(showToast({ type: 'error', text: e.message })); }
  };

  const tabCls = (m) => `inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[14px] font-semibold transition ${effMode === m ? 'bg-pink text-white shadow-[0_0_20px_-4px_rgba(255,0,102,.7)]' : 'bg-field text-tx2 hover:text-white'}`;

  const title = effMode === 'global' ? 'Ümumi Çat' : effMode === 'clan' ? (myClan ? myClan.name : 'Klan çatı') : target ? target.username : 'İstifadəçi seçilməyib';
  const noTarget = effMode === 'private' && !target;
  const size = full ? 'h-[calc(100vh-330px)] min-h-[440px] md:h-[640px]' : 'h-[560px] lg:h-[720px] lg:sticky lg:top-[112px]';

  return (
    <div className={`card flex flex-col ${size}`}>
      <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-line">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => dispatch(setChatMode('global'))} className={tabCls('global')}><MessageCircle size={16} /> Ümumi</button>
          {myClan && <button onClick={() => dispatch(setChatMode('clan'))} className={tabCls('clan')}><Shield size={16} /> Klan</button>}
          <button onClick={() => dispatch(setChatMode('private'))} className={tabCls('private')}><Lock size={16} /> Şəxsi</button>
        </div>
        <span className="inline-flex items-center gap-2 text-[13px] text-tx2 min-w-0">
          <span className="truncate">{title}</span>
          {effMode !== 'private' && <span className="w-2 h-2 rounded-full bg-mint shadow-[0_0_8px_rgba(0,214,154,.9)] shrink-0" />}
        </span>
      </div>

      <div ref={box} className="flex-1 min-h-0 overflow-y-auto space-y-2.5 py-4 pr-1 text-[14px]">
        {list.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <MessagesSquare size={56} className="text-violet mb-4" />
            <p className="font-bold text-[16px] text-tx">{noTarget ? 'İstifadəçi seçilməyib' : 'Hələ mesaj yoxdur...'}</p>
            <p className="text-[13px] text-tx3 mt-1">{noTarget ? 'Dostlarınızdan birini seçin və ya Axtarışdan istifadəçi tapıb "Mesaj" düyməsini basın.' : 'İlk mesajı yazaraq söhbəti başladın!'}</p>
          </div>
        )}
        {list.map((m) => {
          const mine = me && String(m.sender) === String(me.id);
          return (
            <div key={m.id} className={`break-words leading-relaxed rounded-xl px-3.5 py-2 ${mine ? 'bg-mint/10 border border-mint/20' : 'bg-card2 border border-line'}`}>
              <button disabled={mine || effMode === 'private'} onClick={() => dispatch(openPrivate({ id: m.sender, username: m.senderName }))}
                className={`font-bold ${mine ? 'text-mint' : 'text-pink hover:underline'}`}>{m.senderName}:</button>{' '}
              <span className="text-tx">{m.text}</span>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} maxLength={300} placeholder="Mesaj yaz..." className="input h-[52px]" />
        <button onClick={submit} aria-label="Göndər" className="btn btn-primary h-[52px] w-[52px] !px-0 shrink-0"><Send /></button>
      </div>
    </div>
  );
}