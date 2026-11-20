import { LogOut, UsersRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { avatarTone, getInitials } from '../utils/format.js';
import Logo from './Logo.jsx';

export default function AppLayout({ leadCount, children }) {
  const { user, logout } = useAuth();
  const initials = getInitials(user?.name);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Link to="/leads" aria-label="Lead Manager home">
            <Logo />
          </Link>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>
          <nav className="sidebar-nav">
            <NavLink to="/leads" className="nav-item active">
              <UsersRound size={19} />
              <span>Leads</span>
              <span className="nav-count">{leadCount ?? '—'}</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-pipeline">
          <span className="sidebar-label">Pipeline</span>
          <strong>{leadCount ?? '—'}</strong>
          <p>Total leads captured</p>
          <div className="pipeline-bars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="sidebar-user">
          <div className={`avatar avatar-${avatarTone(user?.name)}`}>{initials}</div>
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button type="button" className="icon-button sidebar-logout" onClick={logout} title="Sign out">
            <LogOut size={17} />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </aside>

      <header className="mobile-header">
        <Link to="/leads" aria-label="Lead Manager home">
          <Logo small />
        </Link>
        <div className="mobile-user">
          <div className={`avatar avatar-${avatarTone(user?.name)}`}>{initials}</div>
          <button type="button" className="icon-button" onClick={logout} title="Sign out">
            <LogOut size={18} />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
