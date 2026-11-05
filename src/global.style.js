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

  /* Slim pill scrollbars. Chromium / Safari: the thumb floats inside a
     transparent border, so it reads as a pill, and only the page's own
     bar gets a track color — inner scrollers (menus, drawers, tables)
     show their own surface behind it. Firefox only takes two colors. */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track,
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  html::-webkit-scrollbar-track {
    background: var(--pg-scrollbar-track);
  }

  ::-webkit-scrollbar-thumb {
    min-height: 40px;
    border: 3px solid transparent;
    border-radius: 999px;
    background-color: var(--pg-scrollbar-thumb);
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--pg-scrollbar-thumbHover);
  }

  @supports not selector(::-webkit-scrollbar) {
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--pg-scrollbar-thumb) transparent;
    }

    html {
      scrollbar-color: var(--pg-scrollbar-thumb) var(--pg-scrollbar-track);
    }
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
