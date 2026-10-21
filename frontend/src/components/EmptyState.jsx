import { motion } from 'framer-motion';
import SuggestionChips from './SuggestionChips';

export default function EmptyState({ onSelect }) {
  return <motion.section className="intro" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} aria-labelledby="intro-heading">
    <span className="eyebrow">A MOMENT OF CLARITY</span>
    <h1 id="intro-heading">Understand any code,<br /><em>simply.</em></h1>
    <p>A thoughtful guide to what your code does, how it works,<br className="desktop-break" /> and the little things that make it better.</p>
    <SuggestionChips onSelect={onSelect} />
  </motion.section>;
}
