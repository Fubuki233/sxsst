import { ArrowRight, GraduationCap, History, MonitorCog, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router';
import { storage, type User } from '../utils/storage';

type DemoUi = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  bg: string;
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  user: User;
  path: string;
};

const DEMO_UIS: DemoUi[] = [
  {
    id: 'local-low',
    title: '本地低年级端',
    subtitle: '游戏化学习计划',
    description: '进入本地低年级学生端，展示课程卡片、下方学科闯关入口和游戏化学习计划。',
    accent: '#2563EB',
    bg: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 55%, #F8FAFC 100%)',
    icon: Sparkles,
    path: '/dashboard',
    user: {
      username: 'demo_local_low_student',
      password: 'demo',
      grade: 3,
      role: 'student',
      displayName: '小雨',
    },
  },
  {
    id: 'local-new',
    title: '高年级UI(1)',
    subtitle: '沉浸式任务卡片',
    description: '深色背景突出学习任务，横向课程卡片、AI诊断训练和分类入口适合快速进入练习。',
    accent: '#7C3AED',
    bg: 'linear-gradient(135deg, #312E81 0%, #1F2937 58%, #111827 100%)',
    icon: GraduationCap,
    path: '/dashboard',
    user: {
      username: 'demo_li_ming_new_student',
      password: 'demo',
      grade: 7,
      role: 'student',
      displayName: '李明',
    },
  },
  {
    id: 'github-old',
    title: '高年级UI(2)',
    subtitle: '学习数据概览',
    description: '浅色背景配合学习统计、学科课程卡片和底部导航，更强调今日进度与整体学习状态。',
    accent: '#2563EB',
    bg: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 55%, #F8FAFC 100%)',
    icon: History,
    path: '/legacy',
    user: {
      username: 'demo_li_ming_legacy_student',
      password: 'demo',
      grade: 7,
      role: 'student',
      displayName: '李明',
    },
  },
  {
    id: 'teacher',
    title: '教师端',
    subtitle: '教学管理工作台',
    description: '进入每日概览、学情报告、个人报告和教学管理工具，支持课堂演示闭环。',
    accent: '#059669',
    bg: 'linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 54%, #F8FAFC 100%)',
    icon: MonitorCog,
    path: '/teacher',
    user: {
      username: 'demo_teacher',
      password: 'demo',
      grade: 0,
      role: 'teacher',
      displayName: '王老师',
    },
  },
];

export default function UiIndexPage() {
  const navigate = useNavigate();

  const openDemo = (demo: DemoUi) => {
    storage.startDemoSession(demo.user);
    navigate(demo.path);
  };

  return (
    <main className="size-full overflow-auto bg-[#F6F8FC] text-slate-950">
      <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-5 py-6 md:px-8 md:py-10">
        <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {DEMO_UIS.map(demo => {
            const Icon = demo.icon;
            const isDark = demo.id === 'local-new';
            return (
              <button
                key={demo.id}
                onClick={() => openDemo(demo)}
                className={`group flex min-h-[360px] flex-col overflow-hidden rounded-lg p-5 text-left shadow-sm ring-1 transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  isDark ? 'text-white ring-white/10' : 'text-slate-950 ring-slate-200'
                }`}
                style={{ background: demo.bg }}
              >
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-lg ${isDark ? 'bg-white/12' : 'bg-white'} shadow-sm`}>
                    <Icon size={28} className={isDark ? 'text-white' : 'text-slate-800'} strokeWidth={2.4} />
                  </span>
                </div>

                <div className="mt-auto">
                  <p className={isDark ? 'text-white/68' : 'text-slate-500'} style={{ fontSize: '14px', fontWeight: 900 }}>
                    {demo.subtitle}
                  </p>
                  <h2 className="mt-2" style={{ fontSize: '28px', lineHeight: 1.12, fontWeight: 900, letterSpacing: 0 }}>
                    {demo.title}
                  </h2>
                  <p className={isDark ? 'mt-4 text-white/72' : 'mt-4 text-slate-600'} style={{ fontSize: '15px', lineHeight: 1.7 }}>
                    {demo.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2" style={{ color: isDark ? '#FFFFFF' : demo.accent, fontSize: '15px', fontWeight: 900 }}>
                    打开界面
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
