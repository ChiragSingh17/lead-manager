import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiError } from '../utils/validation.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const destination = location.state?.from?.pathname || '/leads';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not sign in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  function useDemoAccount() {
    setEmail('demo@leadmanager.dev');
    setPassword('Demo@1234');
    setError('');
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error ? <div className="form-alert" role="alert">{error}</div> : null}

        <div className="field">
          <label htmlFor="login-email">Email address</label>
          <div className="input-with-icon">
            <Mail size={17} />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button type="submit" className="button button-primary auth-submit" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="spin" /> : null}
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting ? <ArrowRight size={18} /> : null}
        </button>
      </form>

      <button type="button" className="demo-button" onClick={useDemoAccount}>
        <Sparkles size={15} />
        Use demo credentials
      </button>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
