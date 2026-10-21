import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const examples = [
  { language: 'PYTHON', name: 'A friendly greeting', detail: 'Start small. Meet your first function.', code: 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Ada"))' },
  { language: 'JAVASCRIPT', name: 'A fresh perspective', detail: 'Turn a list of numbers into something new.', code: 'const numbers = [1, 2, 3];\nconst doubled = numbers.map(number => number * 2);\nconsole.log(doubled);' },
  { language: 'PYTHON', name: 'One step at a time', detail: 'Discover the quiet rhythm of a loop.', code: 'total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)' },
];

export default function SuggestionChips({ onSelect }) {
  return <div className="suggestion-grid">{examples.map(example => <motion.button type="button" className="suggestion" key={example.name} onClick={() => onSelect(example.code)} aria-label={`Try an example: ${example.name}`} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.2 }}>
    <span className="suggestion-top"><span>{example.language}</span><ArrowUpRight size={17} aria-hidden="true" /></span>
    <strong>{example.name}</strong><span className="suggestion-detail">{example.detail}</span><span className="suggestion-cta">Try an example</span>
  </motion.button>)}</div>;
}
