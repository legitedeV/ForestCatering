interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState = ({
  title = 'Brak produktów',
  description = 'Spróbuj ponownie później lub wybierz inną kategorię.'
}: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-fc-accent/30 bg-fc-bgElev p-6 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-fc-muted">{description}</p>
    </div>
  );
};
