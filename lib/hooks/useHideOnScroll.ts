"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Auto-hide UI on scroll down, reveal on scroll up.
 * - 450ms grace period on mount (prevents glitch during page load / hash nav)
 * - `disabled=true` → always visible, cleans up listener immediately
 */
export function useHideOnScroll(threshold = 80, disabled = false) {
  const [hidden,  setHidden]  = useState(false);
  const lastY     = useRef(0);
  const ready     = useRef(false);
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Always reset when deps change
    setHidden(false);
    ready.current = false;

    if (disabled) return;

    lastY.current = window.scrollY;

    timer.current = setTimeout(() => {
      lastY.current = window.scrollY;
      ready.current = true;
    }, 450);

    function onScroll() {
      if (!ready.current) return;
      const y    = window.scrollY;
      const diff = y - lastY.current;
      if      (diff >  6 && y > threshold) setHidden(true);
      else if (diff < -4)                  setHidden(false);
      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold, disabled]);

  return hidden;
}