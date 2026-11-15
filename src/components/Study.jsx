import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz.js';
import Flashcards from './Flashcards.jsx';
import Quiz from './Quiz.jsx';

export default function Study({ deck }) {
  const [mode, setMode] = useState('cards');
  const quiz = useQuiz(deck.questions); // lives here so quiz progress survives tab switches
  const n = deck.questions.length;

  return (
    <div>
      <div className="deck-head">
        <h2>{deck.title}</h2>
        <p>{n} question{n === 1 ? '' : 's'}{deck.skipped > 0 && `, ${deck.skipped} unusable ${deck.skipped === 1 ? 'one was' : 'ones were'} skipped`}</p>
      </div>
      <div className="tabs" role="tablist">
        {[['cards', 'Flashcards'], ['quiz', 'Quiz']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} className={mode === id ? 'on' : ''} onClick={() => setMode(id)}>{label}</button>
        ))}
      </div>
      {mode === 'cards' ? <Flashcards questions={deck.questions} /> : <Quiz quiz={quiz} />}
    </div>
  );
}
