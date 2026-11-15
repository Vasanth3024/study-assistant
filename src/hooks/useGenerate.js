import { useCallback, useRef, useState } from 'react';
import { requestDeck } from '../lib/api.js';
import { parseDeck, BadOutputError } from '../lib/parseDeck.js';

const CLIENT_TIMEOUT_MS = 50_000;
const MAX_ATTEMPTS = 2; // one automatic retry when the model's output is unusable

export function useGenerate() {
  const [state, setState] = useState({ status: 'idle', deck: null, error: null });
  const latestId = useRef(0);   // identifies the newest request
  const controller = useRef(null);

  const run = useCallback(async (text, count) => {
    controller.current?.abort();                // cancel the previous request
    const id = ++latestId.current;
    const ctrl = new AbortController();
    controller.current = ctrl;

    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, CLIENT_TIMEOUT_MS);
    setState((s) => ({ ...s, status: 'loading', error: null }));

    try {
      let deck;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const raw = await requestDeck({ text, count, signal: ctrl.signal });
        try { deck = parseDeck(raw); break; }
        catch (err) {
          if (!(err instanceof BadOutputError) || attempt === MAX_ATTEMPTS) throw err;
        }
      }
      if (id !== latestId.current) return;      // stale: a newer request owns the UI
      setState({ status: 'success', deck: { ...deck, id }, error: null });
    } catch (err) {
      if (id !== latestId.current) return;
      if (err.name === 'AbortError') {
        setState((s) => timedOut
          ? { ...s, status: 'error', error: { code: 'timeout', message: 'This is taking too long. Try again, or use shorter notes.' } }
          : { ...s, status: s.deck ? 'success' : 'idle', error: null }); // user cancelled
        return;
      }
      setState((s) => ({ ...s, status: 'error', error: { code: err.code ?? 'unknown', message: err.message || 'Something went wrong.' } }));
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const cancel = useCallback(() => controller.current?.abort(), []);
  return { ...state, run, cancel };
}
