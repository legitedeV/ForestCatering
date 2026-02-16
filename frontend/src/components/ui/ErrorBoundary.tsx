interface ErrorBoundaryProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorBoundary = ({
  message = 'Wystąpił błąd podczas ładowania danych.',
  onRetry
}: ErrorBoundaryProps) => {
  return (
    <div className="rounded-2xl border border-red-400/40 bg-fc-bgElev p-6 text-center">
      <h2 className="text-xl font-semibold">Ups!</h2>
      <p className="mt-2 text-fc-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-fc-accent px-4 py-2 font-semibold text-black"
        >
          Spróbuj ponownie
        </button>
      ) : null}
    </div>
  );
};
