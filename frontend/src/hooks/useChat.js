import { useCallback, useEffect, useRef, useState } from 'react';

// Development uses Vite's same-origin proxy, avoiding localhost/CORS differences.
const API = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000')).replace(/\/$/, '');

export function useExplain() {
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const controller = useRef(null);
  const lastRequest = useRef(null);
  const busy = useRef(false);

  useEffect(() => () => controller.current?.abort(), []);

  const request = useCallback(async (payload) => {
    // A ref closes the gap before React renders, preventing duplicate submissions.
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    lastRequest.current = payload;
    const abort = new AbortController();
    controller.current = abort;
    setExplanation('');
    let timer;
    const resetTimeout = () => { clearTimeout(timer); timer = setTimeout(() => abort.abort('timeout'), 45000); };
    resetTimeout();
    try {
      const response = await fetch(`${API}/api/explain/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abort.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'The server could not process your request. Please retry.');
      }
      if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('The server returned an unexpected response. Please retry.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '', finished = false, reply = '';
      try {
        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          resetTimeout();
          // A network chunk can split a JSON event or even a UTF-8 character.
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
          let boundary;
          while ((boundary = buffer.indexOf('\n\n')) !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
            if (!data) continue;
            const event = JSON.parse(data);
            if (event.error) throw new Error(event.error);
            if (event.content) {
              reply += event.content;
              if (controller.current === abort) setExplanation(reply);
            }
            if (event.done) { finished = true; break; }
          }
        }
        if (!finished) throw new Error('The connection ended early. Please retry the explanation.');
        if (!reply.trim()) throw new Error('Code Explainer returned an empty explanation. Please retry.');
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    } catch (err) {
      if (controller.current !== abort) return;
      setError(abort.signal.aborted ? abort.signal.reason === 'stopped' ? 'Explanation stopped. Retry to generate it again.' : 'The explanation took too long. Please try again.' : err instanceof TypeError ? 'Cannot reach the server. Check your connection and make sure Django is running.' : err.message || 'Something went wrong. Please retry.');
    } finally {
      clearTimeout(timer);
      if (controller.current === abort) { busy.current = false; setLoading(false); }
    }
  }, []);

  const send = useCallback((code, level, language = 'auto') => {
    if (!code.trim() || code.length > 6000 || busy.current) return;
    request({ code, level, language });
  }, [request]);

  const clear = () => {
    controller.current?.abort(); controller.current = null; busy.current = false;
    setExplanation(''); setError(''); setLoading(false); lastRequest.current = null;
  };
  const retry = () => { if (lastRequest.current) request(lastRequest.current); };
  return { explanation, loading, error, send, clear, retry };
}
