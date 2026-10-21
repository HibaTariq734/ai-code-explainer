export const languageOptions = [
  ['auto', 'Auto-detect'], ['python', 'Python'], ['javascript', 'JavaScript'],
  ['sql', 'SQL'], ['java', 'Java'], ['cpp', 'C++'], ['html/css', 'HTML/CSS'],
];

const names = Object.fromEntries([
  ...languageOptions, ['py', 'Python'], ['js', 'JavaScript'], ['c++', 'C++'],
  ['html', 'HTML'], ['xml', 'HTML'], ['markup', 'HTML'], ['css', 'CSS'],
  ['jsx', 'JSX'], ['tsx', 'TSX'], ['typescript', 'TypeScript'], ['ts', 'TypeScript'],
  ['bash', 'Bash'], ['shell', 'Shell'], ['json', 'JSON'], ['c', 'C'],
  ['csharp', 'C#'], ['cs', 'C#'], ['text', 'Plain text'],
]);

export function languageName(value) {
  return names[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1);
}
