import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, ChevronRight, Database, GraduationCap, Lock, Moon, Save, Sun, User } from 'lucide-react';
import { BottomNav } from '../../../components/BottomNav';
import { storage } from '../../../utils/storage';
import { getStoredSeniorTheme, setStoredSeniorTheme, type SeniorThemeMode } from '../components/SeniorThemeProvider';

const MENU_ITEMS = [
  { id: 'change-password', icon: Lock, label: '账号安全', desc: '修改登录密码', path: '/settings/change-password' },
  { id: 'switch-grade', icon: GraduationCap, label: '切换年级', desc: '当前：加载中', path: '/settings/switch-grade' },
  { id: 'data-management', icon: Database, label: '数据管理', desc: '清空记录、退出登录', path: '/settings/data-management' },
];

function getGradeLabel(grade: number) {
  return grade <= 6 ? `小学${grade}年级` : `初中${grade - 6}年级`;
}

export default function HighGradeSettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [seniorTheme, setSeniorTheme] = useState<SeniorThemeMode>(() => getStoredSeniorTheme());
  const [profileName, setProfileName] = useState(() => user?.displayName?.trim() || user?.username || '');
  const [profileAvatar, setProfileAvatar] = useState(() => user?.avatarUrl || '');

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setProfileName(currentUser.displayName?.trim() || currentUser.username);
    setProfileAvatar(currentUser.avatarUrl || '');
  }, [navigate]);

  const items = MENU_ITEMS.map(item => (
    item.id === 'switch-grade'
      ? { ...item, desc: `当前：${user ? getGradeLabel(user.grade) : ''}` }
      : item
  ));
  const themeIsLight = seniorTheme === 'light';

  const toggleSeniorTheme = () => {
    const nextTheme = themeIsLight ? 'dark' : 'light';
    setSeniorTheme(nextTheme);
    setStoredSeniorTheme(nextTheme);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileAvatar(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    const ok = storage.updateProfile(user.username, {
      displayName: profileName,
      grade: user.grade,
      avatarUrl: profileAvatar,
    });
    if (!ok) return;

    const updatedUser = storage.getCurrentUser();
    setUser(updatedUser);
    window.dispatchEvent(new Event('profile-updated'));
  };

  return (
    <div className="size-full flex flex-col relative overflow-hidden [background:var(--senior-page-bg)] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
      <div className="relative z-10 flex-1 overflow-auto px-4 pt-7 pb-7">
        <div className="mx-auto w-full max-w-[480px]">
          <button onClick={() => navigate(-1)} className="mb-5 flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-white/82">
            <ArrowLeft size={16} />
            <span style={{ fontSize: '13px', fontWeight: 800 }}>返回</span>
          </button>
          <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>设置</h1>

          <div className="mt-7 space-y-3">
            <section className="rounded-[8px] bg-white/10 p-4 text-white">
              <div className="mb-4 flex items-center gap-4">
                <label className="relative flex-shrink-0 cursor-pointer">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white/16">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="用户头像" className="h-full w-full object-cover" />
                    ) : (
                      <User size={34} />
                    )}
                  </span>
                  <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#A889F3] text-white shadow-sm">
                    <Camera size={16} />
                  </span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <div className="min-w-0 flex-1">
                  <div className="text-white" style={{ fontSize: '18px', fontWeight: 900 }}>个人资料</div>
                  <div className="mt-1 truncate text-white/52" style={{ fontSize: '12px', fontWeight: 700 }}>头像与首页问候语名称</div>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-white/62" style={{ fontSize: '12px', fontWeight: 800 }}>用户名</span>
                <input
                  value={profileName}
                  onChange={event => setProfileName(event.target.value)}
                  className="h-12 w-full rounded-[8px] border border-white/10 bg-white/12 px-3 text-white outline-none placeholder:text-white/38 focus:border-white/28"
                  placeholder="请输入用户名"
                  style={{ fontSize: '15px', fontWeight: 800 }}
                />
              </label>
              <button onClick={handleSaveProfile} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#A889F3] text-white transition-transform active:scale-[0.98]">
                <Save size={17} />
                <span style={{ fontSize: '14px', fontWeight: 900 }}>保存资料</span>
              </button>
            </section>

            <button onClick={toggleSeniorTheme} className="flex h-[76px] w-full items-center gap-3 rounded-[8px] bg-white/10 px-4 text-left text-white transition-colors hover:bg-white/14">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
                {themeIsLight ? <Sun size={21} /> : <Moon size={21} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-white" style={{ fontSize: '16px', fontWeight: 900 }}>显示模式</span>
                <span className="mt-1 block truncate text-white/52" style={{ fontSize: '12px', fontWeight: 700 }}>{themeIsLight ? '当前：浅色模式' : '当前：深色模式'}</span>
              </span>
              <span className="relative h-8 w-14 rounded-full bg-white/18 p-1 transition-colors">
                <span className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${themeIsLight ? 'translate-x-6' : 'translate-x-0'}`} />
              </span>
            </button>

            {items.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => navigate(item.path)} className="flex h-[76px] w-full items-center gap-3 rounded-[8px] bg-white/10 px-4 text-left text-white transition-colors hover:bg-white/14">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
                    <Icon size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-white" style={{ fontSize: '16px', fontWeight: 900 }}>{item.label}</span>
                    <span className="mt-1 block truncate text-white/52" style={{ fontSize: '12px', fontWeight: 700 }}>{item.desc}</span>
                  </span>
                  <ChevronRight size={18} className="text-white/42" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="relative z-10 flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
