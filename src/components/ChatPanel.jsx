import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadGlobal, loadPrivate, setChatMode, openPrivate } from '../redux/chatSlice';
import { showToast } from '../redux/uiSlice';
import { emitAck } from '../api/socket';

export default function ChatPanel() {
  const dispatch = useDispatch();
  const me = useSelector((s) => s.auth.user);
  const { mode, target, global, priv } = useSelector((s) => s.chat);
  const [text, setText] = useState('');
  const box = useRef(null);

  const list = mode === 'global' ? global : (target ? priv[target.id] || [] : []);

  useEffect(() => { dispatch(loadGlobal()); }, [dispatch]);
  useEffect(() => { if (mode === 'private' && target) dispatch(loadPrivate(target.id)); }, [mode, target, dispatch]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [list.length, mode]);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    if (mode === 'private' && !target) { dispatch(showToast({ type: 'error', text: 'Əvvəl Axtarışdan istifadəçi seçin' })); return; }
    try {
      await emitAck(mode === 'global' ? 'chat:global' : 'chat:private', mode === 'global' ? { text: t } : { to: target.id, text: t });
      setText('');
    } catch (e) { dispatch(showToast({ type: 'error', text: e.message })); }
  };

  const tabCls = (m) => `text-xs font-bold px-2.5 py-1 rounded-lg transition ${mode === m ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[450px] lg:h-auto shadow-xl">
      <div>
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <div className="flex gap-2">
            <button onClick={() => dispatch(setChatMode('global'))} className={tabCls('global')}>Ümumi</button>
            <button onClick={() => dispatch(setChatMode('private'))} className={tabCls('private')}>Şəxsi</button>
          </div>
          <span className="text-[10px] text-slate-400">{mode === 'global' ? 'Ümumi Çat' : target ? target.username : 'İstifadəçi seçilməyib'}</span>
        </div>

        <div ref={box} className="overflow-y-auto space-y-2 pr-1 text-xs mb-3 h-[280px] lg:h-[350px]">
          {list.length === 0 && (
            <p className="text-slate-500">{mode === 'private' && !target ? 'Axtarışdan istifadəçi tapıb "Mesaj" düyməsini basın.' : 'Hələ mesaj yoxdur.'}</p>
          )}
          {list.map((m) => {
            const mine = me && String(m.sender) === String(me.id);
            return (
              <div key={m.id} className="text-slate-300 break-words">
                <button disabled={mine || mode === 'private'} onClick={() => dispatch(openPrivate({ id: m.sender, username: m.senderName }))}
                  className={`font-bold ${mine ? 'text-emerald-400' : 'text-rose-400 hover:underline'}`}>{m.senderName}:</button>{' '}
                {m.text}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} maxLength={300} placeholder="Mesaj yaz..."
          className="bg-slate-800 text-xs border border-slate-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-rose-500" />
        <button onClick={submit} className="bg-rose-600 hover:bg-rose-500 px-3 py-2 rounded-lg text-xs font-bold transition">Göndər</button>
      </div>
    </div>
  );
}