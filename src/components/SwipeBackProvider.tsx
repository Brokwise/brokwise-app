"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useSwipeBack } from "@/hooks/useSwipeBack";

interface SwipeBackContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  disable: () => void;
  enable: () => void;
}

const SwipeBackContext = createContext<SwipeBackContextType>({
  enabled: true,
  setEnabled: () => {},
  disable: () => {},
  enable: () => {},
});

export function useSwipeBackContext() {
  return useContext(SwipeBackContext);
}

interface SwipeBackProviderProps {
  children: React.ReactNode;
  /** Default enabled state (default: true) */
  defaultEnabled?: boolean;
  /** Minimum swipe distance to trigger navigation (default: 100px) */
  threshold?: number;
  /** Maximum distance from left edge to start gesture (default: 30px) */
  edgeWidth?: number;
}

export function SwipeBackProvider({
  children,
  defaultEnabled = true,
  threshold = 100,
  edgeWidth = 30,
}: SwipeBackProviderProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const disable = useCallback(() => setEnabled(false), []);
  const enable = useCallback(() => setEnabled(true), []);

  // Initialize the swipe back gesture
  useSwipeBack({
    enabled,
    threshold,
    edgeWidth,
  });

  return (
    <SwipeBackContext.Provider value={{ enabled, setEnabled, disable, enable }}>
      {children}
    </SwipeBackContext.Provider>
  );
}

/**
 * Hook to temporarily disable swipe back gesture
 * Useful for pages with horizontal scrolling or swipeable components
 *
 * @example
 * ```tsx
 * function CarouselPage() {
 *   useDisableSwipeBack(); // Disables swipe back while this component is mounted
 *   return <Carousel />;
 * }
 * ```
 */
export function useDisableSwipeBack() {
  const { disable, enable } = useSwipeBackContext();

  React.useEffect(() => {
    disable();
    return () => enable();
  }, [disable, enable]);
}
