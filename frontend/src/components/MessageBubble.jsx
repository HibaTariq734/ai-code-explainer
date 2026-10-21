import { languageName } from '../languages';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import CopyButton from './CopyButton';
import TypingIndicator from './TypingIndicator';

Object.entries({ javascript, js: javascript, python, py: python, jsx, bash, shell: bash, json, css, sql, java, cpp, html: markup, markup }).forEach(([name, language]) => SyntaxHighlighter.registerLanguage(name, language));

function CodeBlock({ children }) {
  // ReactMarkdown gives fenced blocks a <pre><code> tree, including a language class.
  const code = children?.props ? String(children.props.children).replace(/\n$/, '') : String(children);
  const language = /language-([\w+#/-]+)/.exec(children?.props?.className || '')?.[1] || 'text';
  return <div className="code-block"><div className="code-toolbar"><span className="language-pill">{language === 'text' ? 'Plain text' : `${languageName(language)} code`}</span><CopyButton text={code} label="Copy code" /></div><SyntaxHighlighter language={language} useInlineStyles={false} PreTag="div" wrapLongLines={false}>{code}</SyntaxHighlighter></div>;
}

export default function MessageBubble({ message, loading }) {
  const assistant = message.role === 'assistant';
  if (assistant && !message.content && !loading) return null;
  return <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="explanation-content">
    {!message.content && loading ? <TypingIndicator /> : <div className="markdown"><ReactMarkdown components={{ pre: CodeBlock, a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a> }}>{message.content}</ReactMarkdown></div>}
    {loading && message.content && <TypingIndicator compact />}
  </motion.article>;
}
