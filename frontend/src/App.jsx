import { useRef, useState } from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import CopyButton from './components/CopyButton';
import { useExplain } from './hooks/useChat';
import { MotionConfig } from 'framer-motion';

export default function App() {
  const [code, setCode] = useState('');
  const [level, setLevel] = useState('beginner');
  const [language, setLanguage] = useState('auto');
  const input = useRef(null);
  const explain = useExplain();
  const empty = !explain.explanation && !explain.loading && !explain.error;
  function clear() {
    explain.clear(); setCode(''); setLevel('beginner'); setLanguage('auto'); input.current?.focus();
  }
  function selectExample(value) {
    setCode(value); input.current?.focus({ preventScroll: true });
    input.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  }
  return <MotionConfig reducedMotion="user"><div className="app-shell">
    <Header />
    <main className="main-content">
      {empty ? <EmptyState onSelect={selectExample} /> : <div className="workspace-intro"><span className="eyebrow">A LITTLE CLOSER TO UNDERSTANDING</span><h1>Code, with clarity.</h1></div>}
      <div className="workspace">
        <section className="panel input-panel" aria-labelledby="code-heading">
          <div className="panel-heading"><div><span className="eyebrow">01 / THE STARTING POINT</span><h2 id="code-heading">Your code</h2></div></div>
          <ChatInput code={code} setCode={setCode} level={level} setLevel={setLevel} language={language} setLanguage={setLanguage} loading={explain.loading} onExplain={() => explain.send(code, level, language)} onClear={clear} inputRef={input} />
        </section>
        <section className="panel output-panel" aria-labelledby="explanation-heading" aria-busy={explain.loading}>
          <div className="panel-heading"><div><span className="eyebrow">02 / THE BIG PICTURE</span><h2 id="explanation-heading">Explanation</h2></div>{explain.explanation && <CopyButton text={explain.explanation} label="Copy" className="copy-answer" />}</div>
          {explain.error && <div className="error-box" role="alert"><div><strong>A small pause.</strong><p>{explain.error}</p></div><button type="button" onClick={explain.retry} disabled={explain.loading}><RotateCcw size={15} aria-hidden="true" />Retry</button></div>}
          {explain.explanation || explain.loading ? <MessageBubble message={{ role: 'assistant', content: explain.explanation }} loading={explain.loading} /> : <div className="explanation-placeholder"><BookOpen size={30} strokeWidth={1.2} aria-hidden="true" /><h3>A little clarity awaits.</h3><p>Your code has a story.<br />Paste a snippet and we will walk through it.</p><ol><li>What it does</li><li>Line by line</li><li>A tiny example</li><li>One thoughtful tip</li></ol></div>}
        </section>
      </div>
    </main>
    <footer className="app-footer"><span>Made for curious minds.</span><span>AI can make mistakes. A thoughtful review is always a good idea.</span></footer>
  </div></MotionConfig>;
}
