import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { authenticate, clearAuthError } from '../redux/authSlice';

export default function AuthScreen() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    dispatch(authenticate({ mode, username: username.trim(), password }));
  };
  const toggle = () => { dispatch(clearAuthError()); setMode(mode === 'login' ? 'register' : 'login'); };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <form onSubmit={submit} className="card card-glow modal-card w-full max-w-[600px] p-6 sm:p-10 rounded-[24px] text-center">
          <h1 className="text-[38px] sm:text-[46px] font-extrabold tracking-tight leading-none text-pink mb-3">KLAN<span className="text-white">.AZ</span></h1>
          <p className="text-[14px] sm:text-[16px] text-tx2 mb-8">Bölgə və qrupların rəqabət platforması</p>

          <div className="space-y-5 text-left">
            <div>
              <label className="flex items-center gap-2 text-[14px] font-medium text-tx2 mb-2"><User size={18} /> İstifadəçi Adı</label>
              <div className="input-wrap">
                <User className="lead" />
                <input className="input input-lg" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Məsələn: Nicat_Baku" maxLength={20} autoComplete="username" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-[14px] font-medium text-tx2 mb-2"><Lock size={18} /> Şifrə</label>
              <div className="input-wrap">
                <Lock className="lead" />
                <input className={`input input-lg pr-14 ${error ? 'input-error' : ''}`} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ən az 8 simvol" maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" className="trail" onClick={() => setShow(!show)} aria-label={show ? 'Şifrəni gizlət' : 'Şifrəni göstər'}>
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="field-error">{error}</p>}
            </div>

            <button disabled={loading} className="btn btn-primary btn-lg w-full text-[18px]">
              {loading ? <><Loader2 className="animate-spin" /> Gözləyin...</> : <>{mode === 'login' ? 'Daxil Ol' : 'Qeydiyyatdan Keç'} <ArrowRight /></>}
            </button>

            <p className="text-center text-[15px] text-tx2 pt-4 border-t border-line">
              {mode === 'login' ? 'Hesabınız yoxdur? ' : 'Artıq hesabınız var? '}
              <button type="button" onClick={toggle} className="text-pink font-semibold hover:brightness-125 transition">
                {mode === 'login' ? 'Qeydiyyatdan keçin' : 'Daxil olun'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}