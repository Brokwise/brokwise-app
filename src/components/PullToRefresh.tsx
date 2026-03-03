"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

const THRESHOLD = 80;
const MAX_PULL = 130;
const RESISTANCE = 0.4;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isNative = typeof window !== "undefined" && Capacitor.isNativePlatform();

  const isAtTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  useEffect(() => {
    if (!isNative) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (!isAtTop()) return;
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      if (!isAtTop()) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY < 0) {
        isPulling.current = false;
        setPullDistance(0);
        return;
      }

      const distance = Math.min(deltaY * RESISTANCE, MAX_PULL);
      setPullDistance(distance);

      if (distance > 10) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      if (!isPulling.current && pullDistance === 0) return;
      isPulling.current = false;

      if (pullDistance >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(THRESHOLD);
        window.location.reload();
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isNative, refreshing, pullDistance, isAtTop]);

  if (!isNative) return <>{children}</>;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const showIndicator = pullDistance > 10;

  return (
    <div ref={containerRef} className="relative">
      {showIndicator && (
        <div
          className="fixed left-0 right-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{
            top: `calc(env(safe-area-inset-top, 0px) + ${Math.min(pullDistance - 20, 40)}px)`,
            opacity: progress,
          }}
        >
          <div
            className="w-9 h-9 rounded-full bg-background border border-border shadow-lg flex items-center justify-center"
          >
            <svg
              className={`w-5 h-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={
                !refreshing
                  ? { transform: `rotate(${progress * 360}deg)`, transition: "none" }
                  : undefined
              }
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
      )}

      <div
        style={{
          transform: showIndicator ? `translateY(${pullDistance * 0.3}px)` : undefined,
          transition: isPulling.current ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
