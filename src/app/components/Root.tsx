import { useEffect, useState, useRef, cloneElement } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router";
import { transitionStore, Direction } from "../utils/transitionStore";

// Ordered routes for bottom-nav direction detection (left → right)
const NAV_ORDER = [
  '/dashboard',
  '/wrong-questions',
  '/knowledge-map',
  '/profile',
];

function getNavIndex(path: string): number {
  for (let i = 0; i < NAV_ORDER.length; i++) {
    if (path === NAV_ORDER[i] || path.startsWith(NAV_ORDER[i] + '/')) return i;
  }
  return -1;
}

export default function Root() {
  const location = useLocation();
  const navType = useNavigationType();
  const currentOutlet = useOutlet();

  const [prevElement, setPrevElement] = useState<React.ReactElement | null>(null);
  const [direction, setDirection] = useState<Direction>('forward');
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedDir = transitionStore.getDirection();
    const prevKey = (prevElement?.key as string) || '';
    const curPath = location.pathname;

    let dir: Direction;
    if (storedDir === 'back') {
      dir = 'back';
      transitionStore.setDirection('forward');
    } else if (navType === 'POP') {
      dir = 'back';
    } else {
      // PUSH/REPLACE: check bottom-nav order
      const prevIdx = getNavIndex(prevKey);
      const curIdx = getNavIndex(curPath);
      if (curIdx >= 0 && prevIdx >= 0 && curIdx < prevIdx) {
        dir = 'back';
      } else {
        // Depth-based: fewer segments = go back
        const prevDepth = prevKey.split('/').filter(Boolean).length;
        const curDepth = curPath.split('/').filter(Boolean).length;
        dir = curDepth < prevDepth ? 'back' : 'forward';
      }
    }

    // Clone current outlet with a unique key
    if (currentOutlet) {
      const newElement = cloneElement(currentOutlet as React.ReactElement<any>, {
        key: curPath,
      });

      if (prevElement && (prevElement.key as string) !== curPath) {
        setDirection(dir);
        setAnimating(true);
        // Keep prevElement as the old page during animation

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setAnimating(false);
          setPrevElement(newElement);
        }, 300);
      } else if (!prevElement) {
        setPrevElement(newElement);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.pathname, currentOutlet]);

  const enterClass = direction === 'forward' ? 'page-enter-forward' : 'page-enter-back';
  const exitClass = direction === 'forward' ? 'page-exit-forward' : 'page-exit-back';

  return (
    <div className="size-full" style={{ background: '#EEF4FF' }}>
      <div className="page-transition-wrapper">
        {/* Previous page (exit animation) */}
        {animating && prevElement && (
          <div className={exitClass}>
            {prevElement}
          </div>
        )}
        {/* Current page (enter animation) */}
        <div className={animating ? enterClass : ''}>
          {currentOutlet}
        </div>
      </div>
    </div>
  );
}