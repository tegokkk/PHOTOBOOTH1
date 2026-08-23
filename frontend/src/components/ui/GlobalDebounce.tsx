"use client";
import { useEffect } from "react";

/**
 * Global component to prevent rapid double-clicks on buttons and links
 * across the entire application. It intercepts clicks in the capture phase
 * before React's synthetic event system processes them.
 */
export function GlobalDebounce() {
  useEffect(() => {
    let lastClickTime = 0;
    let lastClickTarget: EventTarget | null = null;
    
    const clickHandler = (e: MouseEvent) => {
      // Only debounce clicks on interactive elements (buttons, links, or their children)
      const target = (e.target as HTMLElement)?.closest?.('button, a');
      if (!target) return;

      const now = Date.now();
      // 400ms debounce window
      if (now - lastClickTime < 400 && target === lastClickTarget) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        lastClickTime = now;
        lastClickTarget = target;
      }
    };

    // Attach to document in the capture phase
    document.addEventListener("click", clickHandler, true);

    return () => {
      document.removeEventListener("click", clickHandler, true);
    };
  }, []);

  return null;
}
