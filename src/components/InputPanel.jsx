import { useState } from 'react';

const MAX_CHARS = 8000;
const EXAMPLE = `Photosynthesis converts light energy into chemical energy. In the light-dependent reactions, chlorophyll in the thylakoid membranes absorbs light, splits water, releases oxygen, and produces ATP and NADPH. In the Calvin cycle, which happens in the stroma, the enzyme RuBisCO fixes carbon dioxide and ATP and NADPH are used to build glucose.`;

export default function InputPanel({ loading, onSubmit }) {
  const [text, setText] = useState('');
  const [count, setCount] = useState(8);
  const [touched, setTouched] = useState(false);

  const trimmed = text.trim();
  const problem = !trimmed
    ? 'Paste some notes or type a topic.'
    : text.length > MAX_CHARS ? `That is ${text.length - MAX_CHARS} characters over the limit.` : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!problem) onSubmit(trimmed, count);
  };

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <label htmlFor="notes">Your notes or a topic</label>
      <textarea
        id="notes"
        rows={7}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Notes from chapter 4, or just “the French Revolution”"
        aria-invalid={touched && Boolean(problem)}
        aria-describedby="notes-help"
      />
      <div id="notes-help" className={`help ${touched && problem ? 'bad' : ''}`}>
        <span>{touched && problem ? problem : `${text.length} / ${MAX_CHARS}`}</span>
        {!text && <button type="button" className="link" onClick={() => setText(EXAMPLE)}>Use an example</button>}
      </div>
      <div className="controls">
        <label className="inline">
          Questions
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {[5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Generating…' : 'Generate quiz'}
        </button>
      </div>
    </form>
  );
}
