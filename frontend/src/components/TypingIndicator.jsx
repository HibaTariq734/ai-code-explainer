export default function TypingIndicator({ compact = false }) {
  return <div className={`typing ${compact ? 'compact' : ''}`} role="status"><span className="typing-dots" aria-hidden="true"><i /><i /><i /></span><span>{compact ? 'A little more clarity...' : 'Reading between the lines...'}</span>{!compact && <div className="skeleton" aria-hidden="true"><i /><i /><i /><i /></div>}</div>;
}
