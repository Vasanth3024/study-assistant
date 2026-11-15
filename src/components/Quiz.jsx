import { useEffect } from 'react';
import { isTyping } from '../lib/dom.js';

export default function Quiz({ quiz }) {
  const { state, pick, next, retake, restart } = quiz;
  const { queue, index, picked, score, missed, done, round } = state;
  const q = queue[index];

  useEffect(() => {
    if (done) return undefined;
    const onKey = (e) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (picked === null && n >= 1 && n <= q.options.length) pick(n - 1);
      else if (picked !== null && (e.key === 'ArrowRight' || (e.key === 'Enter' && e.target.tagName !== 'BUTTON'))) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, picked, q, pick, next]);

  if (done) {
    return (
      <div className="panel">
        <h2>{round > 1 ? `Retest round ${round}: ` : ''}{score} of {queue.length} correct</h2>
        {missed.length > 0 ? (
          <>
            <p>Review what you missed:</p>
            <ul className="missed">
              {missed.map((m) => (
                <li key={m.id}><strong>{m.question}</strong><br /><mark>{m.options[m.answerIndex]}</mark></li>
              ))}
            </ul>
            <button className="btn primary" onClick={retake}>Retest {missed.length} missed</button>
          </>
        ) : (
          <p>{round > 1 ? 'You got every missed question right.' : 'Perfect score.'}</p>
        )}
        <button className="btn ghost" onClick={restart}>Start over with all questions</button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="progress" aria-hidden="true"><div style={{ width: `${(index / queue.length) * 100}%` }} /></div>
      <p className="meta">{round > 1 ? 'Retest · ' : ''}Question {index + 1} of {queue.length}</p>
      <h3 className="q">{q.question}</h3>
      <div className="options" role="group" aria-label="Answers">
        {q.options.map((opt, n) => {
          const result = picked === null ? '' : n === q.answerIndex ? 'right' : n === picked ? 'wrong' : 'dim';
          return (
            <button key={n} className={`option ${result}`} disabled={picked !== null} onClick={() => pick(n)}>
              <kbd>{n + 1}</kbd>
              <span>{opt}</span>
              {result === 'right' && <b aria-label="Correct">✓</b>}
              {result === 'wrong' && <b aria-label="Incorrect">✗</b>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="feedback" role="status">
          <p><strong>{picked === q.answerIndex ? 'Correct.' : 'Not quite.'}</strong> {q.explanation}</p>
          <button className="btn primary" onClick={next}>{index + 1 >= queue.length ? 'See results' : 'Next question'}</button>
        </div>
      )}
    </div>
  );
}
