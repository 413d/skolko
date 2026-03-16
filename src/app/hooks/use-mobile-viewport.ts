import { useEffect } from 'react';

const KEYBOARD_OPEN_THRESHOLD = 120;

const isTextEntryElement = (element: EventTarget | null): element is HTMLInputElement | HTMLTextAreaElement => (
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
);

export const useMobileViewport = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const visualViewport = window.visualViewport;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

    const setViewportVariable = (name: string, value: number) => {
      root.style.setProperty(name, `${String(value)}px`);
    };

    const syncViewport = () => {
      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      const viewportWidth = visualViewport?.width ?? window.innerWidth;
      const viewportOffsetTop = visualViewport?.offsetTop ?? 0;
      const viewportOffsetLeft = visualViewport?.offsetLeft ?? 0;
      const keyboardInset = Math.max(0, window.innerHeight - viewportHeight - viewportOffsetTop);

      setViewportVariable('--app-view-height', viewportHeight);
      setViewportVariable('--app-view-width', viewportWidth);
      setViewportVariable('--visual-viewport-offset-top', viewportOffsetTop);
      setViewportVariable('--visual-viewport-offset-left', viewportOffsetLeft);
      setViewportVariable('--keyboard-inset-height', keyboardInset);
      root.dataset.keyboardOpen = keyboardInset >= KEYBOARD_OPEN_THRESHOLD ? 'true' : 'false';
    };

    const revealFocusedField = (event: FocusEvent) => {
      if (!isCoarsePointer || !isTextEntryElement(event.target)) return;

      const target = event.target;

      window.setTimeout(() => {
        const keyboardInset = Math.max(
          0,
          window.innerHeight - (window.visualViewport?.height ?? window.innerHeight) - (window.visualViewport?.offsetTop ?? 0),
        );

        if (keyboardInset < KEYBOARD_OPEN_THRESHOLD) return;

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 250);
    };

    syncViewport();

    visualViewport?.addEventListener('resize', syncViewport);
    visualViewport?.addEventListener('scroll', syncViewport);
    window.addEventListener('resize', syncViewport);
    window.addEventListener('orientationchange', syncViewport);
    window.addEventListener('focusin', revealFocusedField);

    return () => {
      visualViewport?.removeEventListener('resize', syncViewport);
      visualViewport?.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      window.removeEventListener('focusin', revealFocusedField);
      root.dataset.keyboardOpen = 'false';
    };
  }, []);
};
