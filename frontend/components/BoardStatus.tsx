"use client";

interface BoardStatusProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function BoardStatus({ isLoading, error, onRetry }: BoardStatusProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-column py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-sm text-text-muted">載入任務中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-red-500/40 bg-column py-16 text-center">
        <p className="text-sm font-medium text-red-300">無法載入任務</p>
        <p className="max-w-md text-xs text-text-muted">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-muted"
        >
          重試
        </button>
      </div>
    );
  }

  return null;
}
