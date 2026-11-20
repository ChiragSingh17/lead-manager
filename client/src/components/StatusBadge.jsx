import { STATUS_META } from '../utils/constants.js';

export default function StatusBadge({ status }) {
  const tone = STATUS_META[status]?.tone || 'slate';

  return (
    <span className={`status-badge status-${tone}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
