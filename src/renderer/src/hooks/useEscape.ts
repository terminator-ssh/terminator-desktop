import { useEffect } from 'react';

export const useEscape = (onEscape: () => void) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscape();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onEscape]);
};
