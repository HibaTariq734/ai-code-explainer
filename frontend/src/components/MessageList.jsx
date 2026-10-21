import { useEffect, useRef } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, loading, error, onRetry }) {
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'instant', block: 'end' }); }, [messages, error]);
  return <section className="message-list" aria-label="Conversation" aria-busy={loading}>{messages.map((message, index) => <MessageBubble key={message.id} message={message} loading={loading && index === messages.length - 1}/>)}{error && <div className="error-box" role="alert"><AlertCircle size={18}/><p>{error}</p><button onClick={onRetry} disabled={loading}><RotateCcw size={14}/>Retry</button></div>}<div ref={bottom}/></section>;
}
