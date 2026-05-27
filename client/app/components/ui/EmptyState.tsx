interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
