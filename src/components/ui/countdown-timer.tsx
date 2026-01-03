"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer = ({
  expiresAt,
  onExpire,
  className = "",
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          hours:
            Math.floor((difference / (1000 * 60 * 60)) % 24) +
            Math.floor(difference / (1000 * 60 * 60 * 24)) * 24, // Total hours
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
        if (onExpire) {
          onExpire();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  return (
    <div className={`flex items-center gap-1 text-xs font-mono ${className}`}>
      <Clock className="h-3 w-3" />
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  );
};
