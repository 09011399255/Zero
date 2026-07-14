import { useEffect, useRef } from 'react';

// Accessibility behaviour shared by every overlay modal/drawer:
//   - Escape closes it
//   - Tab / Shift+Tab are trapped inside the panel (can't reach the page behind)
//   - focus moves into the panel on open and is restored to the trigger on close
//
// Pass the panel's open state and its onClose; attach the returned ref to the
// panel element (the focusable container, NOT the backdrop). Works whether the
// modal is conditionally mounted ({open && <Panel/>}) or always mounted with an
// early `return null` — the effect keys off `isOpen`, and the hook is always
// called before any early return so the Rules of Hooks hold.
export function useModalA11y<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null);
  // Keep the latest onClose without re-running the effect (and re-stealing focus)
  // every render when the parent passes a fresh closure.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    };

    // Move focus into the panel on open.
    const initial = getFocusable();
    if (initial.length > 0) initial[0].focus();
    else container?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !container?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  return containerRef;
}
