// Dashboard summary card. tone: neutral | pending | confirmed | completed | cancelled
export default function StatCard({ label, value, icon, tone = "neutral", hint }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      {icon && <span className="stat-card-icon" aria-hidden="true">{icon}</span>}
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {hint && <div className="stat-card-hint">{hint}</div>}
      </div>
    </div>
  );
}
