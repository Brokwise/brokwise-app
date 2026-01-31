"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

interface SwipeBackConfig {
  /** Minimum distance to trigger back navigation (default: 100px) */
  threshold?: number;
  /** Maximum distance from left edge to start gesture (default: 30px) */
  edgeWidth?: number;
  /** Enable/disable the gesture (default: true) */
  enabled?: boolean;
  /** Callback when swipe starts */
  onSwipeStart?: () => void;
  /** Callback during swipe with progress (0-1) */
  onSwipeProgress?: (progress: number) => void;
  /** Callback when swipe ends */
  onSwipeEnd?: (didNavigate: boolean) => void;
}

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  isActive: boolean;
  startTime: number;
}

export function useSwipeBack(config: SwipeBackConfig = {}) {
  const {
    threshold = 100,
    edgeWidth = 30,
    enabled = true,
    onSwipeStart,
    onSwipeProgress,
    onSwipeEnd,
  } = config;

  const router = useRouter();
  const gestureState = useRef<GestureState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isActive: false,
    startTime: 0,
  });
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const createOverlay = useCallback(() => {
    if (overlayRef.current) return;

    const overlay = document.createElement("div");
    overlay.id = "swipe-back-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;

    // Left edge indicator
    const indicator = document.createElement("div");
    indicator.id = "swipe-back-indicator";
    indicator.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
      transform: translateX(-100%);
      transition: none;
    `;

    // Arrow indicator
    const arrow = document.createElement("div");
    arrow.id = "swipe-back-arrow";
    arrow.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
    arrow.style.cssText = `
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%) translateX(-50px);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: none;
    `;

    overlay.appendChild(indicator);
    overlay.appendChild(arrow);
    document.body.appendChild(overlay);
    overlayRef.current = overlay;
  }, []);

  const updateOverlay = useCallback((progress: number) => {
    const indicator = document.getElementById("swipe-back-indicator");
    const arrow = document.getElementById("swipe-back-arrow");

    if (indicator) {
      const translateX = Math.min(progress * 100, 100);
      indicator.style.transform = `translateX(${translateX - 100}%)`;
      indicator.style.width = `${Math.min(20 + progress * 30, 50)}px`;
    }

    if (arrow) {
      const opacity = Math.min(progress * 2, 1);
      const translateX = Math.min(progress * 60, 40);
      arrow.style.opacity = String(opacity);
      arrow.style.transform = `translateY(-50%) translateX(${translateX - 50}px) scale(${0.5 + progress * 0.5})`;

      // Change color when threshold is reached
      if (progress >= 1) {
        arrow.style.background = "rgba(34, 197, 94, 0.9)"; // Green when ready
      } else {
        arrow.style.background = "rgba(0, 0, 0, 0.6)";
      }
    }
  }, []);

  const removeOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      // Animate out
      const indicator = document.getElementById("swipe-back-indicator");
      const arrow = document.getElementById("swipe-back-arrow");

      if (indicator) {
        indicator.style.transition = "transform 0.2s ease-out";
        indicator.style.transform = "translateX(-100%)";
      }
      if (arrow) {
        arrow.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
        arrow.style.opacity = "0";
        arrow.style.transform = "translateY(-50%) translateX(-50px)";
      }

      setTimeout(() => {
        overlay.remove();
        overlayRef.current = null;
      }, 200);
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      const startX = touch.clientX;

      // Only start gesture if touch begins near left edge
      if (startX <= edgeWidth) {
        gestureState.current = {
          startX,
          startY: touch.clientY,
          currentX: startX,
          isActive: true,
          startTime: Date.now(),
        };
        createOverlay();
        onSwipeStart?.();
      }
    },
    [enabled, edgeWidth, createOverlay, onSwipeStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!gestureState.current.isActive) return;

      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaX = currentX - gestureState.current.startX;
      const deltaY = Math.abs(currentY - gestureState.current.startY);

      // Cancel if vertical movement is greater than horizontal (user is scrolling)
      if (deltaY > Math.abs(deltaX) && deltaX < 30) {
        gestureState.current.isActive = false;
        removeOverlay();
        return;
      }

      // Only track rightward swipes
      if (deltaX > 0) {
        gestureState.current.currentX = currentX;
        const progress = Math.min(deltaX / threshold, 1.5);
        updateOverlay(progress);
        onSwipeProgress?.(progress);

        // Prevent default scrolling when swiping
        if (deltaX > 10) {
          e.preventDefault();
        }
      }
    },
    [threshold, updateOverlay, removeOverlay, onSwipeProgress]
  );

  const handleTouchEnd = useCallback(() => {
    if (!gestureState.current.isActive) return;

    const deltaX =
      gestureState.current.currentX - gestureState.current.startX;
    const duration = Date.now() - gestureState.current.startTime;
    const velocity = deltaX / duration;

    // Navigate back if threshold reached or fast swipe
    const shouldNavigate = deltaX >= threshold || (velocity > 0.5 && deltaX > 50);

    if (shouldNavigate) {
      // Visual feedback before navigation
      updateOverlay(1.5);
      setTimeout(() => {
        router.back();
        removeOverlay();
      }, 100);
    } else {
      removeOverlay();
    }

    onSwipeEnd?.(shouldNavigate);
    gestureState.current.isActive = false;
  }, [threshold, router, updateOverlay, removeOverlay, onSwipeEnd]);

  const handleTouchCancel = useCallback(() => {
    if (gestureState.current.isActive) {
      gestureState.current.isActive = false;
      removeOverlay();
      onSwipeEnd?.(false);
    }
  }, [removeOverlay, onSwipeEnd]);

  useEffect(() => {
    // Only enable on native platforms (iOS/Android)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (!enabled) return;

    const options: AddEventListenerOptions = { passive: false };

    document.addEventListener("touchstart", handleTouchStart, options);
    document.addEventListener("touchmove", handleTouchMove, options);
    document.addEventListener("touchend", handleTouchEnd, options);
    document.addEventListener("touchcancel", handleTouchCancel, options);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchCancel);
      removeOverlay();
    };
  }, [
    enabled,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    removeOverlay,
  ]);

  return {
    isActive: gestureState.current.isActive,
  };
}
