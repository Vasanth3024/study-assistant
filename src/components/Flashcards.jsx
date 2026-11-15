import { useCallback, useEffect, useState } from 'react';
import { isTyping } from '../lib/dom.js';

export default function Flashcards({ questions }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const q = questions[i];

  const go = useCallback((d) => {
    setI((n) => Math.min(Math.max(n + d, 0), questions.length - 1));
    setFlipped(false);
  }, [questions.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div>
      <button className="card" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)} key={`${i}-${flipped}`}>
        {flipped ? (
          <>
            <span className="side">Answer</span>
            <span className="card-text answer"><mark>{q.options[q.answerIndex]}</mark></span>
            {q.explanation && <span className="card-note">{q.explanation}</span>}
          </>
        ) : (
          <>
            <span className="side">Question</span>
            <span className="card-text">{q.question}</span>
          </>
        )}
        <span className="hint">Tap to flip</span>
      </button>
      <div className="nav">
        <button className="btn ghost" onClick={() => go(-1)} disabled={i === 0}>Previous</button>
        <span>{i + 1} of {questions.length}</span>
        <button className="btn ghost" onClick={() => go(1)} disabled={i === questions.length - 1}>Next</button>
      </div>
    </div>
  );
}
