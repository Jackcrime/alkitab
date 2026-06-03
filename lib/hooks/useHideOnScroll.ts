"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Auto-hide UI on scroll down, reveal on scroll up.
 * Adds 400ms grace period on mount to prevent glitch during page load / hash navigation.
 */
export function useHideOnScroll(threshold = 80) {
  const [hidden,  setHidden]  = useState(false);
  const lastY     = useRef(0);
  const enabled   = useRef(false);
  const timer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset on every navigation
    setHidden(false);
    enabled.current  = false;
    lastY.current    = window.scrollY;

    // Don't start watching until page has settled
    timer.current = setTimeout(() => {
      lastY.current   = window.scrollY;
      enabled.current = true;
    }, 450);

    function onScroll() {
      if (!enabled.current) return;
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
  }, [threshold]);

  return hidden;
}
