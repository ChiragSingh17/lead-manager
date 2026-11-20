import Logo from './Logo.jsx';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <Logo />
      </div>
      <div className="loading-bar">
        <span />
      </div>
    </div>
  );
}
