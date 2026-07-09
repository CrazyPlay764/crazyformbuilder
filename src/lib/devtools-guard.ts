// Basic deterrent against opening browser devtools.
// NOTE: This cannot fully prevent access to devtools in a browser — it only makes it inconvenient.

export function installDevtoolsGuard() {
  if (import.meta.env.DEV) return;

  // Block right-click context menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Block common devtools keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const key = e.key?.toLowerCase();

    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }

    // Ctrl/Cmd + Shift + I / J / C  (devtools / console / inspector)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
      e.preventDefault();
      return;
    }

    // Ctrl/Cmd + U (view source)
    if ((e.ctrlKey || e.metaKey) && key === 'u') {
      e.preventDefault();
      return;
    }

    // Ctrl/Cmd + S (save page)
    if ((e.ctrlKey || e.metaKey) && key === 's') {
      e.preventDefault();
      return;
    }
  });
}
