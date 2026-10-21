import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

// Resolve the favicon from the shared CSS palette (external SVGs do not inherit it).
fetch('/favicon.svg').then(response => {
  if (!response.ok) throw new Error('Favicon unavailable');
  return response.text();
}).then(svg => {
  const palette = getComputedStyle(document.documentElement);
  const themed = svg.replace(/var\(--(burgundy|pink)\)/g, (_, token) => palette.getPropertyValue(`--${token}`).trim());
  const link = document.querySelector('link[rel="icon"]');
  if (link) link.href = `data:image/svg+xml,${encodeURIComponent(themed)}`;
}).catch(() => {});
