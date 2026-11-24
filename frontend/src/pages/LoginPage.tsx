import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, storeTokens, type User } from '../services/api';

interface Props {
  onLoginSuccess: (user: User) => void;
}

type Mode = 'login' | 'register';

export default function LoginPage({ onLoginSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [region, setRegion] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const tokens = await api.login(email, password);
      storeTokens(tokens);
      const me = await api.getMe();
      onLoginSuccess(me);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.register({
        email: regEmail,
        password: regPassword,
        password_confirm: regPasswordConfirm,
        first_name: firstName,
        last_name: lastName,
        country,
        region,
      });
      // Registration succeeded — log them straight in rather than
      // making them retype their credentials on a fresh form.
      const tokens = await api.login(regEmail, regPassword);
      storeTokens(tokens);
      const me = await api.getMe();
      onLoginSuccess(me);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    'w-full bg-transparent border-b border-[#C9DAD3] text-[#10243E] py-2 focus:outline-none focus:border-[#2A6DF4] transition placeholder:text-[#9AAAB8]';
  const labelClasses = 'block text-sm text-[#4C5F70] mb-1';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7FBFA]">
      {/* Left panel — mood, matches the landing page palette */}
      <div className="md:w-[42%] bg-gradient-to-b from-[#EAF7F2] to-[#F7FBFA] flex flex-col justify-center px-10 py-16 md:px-16 relative overflow-hidden">
        <Waveform />
        <h1 className="text-3xl md:text-4xl leading-tight text-[#10243E] relative" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === 'login' ? 'Good to see you again.' : 'Let\u2019s get you ready.'}
        </h1>
        <p className="mt-4 text-[#4C5F70] max-w-sm relative">
          {mode === 'login'
            ? 'Pick up your interview practice right where you left off.'
            : 'Create your account and get a set of interview questions tailored to your profile.'}
        </p>
      </div>

      {/* Right panel — the form */}
      <div className="md:w-[58%] flex items-center px-10 py-16 md:px-20">
        <div className="w-full max-w-sm">
          {/* Tab switcher */}
          <div className="flex gap-6 mb-8 border-b border-[#E2EBE7]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`pb-3 text-sm font-medium transition ${
                mode === 'login' ? 'text-[#10243E] border-b-2 border-[#2A6DF4]' : 'text-[#9AAAB8]'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`pb-3 text-sm font-medium transition ${
                mode === 'register' ? 'text-[#10243E] border-b-2 border-[#2A6DF4]' : 'text-[#9AAAB8]'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <label className={labelClasses}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} mb-6`} placeholder="you@example.com" />

              <label className={labelClasses}>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className={`${inputClasses} mb-8`} placeholder="••••••••" />

              {error && <p className="text-sm text-[#D9534F] mb-6" role="alert">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-[#2A6DF4] text-white font-medium hover:bg-[#1F58D1] transition disabled:opacity-50 rounded-lg">
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClasses}>First name</label>
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Last name</label>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} />
                </div>
              </div>

              <label className={labelClasses}>Email</label>
              <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                className={`${inputClasses} mb-6`} placeholder="you@example.com" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelClasses}>Country</label>
                  <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>City / Region</label>
                  <input required value={region} onChange={(e) => setRegion(e.target.value)} className={inputClasses} placeholder="e.g. Pretoria" />
                </div>
              </div>

              <label className={labelClasses}>Password</label>
              <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                className={`${inputClasses} mb-6`} />

              <label className={labelClasses}>Confirm password</label>
              <input type="password" required value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)}
                className={`${inputClasses} mb-8`} />

              {error && <p className="text-sm text-[#D9534F] mb-6" role="alert">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-[#2A6DF4] text-white font-medium hover:bg-[#1F58D1] transition disabled:opacity-50 rounded-lg">
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Waveform() {
  const bars = [8, 20, 14, 28, 10, 22, 16, 6, 18, 12];
  return (
    <div className="flex items-end gap-1 h-10 mb-10 opacity-70 relative">
      {bars.map((h, i) => (
        <div key={i} className="w-1.5 bg-[#2A6DF4]" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}