import { useNavigate, useLocation } from 'react-router';
import { Home, FileText, Map, User, Settings } from 'lucide-react';
import { storage } from '../utils/storage';
import { transitionStore } from '../utils/transitionStore';

const STUDENT_NAV = [
  { id: 'dashboard', icon: Home, label: '首页', path: '/dashboard', image: '/assets/home.png', activeImage: '/assets/home_c.png' },
  { id: 'wrong-questions', icon: FileText, label: '错题本', path: '/wrong-questions', image: '/assets/errorbook.png', activeImage: '/assets/errorbook_c.png' },
  { id: 'knowledge-map', icon: Map, label: '知识图谱', path: '/knowledge-map', image: '/assets/knowledgemap.png', activeImage: '/assets/knowledgemap_c.png' },
  { id: 'profile', icon: User, label: '个人中心', path: '/profile', image: '/assets/me.png', activeImage: '/assets/me_c.png' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = storage.getCurrentUser();

  const isTeacher = user?.role === 'teacher';
  const NAV_ITEMS = isTeacher
    ? [
        { id: 'teacher', icon: Settings, label: '后台', path: '/teacher' },
        { id: 'profile', icon: User, label: '个人中心', path: '/profile' },
      ]
    : STUDENT_NAV;

  const currentIdx = NAV_ITEMS.findIndex(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  const handleNav = (idx: number, path: string) => {
    if (idx >= 0 && currentIdx >= 0 && idx < currentIdx) {
      transitionStore.setDirection('back');
    }
    navigate(path);
  };

  return (
    <nav className="bg-white border-t border-gray-100 px-2 py-2 flex justify-around flex-shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        return (
          <button
            key={item.id}
            onClick={() => handleNav(idx, item.path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            style={{ minWidth: '60px' }}
          >
            {'image' in item && item.image ? (
              <img
                src={isActive && 'activeImage' in item && item.activeImage ? item.activeImage : item.image}
                alt=""
                className={`w-7 h-7 object-contain transition-all ${isActive ? 'scale-110' : 'opacity-75'}`}
              />
            ) : (
              <Icon
                size={22}
                strokeWidth={isActive ? 2.8 : 2}
                className={isActive ? 'text-blue-500 scale-110' : 'text-gray-400'}
              />
            )}
            <span
              style={{ fontSize: '11px', fontWeight: isActive ? 700 : 400 }}
              className={isActive ? 'text-blue-500' : 'text-gray-400'}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="w-4 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
