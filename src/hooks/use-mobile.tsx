import { useState, useEffect, useMemo } from "react";

// Breakpoint constants
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Custom hook to determine if the current viewport is below a specified breakpoint
 * @param breakpoint - The breakpoint to check against (default: 'md')
 * @returns boolean indicating if the viewport is below the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint = "md") {
  // Memoize the breakpoint value to prevent recalculations
  const breakpointValue = useMemo(() => BREAKPOINTS[breakpoint], [breakpoint]);

  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState<boolean>(() => {
    // Only run in browser, not during SSR
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpointValue;
  });

  useEffect(() => {
    // Skip effect during SSR
    if (typeof window === "undefined") return;

    // Use matchMedia for better performance
    const mediaQuery = window.matchMedia(
      `(max-width: ${breakpointValue - 1}px)`
    );

    // Set initial value
    setIsBelowBreakpoint(mediaQuery.matches);

    // Handler function
    const handleChange = (e: MediaQueryListEvent) => {
      setIsBelowBreakpoint(e.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener("change", handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpointValue]);

  return isBelowBreakpoint;
}

// Create a context and cache for commonly used breakpoints
const breakpointCache = new Map<Breakpoint, boolean>();

/**
 * Determines if the viewport is mobile-sized (below md breakpoint)
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile() {
  return useBreakpoint("md");
}
