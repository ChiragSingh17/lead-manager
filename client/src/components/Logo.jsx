import { Magnet } from 'lucide-react';

export default function Logo({ small = false }) {
  return (
    <span className={`brand ${small ? 'brand-small' : ''}`}>
      <span className="brand-mark">
        <Magnet size={small ? 17 : 20} strokeWidth={2.4} />
      </span>
      <span className="brand-wordmark">
        Lead<span>Manager</span>
      </span>
    </span>
  );
}
