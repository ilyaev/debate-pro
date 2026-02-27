import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (totalDuration: number) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setIsActive(true);
    lastTimeRef.current = performance.now();
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    lastTimeRef.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setCurrentTime(0);
    lastTimeRef.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.min(Math.max(0, time), totalDuration));
    if (isActive) {
      lastTimeRef.current = performance.now();
    }
  }, [totalDuration, isActive]);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      setCurrentTime((prev) => {
        const next = prev + deltaTime;
        if (next >= totalDuration) {
          setIsActive(false);
          return totalDuration;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [totalDuration]);

  useEffect(() => {
    if (isActive && currentTime < totalDuration) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, currentTime, totalDuration, animate]);

  return {
    currentTime,
    isActive,
    start,
    pause,
    reset,
    seek,
    formatTime: (s: number) => {
      const totalSeconds = Math.floor(s);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
};
