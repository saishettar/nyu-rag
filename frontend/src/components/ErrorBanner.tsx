export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex max-w-measure items-start justify-between gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 rounded-md border border-danger/30 px-2 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
        >
          Retry
        </button>
      )}
    </div>
  );
}
