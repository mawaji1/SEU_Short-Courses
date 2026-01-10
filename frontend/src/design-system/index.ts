/**
 * SEU Short Courses Platform — Design System
 * 
 * This module exports:
 * - Tokens (TypeScript constants)
 * - CSS theme (imported for side effects)
 * - Re-exports from platformscode-new-react
 */

// SEU Design Tokens
export * from './tokens';

// Theme CSS (import for side effects in layout)
// import './seu-theme.css';

// Re-export Platforms Code components
// Components are re-exported from platformscode-new-react
// SEU brand is applied via CSS variable overrides
export * from 'platformscode-new-react';
