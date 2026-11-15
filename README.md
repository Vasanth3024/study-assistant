# Study Assistant

Paste notes or a topic → an LLM returns a **structured JSON quiz** → the app validates it and renders interactive **flashcards** and a **quiz** with **re-test of wrong answers**. It is not a chatbot: the model's text is never shown directly.

## Setup

Requires Node 18+.

```bash
cp .env.example .env     # add your API key (Groq has a free tier)
npm install && npm start # API on :8787, client on http://localhost:5173
npm test                 # unit tests for the output parser
```

Any OpenAI-compatible provider works via `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` (Groq, OpenRouter, Gemini's OpenAI endpoint, OpenAI, or Ollama locally). `npm run serve` builds the client and serves it from the same Express server (handy for deploying).

## How it works

```
InputPanel ──► useGenerate ──► api.js ──► POST /api/generate (Express) ──► LLM
                   │                                                         │
                   ◄────────── parseDeck.js (extract + validate) ◄───────────┘
                   ▼
             Study ── Flashcards / Quiz (useQuiz reducer)
```

- **Key stays on the server.** `server/index.js` is a thin proxy: validates input, enforces a timeout, maps upstream errors to friendly codes, and returns the model's raw text. It uses plain `fetch` (no SDK) with JSON mode and a strict system prompt. User text is wrapped in markers and labelled as data to reduce prompt injection.
- **One data shape, two modes.** The model returns multiple-choice questions; flashcards use the same questions (front = question, back = correct answer + explanation).
- **`src/lib/parseDeck.js`** turns untrusted text into a safe deck.
- **`useGenerate`** owns request lifecycle (idle / loading / success / error).
- **`useQuiz`** is a reducer; quiz state lives in `Study` so switching tabs doesn't lose progress. "Retest missed" starts a new round from only the questions you got wrong, and can repeat until none are left.

## Handling bad AI output

| Failure | What happens |
|---|---|
| Fenced ```json or chatter around the JSON | Extracted and parsed anyway |
| Malformed JSON / wrong shape / empty list | One automatic retry, then an error with a **Try again** button |
| Some questions invalid (bad `answerIndex`, <2 options, blank text) | Those are dropped; valid ones are kept and the UI says how many were skipped |
| Duplicate options | De-duplicated; the correct answer is resolved by text first so indices can't drift |
| Answer always at the same position | Options are shuffled client-side |
| Slow response | 50 s client timeout (40 s server) + a **Cancel** button |
| Network / 429 / 5xx / bad key | Specific message from the server's error codes, with retry |
| Stale response | Every request gets an id and an `AbortController`; starting a new request aborts the old one and any late result from an old id is ignored |

## AI usage note
 
> I used Claude to scaffold the project structure and first drafts of the components, parser and README. I reviewed and ran all of it, and can explain each file. (Add anything specific: what you changed, what you debugged by hand, what you wrote yourself.)

## Known limitations

- Quiz questions are multiple choice only; no free-text or cloze cards.
- Sessions are not saved: a refresh loses the deck.
- No streaming; the quiz appears when generation finishes.
- No server-side rate limiting, so a public deployment would need it.
- Long notes are capped at 8,000 characters (no chunking).
- Small local models may fail JSON mode often; the retry and skip logic helps but can't fix very poor output.
- Question quality/factual accuracy depends on the model; there's no fact-checking.

## What I'd do next

Persist sessions to `localStorage`, stream questions as they generate, add a "make this harder / simpler" refinement prompt, support other card types, and add component tests with React Testing Library.

## Time spent

~X hours (fill in honestly; the brief asks for ≤ 8).
