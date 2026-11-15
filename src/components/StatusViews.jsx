export function EmptyState() {
  return (
    <div className="panel empty">
      <h2>Nothing to study yet</h2>
      <p>Add notes above and choose how many questions you want. You’ll get flashcards and a quiz built from the same set.</p>
    </div>
  );
}

export function Loading({ onCancel }) {
  return (
    <div className="panel" role="status">
      <h2>Writing your questions…</h2>
      <div className="skeleton" /><div className="skeleton short" />
      <button className="btn ghost" onClick={onCancel}>Cancel</button>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="panel error" role="alert">
      <h2>Couldn’t build your quiz</h2>
      <p>{error.message}</p>
      <button className="btn primary" onClick={onRetry}>Try again</button>
    </div>
  );
}
