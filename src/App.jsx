import { useRef } from 'react';
import { useGenerate } from './hooks/useGenerate.js';
import InputPanel from './components/InputPanel.jsx';
import Study from './components/Study.jsx';
import { Loading, ErrorState, EmptyState } from './components/StatusViews.jsx';

export default function App() {
  const { status, deck, error, run, cancel } = useGenerate();
  const last = useRef(null);

  const submit = (text, count) => { last.current = { text, count }; run(text, count); };
  const retry = () => last.current && run(last.current.text, last.current.count);

  return (
    <div className="app">
      <header className="masthead">
        <h1>Study Assistant</h1>
        <p>Paste your notes. Get a quiz you can flip through, take, and re-test.</p>
      </header>
      <main>
        <InputPanel loading={status === 'loading'} onSubmit={submit} />
        <section className="results" aria-live="polite">
          {status === 'idle' && <EmptyState />}
          {status === 'loading' && <Loading onCancel={cancel} />}
          {status === 'error' && <ErrorState error={error} onRetry={retry} />}
          {status === 'success' && deck && <Study key={deck.id} deck={deck} />}
        </section>
      </main>
    </div>
  );
}
