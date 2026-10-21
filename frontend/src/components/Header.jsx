import { ArrowUpRight } from 'lucide-react';

export default function Header() {
  return <header className="header">
    <a href="/" className="brand" aria-label="Code Explainer home">Code Explainer<span>A little understanding goes a long way.</span></a>
    <a className="docs-link" href="https://console.groq.com/docs" target="_blank" rel="noreferrer">Powered by Groq <ArrowUpRight size={14} /></a>
  </header>;
}
