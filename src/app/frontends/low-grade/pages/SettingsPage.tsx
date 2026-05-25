import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChevronRight, Database, GraduationCap, Lock } from 'lucide-react';
import { storage } from '../../../utils/storage';

const MENU_ITEMS = [
  { id: 'change-password', icon: Lock, label: '账号安全', desc: '修改登录密码', path: '/settings/change-password' },
  { id: 'switch-grade', icon: GraduationCap, label: '切换年级', desc: '当前：加载中', path: '/settings/switch-grade' },
  { id: 'data-management', icon: Database, label: '数据管理', desc: '清空记录、退出登录', path: '/settings/data-management' },
];

function getGradeLabel(grade: number) {
  return grade <= 6 ? `小学${grade}年级` : `初中${grade - 6}年级`;
}

export default function LowGradeSettingsPage() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const items = MENU_ITEMS.map(item => (
    item.id === 'switch-grade'
      ? { ...item, desc: `当前：${user ? getGradeLabel(user.grade) : ''}` }
      : item
  ));

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">设置</span>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="w-full">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full px-4 md:px-8 py-3.5 flex items-center gap-2.5 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <Icon size={18} className="text-blue-500 flex-shrink-0" />
                  <span className="text-gray-800 text-sm flex-shrink-0" style={{ fontWeight: 600 }}>{item.label}</span>
                  <span className="text-gray-400 text-xs text-right ml-auto mr-1">{item.desc}</span>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </button>
                {idx < items.length - 1 && <div className="mx-4 md:mx-8 border-b border-gray-200" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
