import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { CalendarDays, ChevronLeft, ChevronRight, Settings, TrendingDown, TrendingUp, User } from 'lucide-react';
import { BottomNav } from './BottomNav';

const LANDSCAPE_BG = '/assets/横屏背景图.png';
const PORTRAIT_BG = '/assets/竖屏背景图.png';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  // ── Calendar state ──
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1); // 1‑based
  const [dailyStatsMap, setDailyStatsMap] = useState<Record<string, { count: number; accuracy: number }>>({});

  const [improving, setImproving] = useState<string[]>([]);
  const [declining, setDeclining] = useState<string[]>([]);

  useEffect(() => {
    const refreshUser = () => {
      const latestUser = storage.getCurrentUser();
      if (latestUser) setUser(latestUser);
    };

    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    const answers = storage.getAnswers();
    setTotalQuestions(answers.length);

    if (answers.length > 0) {
      const correct = answers.filter(a => a.isCorrect).length;
      setOverallAccuracy(Math.round((correct / answers.length) * 100));
    }

    // ── Compute daily stats for the whole dataset ──
    const map: Record<string, { count: number; accuracy: number }> = {};
    answers.forEach(a => {
      const d = new Date(a.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = { count: 0, accuracy: 0 };
      map[key].count++;
      if (a.isCorrect) map[key].accuracy++;
    });
    // Finalize accuracy
    for (const key of Object.keys(map)) {
      map[key].accuracy = Math.round((map[key].accuracy / map[key].count) * 100);
    }
    setDailyStatsMap(map);

    const stats = storage.getKnowledgeStats();
    const recentAnswers = answers.slice(-50);

    const knowledgeRecent: Record<string, number[]> = {};
    recentAnswers.forEach(a => {
      if (!knowledgeRecent[a.knowledgePoint]) {
        knowledgeRecent[a.knowledgePoint] = [];
      }
      knowledgeRecent[a.knowledgePoint].push(a.isCorrect ? 1 : 0);
    });

    const improvingList: string[] = [];
    const decliningList: string[] = [];

    Object.entries(knowledgeRecent).forEach(([kp, results]) => {
      if (results.length >= 4) {
        const firstHalf = results.slice(0, Math.floor(results.length / 2));
        const secondHalf = results.slice(Math.floor(results.length / 2));
        const firstAcc = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAcc = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        if (secondAcc - firstAcc > 0.2) improvingList.push(kp);
        if (firstAcc - secondAcc > 0.2) decliningList.push(kp);
      }
    });

    setImproving(improvingList.slice(0, 3));
    setDeclining(decliningList.slice(0, 3));

    window.addEventListener('profile-updated', refreshUser);
    window.addEventListener('focus', refreshUser);
    return () => {
      window.removeEventListener('profile-updated', refreshUser);
      window.removeEventListener('focus', refreshUser);
    };
  }, [navigate]);

  if (!user) return null;

  const displayName = user.displayName?.trim() || user.username;

  const getGradeLabel = (grade: number) => {
    if (grade <= 6) return `小学${grade}年级`;
    return `初中${grade - 6}年级`;
  };

  // ── Calendar helpers ──
  const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];
  const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const prevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarYear(y => y - 1);
      setCalendarMonth(12);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarYear(y => y + 1);
      setCalendarMonth(1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay(); // 0=Sun

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  const activeDays = Object.keys(dailyStatsMap).length;
  const medalCount = Math.floor(totalQuestions / 20) + (overallAccuracy >= 80 ? 1 : 0);

  return (
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: '#EEF4FF' }}>
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/20" />

      <div className="relative z-10 flex-1 overflow-auto px-3 md:px-8 pt-3 md:pt-5 pb-5">
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-5">
          <section
            className="relative overflow-hidden rounded-[28px] px-4 py-4 md:px-5 md:py-5 border border-white/85"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,249,255,0.94) 54%, rgba(255,251,235,0.86) 100%)',
              boxShadow: '0 14px 34px rgba(65, 98, 165, 0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
          >
            <button
              onClick={() => navigate('/settings')}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/86 shadow-sm hover:bg-white active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-sky-400"
              title="设置"
            >
              <Settings size={22} className="text-slate-600" />
            </button>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5 pr-12">
              <div className="min-w-0 lg:w-[310px] flex items-center gap-3 flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/84 flex items-center justify-center shadow-lg ring-1 ring-white/80 flex-shrink-0">
                  <div className="w-[52px] h-[52px] md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#4F46E5] flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} strokeWidth={2.4} className="text-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-slate-900" style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900, lineHeight: 1 }}>{displayName}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/75 px-3 py-1 text-sky-700 shadow-sm" style={{ fontSize: '12px', fontWeight: 900 }}>{getGradeLabel(user.grade)}</span>
                    <span className="rounded-full bg-white/75 px-3 py-1 text-amber-600 shadow-sm" style={{ fontSize: '12px', fontWeight: 900 }}>{medalCount} 枚勋章</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-0 flex-1 rounded-2xl bg-white/65 border border-white/85 overflow-hidden">
                <div className="px-3 py-3 md:px-4">
                  <div className="text-orange-500 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>累计做题</div>
                  <div className="text-orange-600" style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1.05 }}>{totalQuestions}</div>
                </div>
                <div className="px-3 py-3 md:px-4 border-l border-white/90">
                  <div className="text-sky-600 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>坚持学习</div>
                  <div className="text-sky-700" style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1.05 }}>{activeDays}</div>
                </div>
                <div className="px-3 py-3 md:px-4 border-l border-white/90">
                  <div className="text-emerald-600 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>正确率</div>
                  <div className="text-emerald-700" style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1.05 }}>{overallAccuracy}%</div>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar + data */}
          <div
            className="bg-white/[0.94] rounded-[26px] shadow-lg overflow-hidden border border-white"
            style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10), inset 0 1px 0 rgba(255,255,255,0.9)' }}
          >
            <div className="px-4 md:px-5 pt-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-slate-900" style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1.2 }}>学习日历</h2>
                <p className="text-slate-500 mt-1" style={{ fontSize: '12px', fontWeight: 700 }}>查看每天做题数量和正确率</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 border border-sky-100">
                <CalendarDays size={15} className="text-sky-600" />
                <span className="text-sky-700" style={{ fontSize: '12px', fontWeight: 900 }}>{calendarYear}年</span>
              </div>
            </div>

            <div className="px-3 md:px-5 py-3 md:py-4">
            {/* Month header */}
            <div className="flex items-center justify-between mb-3 rounded-2xl bg-slate-50 px-2 py-2">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-sky-500 hover:bg-white transition-colors">
                <ChevronLeft size={22} />
              </button>
              <h3 className="text-slate-700" style={{ fontWeight: 900, fontSize: '18px' }}>
                {calendarYear}年 {MONTH_NAMES[calendarMonth - 1]}
              </h3>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-sky-500 hover:bg-white transition-colors">
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2 rounded-xl bg-slate-100 py-1.5">
              {DAY_NAMES.map(name => (
                <div key={name} className="text-center text-slate-500" style={{ fontSize: '13px', fontWeight: 700 }}>
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-2.5 md:gap-y-3">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const key = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const stat = dailyStatsMap[key];
                const hasData = stat && stat.count > 0;

                return (
                  <div key={key} className="flex flex-col items-center justify-start min-h-[48px] md:min-h-[54px]">
                    {/* Date circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        hasData ? 'bg-[#0EA5E9] text-white shadow-sm' : 'text-slate-700'
                      }`}
                      style={{ fontSize: '16px', fontWeight: hasData ? 800 : 500 }}
                    >
                      {day}
                    </div>
                    {/* Stats below */}
                    {hasData ? (
                      <>
                        <div className="text-[#0EA5E9] mt-0.5" style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1 }}>
                          {stat.count}题
                        </div>
                        <div className="text-green-500" style={{ fontSize: '10px', lineHeight: 1, fontWeight: 800 }}>
                          {stat.accuracy}%
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '16px' }} />
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Trending */}
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white/[0.94] rounded-[24px] shadow-sm p-4 border border-white">
                <div className="flex items-center gap-2 mb-3 text-emerald-600 text-sm md:text-base">
                  <span className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                    <TrendingUp size={18} />
                  </span>
                  <span style={{ fontWeight: 900 }}>进步明显</span>
                </div>
                {improving.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {improving.map(kp => (
                      <div key={kp} className="px-3 py-1.5 bg-emerald-50 rounded-full text-emerald-700 text-sm" style={{ fontWeight: 800 }}>{kp}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">暂无数据</div>
                )}
              </div>
              <div className="bg-white/[0.94] rounded-[24px] shadow-sm p-4 border border-white">
                <div className="flex items-center gap-2 mb-3 text-rose-600 text-sm md:text-base">
                  <span className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                    <TrendingDown size={18} />
                  </span>
                  <span style={{ fontWeight: 900 }}>需要关注</span>
                </div>
                {declining.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {declining.map(kp => (
                      <div key={kp} className="px-3 py-1.5 bg-rose-50 rounded-full text-rose-700 text-sm" style={{ fontWeight: 800 }}>{kp}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">暂无数据</div>
                )}
              </div>
          </div>

        </div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
