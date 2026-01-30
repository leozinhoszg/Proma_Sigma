export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-6xl mb-4 opacity-30">{icon}</div>}
      <h3 className="text-lg font-semibold text-base-content/80">{title}</h3>
      {description && <p className="text-base-content/60 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
