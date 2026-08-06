'use client';

import { useState, useRef, useCallback } from 'react';

export const useStopwatch = () => {
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setElapsedTime(null);
    startTimeRef.current = performance.now();
  }, []);

  const stop = useCallback(() => {
    if (startTimeRef.current) {
      const endTime = performance.now();
      const elapsed = endTime - startTimeRef.current;
      setElapsedTime(elapsed);
      startTimeRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setElapsedTime(null);
    startTimeRef.current = null;
  }, []);

  return { elapsedTime, start, stop, reset };
};
