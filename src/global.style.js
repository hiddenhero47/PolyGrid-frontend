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

  /* react-toastify only places and times toasts — the look is
     layouts/toast/components/custom-toast.jsx. Its own stylesheet loads
     after ours, so its box is cleared through the variables it reads. */
  .Toastify {
    --toastify-color-light: transparent;
    --toastify-color-dark: transparent;
    --toastify-toast-shadow: none;
    --toastify-toast-padding: 0;
    --toastify-toast-min-height: 0;
    --toastify-toast-width: auto;
    --toastify-toast-bd-radius: 12px;
  }
`;

export default GlobalStyleInjector;
