import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { getGlossaryTerm } from '../../data/glossary';

interface Props {
  term: string;
  children?: ReactNode;
  className?: string;
}

interface TooltipPosition {
  left: number;
  top: number;
  below: boolean;
}

const TOOLTIP_WIDTH = 288;
const HIDE_DELAY = 140;

export function TermTip({ term, children, className = '' }: Props) {
  const entry = getGlossaryTerm(term);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = useCallback(() => {
    clearTimer();
    const element = triggerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const half = TOOLTIP_WIDTH / 2;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, half + 12),
      window.innerWidth - half - 12,
    );
    const below = rect.top < 170;
    setPosition({
      left,
      top: below ? rect.bottom + 10 : rect.top - 10,
      below,
    });
  }, []);

  const hideLater = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setPosition(null), HIDE_DELAY);
  }, []);

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!position) return undefined;
    const onScroll = () => setPosition(null);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [position]);

  if (!entry) return <>{children ?? term}</>;

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        className={`group relative inline-block cursor-help outline-none ${className}`}
        onMouseEnter={show}
        onMouseLeave={hideLater}
        onFocus={show}
        onBlur={hideLater}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setPosition(null);
        }}
        aria-label={`${entry.term}: ${entry.short}`}
      >
        <span className="underline decoration-dotted decoration-1 underline-offset-4">
          {children ?? entry.term}
        </span>
      </span>
      {position &&
        createPortal(
          <div
            role="tooltip"
            onMouseEnter={clearTimer}
            onMouseLeave={() => setPosition(null)}
            className="fixed z-[60] p-3 rounded-xl bg-gray-900 dark:bg-gray-950 text-white text-xs leading-relaxed shadow-2xl border border-gray-700"
            style={{
              width: TOOLTIP_WIDTH,
              left: position.left,
              top: position.top,
              transform: `translate(-50%, ${position.below ? '0' : '-100%'})`,
            }}
          >
            <span className="block font-bold text-blue-300 mb-1">{entry.term}</span>
            <span className="block">{entry.short}</span>
            <Link
              to={`/glosario#${entry.id}`}
              onClick={() => setPosition(null)}
              className="inline-block mt-2 font-semibold text-green-400 hover:text-green-300"
            >
              Ver en el glosario →
            </Link>
          </div>,
          document.body,
        )}
    </>
  );
}

export default TermTip;
