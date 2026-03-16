import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CarouselProps {
  /** Slide content. */
  items: React.ReactNode[];
  /** Auto-advance slides. @default false */
  autoPlay?: boolean;
  /** Interval in ms for auto-play. @default 5000 */
  interval?: number;
  /** Show dot indicators. @default true */
  showDots?: boolean;
  /** Show prev/next arrows. @default true */
  showArrows?: boolean;
  /** Callback when slide changes. */
  onSlideChange?: (index: number) => void;
  /** Accessible label for the carousel region. @default 'Content carousel' */
  'aria-label'?: string;
  /** Additional CSS class for the root. */
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  onSlideChange,
  'aria-label': ariaLabel = 'Content carousel',
  className,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, items.length - 1));
      setCurrent(next);
      onSlideChange?.(next);
    },
    [items.length, onSlideChange],
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!autoPlay || isPaused || items.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const next = c + 1 >= items.length ? 0 : c + 1;
        onSlideChange?.(next);
        return next;
      });
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, isPaused, interval, items.length, onSlideChange]);

  const classes = ['uds-carousel', className].filter(Boolean).join(' ');

  if (items.length === 0) return null;

  return (
    <section
      className={classes}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      aria-live="off"
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="uds-carousel__track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, i) => (
          <section
            key={`slide-${i}`}
            className="uds-carousel__slide"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${items.length}`}
          >
            {item}
          </section>
        ))}
      </div>
      {showArrows && items.length > 1 && (
        <>
          <button
            type="button"
            className="uds-carousel__arrow uds-carousel__arrow--prev"
            aria-label="Previous slide"
            onClick={prev}
            disabled={current === 0}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="uds-carousel__arrow uds-carousel__arrow--next"
            aria-label="Next slide"
            onClick={next}
            disabled={current === items.length - 1}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
      {showDots && items.length > 1 && (
        <div className="uds-carousel__dots" role="tablist" aria-label="Slide indicators">
          {items.map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              className={['uds-carousel__dot', i === current && 'uds-carousel__dot--active']
                .filter(Boolean)
                .join(' ')}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

Carousel.displayName = 'Carousel';
