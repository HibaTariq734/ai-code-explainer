import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Shared by code snippets and full answers, with honest clipboard feedback.
export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [status, setStatus] = useState('idle');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2200);
  }

  return (
    <button type="button" onClick={copy} className={className} aria-label={label} title={label}>
      {status === 'copied' ? <Check size={13} /> : <Copy size={13} />}
      <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'failed' ? 'Try again' : label}</span>
    </button>
  );
}
