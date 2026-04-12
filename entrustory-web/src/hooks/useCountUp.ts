/**
 * useCountUp — Animated counter hook for dashboard metrics.
 * Smoothly interpolates from 0 to the target value using requestAnimationFrame.
 */
import { useState, useEffect, useRef } from 'react';

export const useCountUp = (target: number, duration = 1200): number => {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }

    const startValue = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * eased);

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
};
