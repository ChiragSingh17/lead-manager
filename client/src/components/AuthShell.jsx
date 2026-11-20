import { CheckCircle2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import Logo from './Logo.jsx';

const highlights = [
  'Capture every lead in seconds',
  'See your whole pipeline at a glance',
  'Keep follow-ups moving forward',
];

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <Logo />
        </div>

        <div className="auth-pitch">
          <span className="eyebrow eyebrow-light">
            <Sparkles size={14} />
            Your sales workspace
          </span>
          <h1>Turn every lead into your next win.</h1>
          <p>
            A focused workspace for capturing opportunities, qualifying conversations, and keeping
            your pipeline moving.
          </p>

          <ul className="auth-highlights">
            {highlights.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-proof">
          <div className="proof-avatars" aria-hidden="true">
            <span>AM</span>
            <span>SR</span>
            <span>DO</span>
          </div>
          <div>
            <strong>Built for focused sales teams</strong>
            <small>Simple by design. Fast by default.</small>
          </div>
          <ShieldCheck size={22} className="proof-icon" />
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-brand">
          <Logo small />
        </div>

        <div className="auth-card">
          <div className="auth-card-icon">
            <UsersRound size={22} />
          </div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>

        <p className="auth-legal">Your leads stay private to your account.</p>
      </main>
    </div>
  );
}
