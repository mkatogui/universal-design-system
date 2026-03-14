import { useCallback, useEffect, useRef } from 'react';

let scrollLockCount = 0;

/**
 * Shared hook for Modal, AlertDialog, and Drawer overlay behavior.
 * Handles: Escape to close, focus trap (Tab cycling), body scroll lock,
 * and restoring focus on close.
 */
export function useDialogOverlay(
  open: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, containerRef],
  );

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      scrollLockCount++;
      if (scrollLockCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (open) {
        scrollLockCount--;
        if (scrollLockCount === 0) {
          document.body.style.overflow = '';
        }
      }
      previousFocus.current?.focus();
    };
  }, [open, handleKeyDown]);

  return { handleKeyDown };
}
