export default function StatCard({ title, value, icon, variant = 'default', loading = false }) {
  const variantClasses = {
    default: 'border-l-primary',
    success: 'border-l-success',
    warning: 'border-l-warning',
    error: 'border-l-error',
    info: 'border-l-info'
  };

  return (
    <div className={`card bg-base-100 shadow-sm border-l-4 ${variantClasses[variant]}`}>
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-base-content/60">{title}</p>
            {loading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
          </div>
          {icon && <div className="text-3xl opacity-20">{icon}</div>}
        </div>
      </div>
    </div>
  );
}
