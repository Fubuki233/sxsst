import { useEffect, useState, useRef, cloneElement } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router";
import { transitionStore, Direction } from "../utils/transitionStore";
import { SeniorThemeProvider } from "../frontends/high-grade/components/SeniorThemeProvider";
import { storage } from "../utils/storage";

// Ordered routes for bottom-nav direction detection (left → right)
const NAV_ORDER = [
  '/dashboard',
  '/wrong-questions',
  '/weakness',
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
  const [hideDemoWatermark, setHideDemoWatermark] = useState(() => {
    const browserParams = new URLSearchParams(window.location.search);
    const hashSearch = window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?')) : '';
    const hashParams = new URLSearchParams(hashSearch);
    const watermark = browserParams.get('watermark') ?? hashParams.get('watermark');
    return watermark === 'false' || window.sessionStorage.getItem('hide-demo-watermark') === 'true';
  });
  const [isSeniorStudent, setIsSeniorStudent] = useState(() => {
    const user = storage.getCurrentUser();
    return user?.role !== 'teacher' && user?.grade !== undefined && user.grade >= 4;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const routeParams = new URLSearchParams(location.search);
    const browserParams = new URLSearchParams(window.location.search);
    const watermark = routeParams.get('watermark') ?? browserParams.get('watermark');

    if (watermark === 'false') {
      window.sessionStorage.setItem('hide-demo-watermark', 'true');
      setHideDemoWatermark(true);
    } else if (watermark === 'true') {
      window.sessionStorage.removeItem('hide-demo-watermark');
      setHideDemoWatermark(false);
    }
  }, [location.search]);

  useEffect(() => {
    const refreshUser = () => {
      const user = storage.getCurrentUser();
      setIsSeniorStudent(user?.role !== 'teacher' && user?.grade !== undefined && user.grade >= 4);
    };

    refreshUser();
    window.addEventListener('focus', refreshUser);
    window.addEventListener('profile-updated', refreshUser);
    return () => {
      window.removeEventListener('focus', refreshUser);
      window.removeEventListener('profile-updated', refreshUser);
    };
  }, [location.pathname]);

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
  const usePortraitShell = isSeniorStudent
    && location.pathname !== '/'
    && location.pathname !== '/login'
    && !location.pathname.startsWith('/teacher');

  return (
    <div className={`size-full ${usePortraitShell ? 'senior-portrait-root' : ''}`} style={{ background: 'var(--app-root-bg, #EEF4FF)' }}>
      <SeniorThemeProvider />
      <div className={usePortraitShell ? 'senior-portrait-shell' : 'size-full'}>
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
        {!hideDemoWatermark && <div className="demo-watermark" aria-hidden="true" />}
      </div>
    </div>
  );
}
