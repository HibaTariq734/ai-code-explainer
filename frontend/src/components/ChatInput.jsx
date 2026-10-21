import { languageOptions, languageName } from '../languages';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ChatInput({ code, setCode, level, setLevel, language, setLanguage, loading, onExplain, onClear, inputRef }) {
  const linesRef = useRef(null);
  const lineCount = code.split('\n').length;
  const countClass = code.length >= 6000 ? 'at-limit' : code.length >= 5400 ? 'near-limit' : '';
  return <form className="code-form" onSubmit={event => { event.preventDefault(); if (!loading) onExplain(); }}>
    <fieldset className="level-fieldset" disabled={loading}><legend>Make it your level</legend><div className="level-toggle">
      {['beginner', 'intermediate'].map(value => <button key={value} type="button" aria-pressed={level === value} className={level === value ? 'selected' : ''} onClick={() => setLevel(value)}>{value === 'beginner' ? 'Beginner' : 'Intermediate'}</button>)}
    </div></fieldset>
    <div className="control-area"><div className="input-actions"><motion.button className="primary-button" disabled={loading || !code.trim() || code.length > 6000} type="submit" whileHover={!loading ? { y: -1 } : {}} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>{loading ? 'Explaining...' : 'Explain'}<ArrowRight size={17} aria-hidden="true" /></motion.button><button className="clear-button" type="button" onClick={onClear}>Clear</button></div>
    <p className="keyboard-hint" id="keyboard-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to explain <span>(Cmd on Mac)</span></p></div>
    <div className="language-field"><label htmlFor="language">Language</label><select id="language" value={language} onChange={event => setLanguage(event.target.value)} disabled={loading}>
      {languageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
    </select></div>
    <label className="editor-label" htmlFor="code">Your snippet <span>Any programming language</span></label>
    <div className="editor-shell">
      <div className="editor-topline" aria-hidden="true"><span className="editor-dots"><i /><i /><i /></span><span>{languageName(language)}</span></div>
      <div className="editor-body">
        <div className="line-numbers" ref={linesRef} aria-hidden="true"><div>{Array.from({ length: lineCount }, (_, i) => <span key={i}>{i + 1}</span>)}</div></div>
        <textarea id="code" ref={inputRef} value={code} onChange={event => setCode(event.target.value)} onScroll={event => { if (linesRef.current) linesRef.current.scrollTop = event.currentTarget.scrollTop; }} maxLength={6000} disabled={loading} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" placeholder={'# Paste your code here.\n# We will make sense of it together.'} aria-describedby="code-count keyboard-hint" onKeyDown={event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) { event.preventDefault(); if (!loading) onExplain(); } }} />
      </div>
    </div>
    <div className="input-meta"><span>Space for a little exploration.</span><span id="code-count" className={countClass}>{code.length.toLocaleString()} / 6,000{code.length >= 6000 ? ' / limit reached' : ''}</span></div>

  </form>;
}
