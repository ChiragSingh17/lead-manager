export default function StatCard({ label, value, icon: Icon, tone, detail, loading }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={19} strokeWidth={2.1} />
        </span>
        {loading ? <span className="skeleton skeleton-number" /> : <strong>{value}</strong>}
      </div>
      <div className="stat-label">{label}</div>
      {detail !== undefined && <div className="stat-detail">{detail}</div>}
    </article>
  );
}
