import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { SUBJECTS, getAllChapters } from '../utils/questions';
import { storage } from '../utils/storage';
import { BottomNav } from './BottomNav';

// ──────────────── Types ────────────────
interface ChapterNode {
  id: string; name: string; x: number; y: number; radius: number;
  kps: { name: string; angle: number; orbitR: number; radius: number; accuracy?: number }[];
}

const SUBJECT_COLORS: Record<string, string> = {
  math: '#3B82F6', english: '#10B981', physics: '#8B5CF6', chemistry: '#F59E0B',
};
const CHAPTER_R = 44;
const KP_R = 28;
const MIN_ORBIT = 86;
const MAX_ORBIT = 116;

function getColor(acc?: number): string {
  if (acc === undefined) return '#9CA3AF';
  if (acc < 60) return '#EF4444';
  if (acc < 85) return '#F59E0B';
  return '#10B981';
}
function getLabel(acc?: number): string {
  if (acc === undefined) return '未练习';
  if (acc < 60) return '薄弱';
  if (acc < 85) return '一般';
  return '熟练';
}

// ── Circular layout: ring radius adapts to container size ──
function layoutCircular(kpCounts: number[], w: number, h: number): { x: number; y: number; orbitR: number; ringR: number }[] {
  const n = kpCounts.length;
  const orbitRs = kpCounts.map(kc => MIN_ORBIT + Math.min((kc - 2) * 7, MAX_ORBIT - MIN_ORBIT));
  const maxOrbit = Math.max(...orbitRs);
  const neededEdge = maxOrbit + KP_R + 30;

  // Minimum ring radius to avoid overlap at equal angles
  const minRingR = n <= 1 ? 0 : Math.max(neededEdge / Math.sin(Math.PI / n), neededEdge * 1.1);

  // Maximum ring radius constrained by container (centered at 0,0)
  // We need: ringR + maxOrbit + CHAPTER_R <= min(w/2, h/2) * scaleFactor
  const containerMax = Math.min(w, h) / 2 * 0.85;

  // Scale to fit: start from minRingR, but don't exceed container
  const ringR = Math.min(Math.max(minRingR, containerMax * 0.6), containerMax - 20);

  // Also scale orbitR proportionally so KP balls stay within container
  const scale = Math.min(1, ringR / (minRingR || 1));

  // Initial equal angles (start from top)
  const angles = kpCounts.map((_, i) => (2 * Math.PI / n) * i - Math.PI / 2);

  // Fine-tune angles
  if (n > 2) {
    for (let iter = 0; iter < 40; iter++) {
      for (let i = 0; i < n; i++) {
        let torque = 0;
        const prev = (i - 1 + n) % n;
        const next = (i + 1) % n;
        for (const j of [prev, next]) {
          let da = angles[i] - angles[j];
          if (da > Math.PI) da -= 2 * Math.PI;
          if (da < -Math.PI) da += 2 * Math.PI;
          const arcDist = Math.abs(da) * ringR;
          const adjOrbitI = orbitRs[i] * scale;
          const adjOrbitJ = orbitRs[j] * scale;
          const minArc = adjOrbitI + adjOrbitJ + KP_R * 2 + 40;
          if (arcDist < minArc) {
            torque += (minArc - arcDist) / minArc * 0.2 * Math.sign(da);
          }
        }
        const idealA = (2 * Math.PI / n) * i - Math.PI / 2;
        let daIdeal = idealA - angles[i];
        if (daIdeal > Math.PI) daIdeal -= 2 * Math.PI;
        if (daIdeal < -Math.PI) daIdeal += 2 * Math.PI;
        torque += daIdeal * 0.03;
        angles[i] += torque;
      }
    }
  }

  return angles.map((a, i) => ({
    x: Math.cos(a) * ringR,
    y: Math.sin(a) * ringR,
    orbitR: orbitRs[i] * scale,
    ringR,
  }));
}

export default function KnowledgeMapPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, number>>({});
  const [nodes, setNodes] = useState<ChapterNode[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dim, setDim] = useState({ w: 800, h: 500 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const dragTotalRef = useRef(0);
  const zoomStateRef = useRef(1);

  // Keep ref in sync for pinch handler
  useEffect(() => { zoomStateRef.current = zoom; }, [zoom]);

  useEffect(() => {
    const stats = storage.getKnowledgeStats();
    const m: Record<string, number> = {};
    stats.forEach(s => { m[s.knowledgePoint] = s.accuracy; });
    setKnowledgeStats(m);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDim({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const chs = getAllChapters()[selectedSubject] || [];
    if (chs.length === 0) { setNodes([]); return; }
    const positions = layoutCircular(chs.map(c => c.knowledgePoints.length), dim.w, dim.h);
    setNodes(chs.map((ch, i) => {
      const p = positions[i];
      const nkp = ch.knowledgePoints.length;
      return {
        id: ch.id, name: ch.name, x: p.x, y: p.y, radius: CHAPTER_R,
        kps: ch.knowledgePoints.map((kp, j) => ({
          name: kp,
          angle: (2 * Math.PI / nkp) * j + (Math.PI / 4) * i,
          orbitR: p.orbitR,
          radius: KP_R,
          accuracy: knowledgeStats[kp],
        })),
      };
    }));
  }, [selectedSubject, knowledgeStats, dim]);

  // ── Pinch zoom state (refs to avoid re-renders during pinch) ──
  const pinchDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);

  // ── Zoom via wheel / pinch ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      // Ctrl+wheel on some trackpads triggers gesture — ignore if ctrlKey
      if (e.ctrlKey) { e.preventDefault(); return; }
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      setZoom(z => {
        const next = z * factor;
        return Math.min(2.5, Math.max(0.35, next));
      });
    };
    // Pinch gesture
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
        pinchStartZoomRef.current = zoomStateRef.current;
      }
    };
    const touchMovePinch = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchDistRef.current > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const scale = dist / pinchDistRef.current;
        const next = pinchStartZoomRef.current * scale;
        setZoom(Math.min(2.5, Math.max(0.35, next)));
      }
    };
    const touchEndPinch = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchDistRef.current = 0;
    };
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('touchstart', touchStart, { passive: false });
    el.addEventListener('touchmove', touchMovePinch, { passive: false });
    el.addEventListener('touchend', touchEndPinch);
    return () => {
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('touchstart', touchStart);
      el.removeEventListener('touchmove', touchMovePinch);
      el.removeEventListener('touchend', touchEndPinch);
    };
  }, []);

  // ── Pan: use refs + one-shot listeners for both mouse and touch ──
  useEffect(() => {
    const move = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - dragStartRef.current.mx;
      const dy = clientY - dragStartRef.current.my;
      dragTotalRef.current += Math.abs(dx) + Math.abs(dy);
      setPan({ x: dragStartRef.current.px + dx, y: dragStartRef.current.py + dy });
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const up = () => {
      isDraggingRef.current = false;
      setTimeout(() => { dragTotalRef.current = 0; }, 100);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', up);
    };
  }, []);

  const startDrag = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    dragTotalRef.current = 0;
    dragStartRef.current = { mx: clientX, my: clientY, px: pan.x, py: pan.y };
  };

  const onPanDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const c = 'touches' in e ? e.touches[0] : e;
    startDrag(c.clientX, c.clientY);
  }, [pan]);

  const onBallDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Don't e.preventDefault() — it would block pinch-zoom gestures on mobile
    const c = 'touches' in e ? e.touches[0] : e;
    startDrag(c.clientX, c.clientY);
  }, [pan]);

  // ── Click handlers ──
  const handleChapterClick = () => {
    if (dragTotalRef.current < 5) navigate(`/subject/${selectedSubject}`);
    dragTotalRef.current = 0;
  };
  const handleKpClick = (kp: string) => {
    if (dragTotalRef.current < 5) navigate(`/graded-practice/${encodeURIComponent(kp)}`);
    dragTotalRef.current = 0;
  };

  const sc = SUBJECT_COLORS[selectedSubject] || '#3B82F6';

  // Trunk links: adjacent in ring order (first→last close loop)
  const trunkLinks: { a: ChapterNode; b: ChapterNode }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const j = (i + 1) % nodes.length;
    if (i < j || nodes.length <= 2) trunkLinks.push({ a: nodes[i], b: nodes[j] });
  }

  const tx = pan.x + dim.w / 2;
  const ty = pan.y + dim.h / 2;

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      {/* Tabs */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex gap-2 justify-center max-w-lg mx-auto">
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => { setSelectedSubject(s.id); setPan({ x: 0, y: 0 }); setZoom(1); }}
              className="px-5 py-2 rounded-xl text-sm transition-all"
              style={{ backgroundColor: selectedSubject === s.id ? SUBJECT_COLORS[s.id] : '#fff', color: selectedSubject === s.id ? '#fff' : '#6b7280', fontWeight: selectedSubject === s.id ? 600 : 400 }}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden relative select-none"
        style={{ cursor: 'grab' }}
        onMouseDown={onPanDown} onTouchStart={onPanDown}>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 z-40 bg-white/80 backdrop-blur rounded-lg px-2 py-1 text-xs text-gray-400 select-none">
          {Math.round(zoom * 100)}%
        </div>

        <div className="absolute inset-0"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}>
          {/* SVG lines – use viewBox centered on (0,0) with enough space for all nodes */}
          <svg className="absolute pointer-events-none"
            style={{ left: -dim.w / 2, top: -dim.h / 2, width: dim.w, height: dim.h }}
            viewBox={`${-dim.w / 2} ${-dim.h / 2} ${dim.w} ${dim.h}`}>
            {/* Trunk arcs */}
            {trunkLinks.map(({ a, b }, i) => {
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
              const dx = b.x - a.x, dy = b.y - a.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              // Outward bulge
              const dist = Math.sqrt(mx * mx + my * my) || 1;
              const nx = mx / dist, ny = my / dist;
              const bulge = d * 0.25;
              return (
                <path key={`trunk-${i}`}
                  d={`M${a.x},${a.y} Q${mx + nx * bulge},${my + ny * bulge} ${b.x},${b.y}`}
                  stroke={sc} strokeOpacity={0.5} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              );
            })}
            {/* KP lines */}
            {nodes.map(ch => ch.kps.map(kp => {
              const kx = ch.x + Math.cos(kp.angle) * kp.orbitR;
              const ky = ch.y + Math.sin(kp.angle) * kp.orbitR;
              const mx = (ch.x + kx) / 2 + (ky - ch.y) * 0.15;
              const my = (ch.y + ky) / 2 + (ch.x - kx) * 0.15;
              return (
                <path key={`${ch.id}-${kp.name}`}
                  d={`M${ch.x},${ch.y} Q${mx},${my} ${kx},${ky}`}
                  stroke={getColor(kp.accuracy)} strokeOpacity={0.3} strokeWidth={1.5} fill="none" />
              );
            }))}
          </svg>

          {/* Balls — positioned relative to (tx, ty) */}
          {nodes.map(ch => (
            <div key={ch.id}>
              {/* Chapter */}
              <button className="absolute rounded-full flex flex-col items-center justify-center shadow-xl hover:shadow-2xl cursor-pointer select-none z-10"
                style={{
                  left: ch.x - ch.radius, top: ch.y - ch.radius,
                  width: ch.radius * 2, height: ch.radius * 2,
                  background: `radial-gradient(circle at 35% 25%, ${sc}ee, ${sc}88 60%, ${sc}cc)`,
                  color: '#fff', border: `2.5px solid ${sc}55`,
                }}
                onMouseDown={onBallDown} onTouchStart={onBallDown}
                onClick={handleChapterClick}>
                <span className="text-xs md:text-sm font-bold text-center leading-tight px-2"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{ch.name}</span>
              </button>
              {/* KP balls */}
              {ch.kps.map(kp => {
                const kx = ch.x + Math.cos(kp.angle) * kp.orbitR;
                const ky = ch.y + Math.sin(kp.angle) * kp.orbitR;
                const kc = getColor(kp.accuracy);
                return (
                  <button key={kp.name}
                    className="absolute rounded-full flex flex-col items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all cursor-pointer select-none group z-20"
                    style={{
                      left: kx - kp.radius, top: ky - kp.radius,
                      width: kp.radius * 2, height: kp.radius * 2,
                      background: `radial-gradient(circle at 35% 30%, ${kc}ee, ${kc})`,
                      color: '#fff', border: `1.5px solid ${kc}55`,
                    }}
                    onMouseDown={onBallDown} onTouchStart={onBallDown}
                    onClick={() => handleKpClick(kp.name)}>
                    <span className="text-[11px] font-bold leading-tight text-center px-1"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                      {kp.name}
                    </span>
                    {kp.accuracy !== undefined && (
                      <span className="text-[9px] opacity-85 leading-none">{kp.accuracy}%</span>
                    )}
                    {/* Tooltip always visible to show full name */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-lg z-50 shadow-lg transition-opacity">
                      {kp.name} · {getLabel(kp.accuracy)}{kp.accuracy !== undefined ? ` ${kp.accuracy}%` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
