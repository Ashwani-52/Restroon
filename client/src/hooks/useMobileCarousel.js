import { useState, useRef } from 'react';

export function useMobileCarousel(total) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  const next = () => setActiveIndex(i => (i + 1) % total);
  const prev = () => setActiveIndex(i => (i - 1 + total) % total);
  const goto = (i) => setActiveIndex(i);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else          prev();
    }
    touchStartX.current = null;
  };

  return { activeIndex, next, prev, goto, onTouchStart, onTouchEnd };
}
