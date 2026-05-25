import type { CSSProperties } from 'react';

export type SvgAppIconName =
  | 'math'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'home'
  | 'wrongBook'
  | 'knowledgeMap'
  | 'profile'
  | 'practice'
  | 'map'
  | 'sparkles'
  | 'trophy'
  | 'star'
  | 'gem'
  | 'play'
  | 'flag'
  | 'gift'
  | 'clipboard'
  | 'flame';

type SvgAppIconProps = {
  name: SvgAppIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
  filled?: boolean;
};

export function SvgAppIcon({ name, size = 24, className, style, strokeWidth = 2, filled = false }: SvgAppIconProps) {
  const fill = filled ? 'currentColor' : 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {name === 'math' && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h8" />
        </>
      )}
      {name === 'english' && (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3z" />
          <path d="M8 7h7M8 11h5" />
          <path d="M15 17c.5-2 1.5-4 2.5-4s2 2 2.5 4M16 15h3" />
        </>
      )}
      {name === 'physics' && (
        <>
          <circle cx="12" cy="12" r="1.8" fill={filled ? 'currentColor' : 'none'} />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
        </>
      )}
      {name === 'chemistry' && (
        <>
          <path d="M9 3h6M10 3v5l-5.5 9.5A2.3 2.3 0 0 0 6.5 21h11a2.3 2.3 0 0 0 2-3.5L14 8V3" />
          <path d="M7 16h10M9 12h6" />
        </>
      )}
      {name === 'home' && (
        <>
          <path d="m3 11 9-8 9 8" />
          <path d="M5 10v10h14V10M10 20v-6h4v6" />
        </>
      )}
      {name === 'wrongBook' && (
        <>
          <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v18H7a2 2 0 0 0-2 2z" />
          <path d="m9 9 5 5M14 9l-5 5" />
        </>
      )}
      {name === 'knowledgeMap' && (
        <>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="7" r="2.5" />
          <circle cx="12" cy="18" r="2.5" />
          <path d="m8.2 7.2 7.6-.4M7.4 8.2l3.4 7.5M16.7 9.1l-3.5 6.5" />
        </>
      )}
      {name === 'profile' && (
        <>
          <circle cx="12" cy="7.5" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      )}
      {name === 'practice' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 8 6 4-6 4z" fill={fill} />
        </>
      )}
      {name === 'map' && (
        <>
          <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
          <path d="M9 3v15M15 6v15" />
        </>
      )}
      {name === 'sparkles' && (
        <>
          <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" fill={fill} />
          <path d="M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3" />
        </>
      )}
      {name === 'trophy' && (
        <>
          <path d="M8 4h8v5a4 4 0 0 1-8 0z" fill={fill} />
          <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M9 21h6M10 17h4" />
        </>
      )}
      {name === 'star' && (
        <path
          d="m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9z"
          fill={fill}
        />
      )}
      {name === 'gem' && (
        <>
          <path d="M6 3h12l4 6-10 12L2 9z" fill={fill} />
          <path d="M2 9h20M6 3l3 6 3-6 3 6 3-6M9 9l3 12 3-12" />
        </>
      )}
      {name === 'play' && <path d="m8 5 11 7-11 7z" fill={filled ? 'currentColor' : 'none'} />}
      {name === 'flag' && (
        <>
          <path d="M5 21V4" />
          <path d="M5 4h11l-1.5 4L16 12H5" fill={fill} />
        </>
      )}
      {name === 'gift' && (
        <>
          <path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14" />
          <path d="M12 7H8.5A2.5 2.5 0 1 1 12 3.5zM12 7h3.5A2.5 2.5 0 1 0 12 3.5z" />
        </>
      )}
      {name === 'clipboard' && (
        <>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4a3 3 0 0 1 6 0v2H9zM9 11h6M9 15h4" />
        </>
      )}
      {name === 'flame' && (
        <path
          d="M12 3q1 4 4 6.5t3 5.5a7 7 0 0 1-14 0 5 5 0 0 1 1-3 3.5 3.5 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"
          fill={fill}
        />
      )}
    </svg>
  );
}
