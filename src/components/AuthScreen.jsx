import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authenticate, clearAuthError } from '../redux/authSlice';

export default function AuthScreen() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    dispatch(authenticate({ mode, username: username.trim(), password }));
  };
  const toggle = () => { dispatch(clearAuthError()); setMode(mode === 'login' ? 'register' : 'login'); };
  const input = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500';

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-wider text-rose-500 mb-2">KLAN<span className="text-white">.AZ</span></h1>
        <p className="text-xs text-slate-400 mb-6">Bölgə və qrupların rəqabət platforması</p>

        <div className="space-y-4 text-left">
          <div>
            <label className="text-xs text-slate-400 block mb-1">İstifadəçi Adı</label>
            <input className={input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Məsələn: Nicat_Baku" maxLength={20} autoComplete="username" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Şifrə</label>
            <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ən az 8 simvol" maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-rose-600/30">
            {loading ? 'Gözləyin...' : mode === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç'}
          </button>
          <button type="button" onClick={toggle} className="w-full text-xs text-slate-400 hover:text-white transition">
            {mode === 'login' ? 'Hesabınız yoxdur? Qeydiyyatdan keçin' : 'Artıq hesabınız var? Daxil olun'}
          </button>
        </div>
      </form>
    </div>
  );
}