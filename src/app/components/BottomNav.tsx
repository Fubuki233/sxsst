import { useNavigate, useLocation } from 'react-router';
import { Compass, FileText, Home, Map, Play, Settings, User } from 'lucide-react';
import { storage } from '../utils/storage';
import { transitionStore } from '../utils/transitionStore';
import { publicAsset } from '../utils/assets';
import { SvgAppIcon, type SvgAppIconName } from './SvgAppIcon';

const STUDENT_NAV = [
  { id: 'dashboard', icon: Home, label: '首页', path: '/dashboard', svgIcon: 'home' as SvgAppIconName },
  { id: 'wrong-questions', icon: FileText, label: '错题本', path: '/wrong-questions', svgIcon: 'wrongBook' as SvgAppIconName },
  { id: 'knowledge-map', icon: Map, label: '知识图谱', path: '/knowledge-map', svgIcon: 'knowledgeMap' as SvgAppIconName },
  { id: 'profile', icon: User, label: '个人中心', path: '/profile', svgIcon: 'profile' as SvgAppIconName },
];

const SENIOR_STUDENT_NAV = [
  { id: 'dashboard', icon: Compass, label: '发现', path: '/dashboard', svg: publicAsset('assets/senior-nav/discover.svg') },
  { id: 'wrong-questions', icon: FileText, label: '错题本', path: '/wrong-questions', svg: publicAsset('assets/senior-nav/wrong-book.svg') },
  { id: 'weakness', icon: Play, label: '练习', path: '/weakness', svg: publicAsset('assets/senior-nav/practice.svg') },
  { id: 'knowledge-map', icon: Map, label: '知识图谱', path: '/knowledge-map', svg: publicAsset('assets/senior-nav/knowledge-map.svg') },
  { id: 'profile', icon: User, label: '个人中心', path: '/profile', svg: publicAsset('assets/senior-nav/profile.svg') },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = storage.getCurrentUser();

  const isTeacher = user?.role === 'teacher';
  const isSeniorStudent = !isTeacher && user?.grade !== undefined && user.grade >= 4;
  const NAV_ITEMS = isTeacher
    ? [
        { id: 'teacher', icon: Settings, label: '后台', path: '/teacher' },
        { id: 'profile', icon: User, label: '个人中心', path: '/profile' },
      ]
    : isSeniorStudent
      ? SENIOR_STUDENT_NAV
      : STUDENT_NAV;

  const currentIdx = NAV_ITEMS.findIndex(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  const handleNav = (idx: number, path: string) => {
    if (idx >= 0 && currentIdx >= 0 && idx < currentIdx) {
      transitionStore.setDirection('back');
    }
    navigate(path);
  };

  return (
    <nav className={`${isSeniorStudent ? 'relative mx-auto w-full max-w-[640px] border-t border-white/8 bg-[#5B5356]/78 px-2 sm:px-5 py-2 shadow-[0_-14px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl' : 'bg-white border-t border-gray-100 px-2 py-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]'} flex justify-around flex-shrink-0`}>
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <button
            key={item.id}
            onClick={() => handleNav(idx, item.path)}
            className={`flex flex-col items-center rounded-xl transition-all ${isSeniorStudent ? 'gap-0.5 px-1.5 py-1 text-white hover:bg-white/8 active:scale-95 sm:px-3' : `gap-0.5 px-4 py-1 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}`}
            style={{ minWidth: isSeniorStudent ? '54px' : '60px' }}
          >
            {isSeniorStudent && 'svg' in item && item.svg ? (
              <span
                className={`block bg-current transition-all ${isActive ? 'scale-110' : ''}`}
                style={{
                  width: 21,
                  height: 21,
                  WebkitMask: `url(${item.svg}) center / contain no-repeat`,
                  mask: `url(${item.svg}) center / contain no-repeat`,
                }}
              />
            ) : 'svgIcon' in item && item.svgIcon ? (
              <SvgAppIcon
                name={item.svgIcon}
                size={27}
                strokeWidth={isActive ? 2.7 : 2.1}
                filled={item.id === 'dashboard' || item.id === 'profile'}
                className={`transition-all ${isActive ? 'scale-110 text-blue-500' : 'text-gray-400 opacity-75'}`}
              />
            ) : (
              <Icon
                size={isSeniorStudent ? 21 : 22}
                strokeWidth={isActive ? 2.8 : 2}
                className={isSeniorStudent ? (isActive ? 'text-white scale-110' : 'text-white/78') : (isActive ? 'text-blue-500 scale-110' : 'text-gray-400')}
                fill={isSeniorStudent && item.id === 'weakness' ? 'currentColor' : 'none'}
              />
            )}
            <span
              style={{ fontSize: isSeniorStudent ? '11px' : '11px', fontWeight: isActive ? 700 : 400 }}
              className={isSeniorStudent ? (isActive ? 'text-white' : 'text-white/72') : (isActive ? 'text-blue-500' : 'text-gray-400')}
            >
              {item.label}
            </span>
            {isActive && !isSeniorStudent && (
              <div className="w-4 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
