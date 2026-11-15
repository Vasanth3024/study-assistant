// Turns untrusted model text into a clean deck, or throws BadOutputError.
// Philosophy: be tolerant of harmless formatting noise, strict about anything
// that would break the UI (e.g. an answerIndex pointing at nothing).

export class BadOutputError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const MAX_OPTIONS = 6;

function extractJson(raw) {
  let s = String(raw).trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i); // ```json ... ```
  if (fenced) s = fenced[1].trim();
  try { return JSON.parse(s); } catch { /* fall through */ }

  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end > start) { // prose before/after the object
    try { return JSON.parse(s.slice(start, end + 1)); } catch { /* fall through */ }
  }
  throw new BadOutputError('malformed', 'The AI replied with something that was not valid JSON.');
}

const text = (v) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

function shuffle(arr) { // models love putting the answer at index 0/1
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const question = text(q.question);
  if (!question || !Array.isArray(q.options)) return null;

  const raw = q.options.map(text);
  // Resolve the correct answer by TEXT before de-duplicating, so indices can't drift.
  let correct = null;
  if (Number.isInteger(q.answerIndex) && raw[q.answerIndex]) correct = raw[q.answerIndex];
  else if (typeof q.answer === 'string') {
    correct = raw.find((o) => o && o.toLowerCase() === q.answer.trim().toLowerCase()) ?? null;
  }
  if (!correct) return null;

  const options = [...new Set(raw.filter(Boolean))].slice(0, MAX_OPTIONS);
  if (options.length < 2 || !options.includes(correct)) return null;

  const shuffled = shuffle(options);
  return { question, options: shuffled, answerIndex: shuffled.indexOf(correct), explanation: text(q.explanation) };
}

export function parseDeck(raw) {
  const data = extractJson(raw);
  const list = Array.isArray(data) ? data : data?.questions;
  if (!Array.isArray(list)) throw new BadOutputError('wrong_shape', 'The AI replied in a format we could not read.');
  if (list.length === 0) throw new BadOutputError('empty', 'The AI did not return any questions.');

  const questions = list.map(normalizeQuestion).filter(Boolean).map((q, id) => ({ ...q, id }));
  if (questions.length === 0) throw new BadOutputError('wrong_shape', 'None of the questions the AI returned were usable.');

  return { title: text(data?.title) || 'Study set', questions, skipped: list.length - questions.length };
}
