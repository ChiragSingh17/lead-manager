import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiError, getFieldErrors } from '../utils/validation.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (values.name.trim().length < 2) nextErrors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (values.password.length < 8 || !/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
      nextErrors.password = 'Use at least 8 characters with a letter and a number.';
    }
    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      navigate('/leads', { replace: true });
    } catch (requestError) {
      setErrors(getFieldErrors(requestError));
      setError(getApiError(requestError, 'Could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="A clean pipeline is a few details away."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error ? <div className="form-alert" role="alert">{error}</div> : null}

        <div className="field">
          <label htmlFor="register-name">Full name</label>
          <div className="input-with-icon">
            <UserRound size={17} />
            <input
              id="register-name"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              className={errors.name ? 'invalid' : ''}
            />
          </div>
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="register-email">Email address</label>
          <div className="input-with-icon">
            <Mail size={17} />
            <input
              id="register-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              className={errors.email ? 'invalid' : ''}
            />
          </div>
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="register-password">Password</label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={errors.password ? 'invalid' : ''}
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
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </div>

        <div className="field">
          <label htmlFor="register-confirm">Confirm password</label>
          <div className="input-with-icon">
            <LockKeyhole size={17} />
            <input
              id="register-confirm"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={errors.confirmPassword ? 'invalid' : ''}
            />
          </div>
          {errors.confirmPassword ? <span className="field-error">{errors.confirmPassword}</span> : null}
        </div>

        <button type="submit" className="button button-primary auth-submit" disabled={submitting}>
          {submitting ? <Loader2 size={18} className="spin" /> : null}
          {submitting ? 'Creating account…' : 'Create account'}
          {!submitting ? <ArrowRight size={18} /> : null}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
