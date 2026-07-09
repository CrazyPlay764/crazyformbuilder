// Basic deterrent against opening browser devtools / viewing source.
// NOTE: This cannot fully prevent access to devtools in a browser — it only makes it inconvenient.

export function installDevtoolsGuard() {
  if (import.meta.env.DEV) return;

  // Block right-click context menu
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Block drag (prevents dragging images/links out to inspect)
  window.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  const isEditable = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      el.isContentEditable
    );
  };

  window.addEventListener(
    'keydown',
    (e) => {
      const key = e.key?.toLowerCase();
      const editable = isEditable(e.target);

      // Always block function keys F1–F12
      if (/^f([1-9]|1[0-2])$/i.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl/Cmd combos (allow basic editing in inputs: c, v, x, a, z, y)
      if (e.ctrlKey || e.metaKey) {
        const allowedInEditable = ['c', 'v', 'x', 'a', 'z', 'y'];

        // Ctrl/Cmd + Shift + anything → block (devtools, print, etc.)
        if (e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        // In editable fields, allow basic editing shortcuts
        if (editable && key && allowedInEditable.includes(key)) {
          return;
        }

        // Block everything else (U, S, P, A, C, F, G, H, J, K, L, O, R, etc.)
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    },
    { capture: true }
  );
}
