import { createGlobalStyle } from 'styled-components';
import { themeCss } from './theme';

// Every registered theme's tokens as CSS variables (see src/theme/index.js),
// plus app-wide base styles that depend on them.
const GlobalStyleInjector = createGlobalStyle`
  ${themeCss}

  /* An open modal (dialog.showModal) locks page scroll — no JS needed.
     scrollbar-gutter keeps the page from shifting when the bar hides. */
  html {
    scrollbar-gutter: stable;
  }

  html:has(dialog[open]) {
    overflow: hidden;
  }

  body {
    margin: 0;
    overflow-x: hidden;
    overscroll-behavior-y: none;
    background-color: var(--pg-surface-background);
    color: var(--pg-text-primary);
    -webkit-font-smoothing: antialiased;
  }

  #containerBody {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  ::selection {
    background-color: var(--pg-accent-soft);
    color: var(--pg-text-primary);
  }

  /* frontend-plan §3: the Active (focus) state must never fall back to
     the browser default outline. Components can refine this. */
  :focus-visible {
    outline: 2px solid var(--pg-border-focus);
    outline-offset: 2px;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  /* react-toastify picks its colors from these */
  .Toastify {
    --toastify-color-light: var(--pg-surface-elevated);
    --toastify-color-dark: var(--pg-surface-elevated);
    --toastify-text-color-light: var(--pg-text-primary);
    --toastify-text-color-dark: var(--pg-text-primary);
    --toastify-color-success: var(--pg-status-success);
    --toastify-color-error: var(--pg-status-error);
    --toastify-color-warning: var(--pg-status-warning);
    --toastify-color-info: var(--pg-status-info);
  }
`;

export default GlobalStyleInjector;
