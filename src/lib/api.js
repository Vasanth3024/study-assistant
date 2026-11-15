export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Returns the model's raw text. Parsing/validation happens in parseDeck.js.
export async function requestDeck({ text, count, signal }) {
  let res;
  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, count }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('network', "Couldn't reach the server. Check that it is running and you're online.");
  }

  let body = null;
  try { body = await res.json(); } catch { /* non-JSON error page */ }

  if (!res.ok) {
    throw new ApiError(body?.error?.code ?? `http_${res.status}`, body?.error?.message ?? `Request failed (${res.status}).`);
  }
  if (typeof body?.content !== 'string') {
    throw new ApiError('bad_response', 'The server sent an unexpected response.');
  }
  return body.content;
}
