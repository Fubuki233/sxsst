import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../utils/storage';
import { TrendingUp, TrendingDown, User, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { BottomNav } from './BottomNav';

const LANDSCAPE_BG = '/assets/横屏背景图.png';
const PORTRAIT_BG = '/assets/竖屏背景图.png';
const ME_BANNER = '/assets/me_banner.png';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
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

    const estimatedMinutes = Math.round(answers.length * 1.5);
    setTotalTime(estimatedMinutes);

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
      <div className="absolute inset-0 pointer-events-none bg-white/10" />

      <div className="relative z-10 flex-1 overflow-auto px-4 md:px-6 pt-5 pb-5">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <section
            className="relative overflow-hidden px-5 py-5 md:px-9 md:py-7 min-h-[132px] md:min-h-[156px]"
            style={{ background: 'linear-gradient(180deg, #C4D1F8 0%, rgba(196, 209, 248, 0.58) 42%, rgba(196, 209, 248, 0) 100%)' }}
          >
            <div className="absolute inset-0 opacity-45 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] bg-[length:32px_32px]" />
            <img
              src={ME_BANNER}
              alt=""
              className="absolute right-12 md:right-[72px] top-1/2 -translate-y-1/2 h-[82%] md:h-[88%] max-w-[42%] object-contain object-right pointer-events-none"
            />
            <button
              onClick={() => navigate('/settings')}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/88 shadow-md hover:bg-white transition-colors"
              title="设置"
            >
              <Settings size={22} className="text-slate-600" />
            </button>

            <div className="relative z-10 flex items-center gap-3 pr-12">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/82 flex items-center justify-center shadow-lg flex-shrink-0">
                <div className="w-[52px] h-[52px] md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#7EA7FF] to-[#3E63F4] flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} strokeWidth={2.4} className="text-white" />
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-slate-900" style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{displayName}</span>
                  <span className="rounded-full bg-gradient-to-r from-[#7EA7FF] to-[#4D72F5] px-2.5 py-1 text-white whitespace-nowrap" style={{ fontSize: '12px', fontWeight: 800 }}>{getGradeLabel(user.grade)}</span>
                </div>
                <div className="mt-2 text-blue-700" style={{ fontSize: '15px', fontWeight: 800 }}>{user.role === 'student' ? '学生' : '老师'}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/72 px-3 py-1 text-blue-600 shadow-sm" style={{ fontSize: '12px', fontWeight: 800 }}>已签到</span>
                  <span className="rounded-full bg-white/72 px-3 py-1 text-amber-500 shadow-sm" style={{ fontSize: '12px', fontWeight: 800 }}>{medalCount} 枚勋章</span>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar + data */}
          <div
            className="bg-white rounded-[24px] shadow-lg overflow-hidden"
            style={{ boxShadow: '0 18px 38px rgba(86, 114, 184, 0.12)' }}
          >
            <div className="grid grid-cols-3 px-4 py-4 border-b border-slate-100">
              <div className="text-center">
                <div className="text-orange-500" style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{totalQuestions}</div>
                <div className="mt-1.5 text-slate-500" style={{ fontSize: '13px', fontWeight: 700 }}>累计做题</div>
              </div>
              <div className="text-center">
                <div className="text-amber-400" style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{activeDays}</div>
                <div className="mt-1.5 text-slate-500" style={{ fontSize: '13px', fontWeight: 700 }}>坚持学习</div>
              </div>
              <div className="text-center">
                <div className="text-lime-500" style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{overallAccuracy}%</div>
                <div className="mt-1.5 text-slate-500" style={{ fontSize: '13px', fontWeight: 700 }}>正确率</div>
              </div>
            </div>

            <div className="px-3 py-3">
            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-sky-400 hover:bg-sky-50 transition-colors">
                <ChevronLeft size={22} />
              </button>
              <h3 className="text-slate-600" style={{ fontWeight: 700, fontSize: '20px' }}>
                {MONTH_NAMES[calendarMonth - 1]}
              </h3>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:bg-slate-50 transition-colors">
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
            <div className="grid grid-cols-7 gap-y-2.5">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const key = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const stat = dailyStatsMap[key];
                const hasData = stat && stat.count > 0;

                return (
                  <div key={key} className="flex flex-col items-center justify-start min-h-[48px]">
                    {/* Date circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        hasData ? 'bg-[#32AFE7] text-white shadow-sm' : 'text-slate-900'
                      }`}
                      style={{ fontSize: '16px', fontWeight: hasData ? 800 : 500 }}
                    >
                      {day}
                    </div>
                    {/* Stats below */}
                    {hasData ? (
                      <>
                        <div className="text-[#32AFE7] mt-0.5" style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1 }}>
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
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="mb-3 md:mb-4 text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>知识点提升与下降</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-3 text-green-600 text-sm md:text-base">
                  <TrendingUp size={18} className="md:w-5 md:h-5" />
                  <span style={{ fontWeight: 600 }}>进步明显</span>
                </div>
                {improving.length > 0 ? (
                  <div className="space-y-1.5 md:space-y-2">
                    {improving.map(kp => (
                      <div key={kp} className="px-2.5 md:px-3 py-1.5 md:py-2 bg-green-50 rounded-xl text-green-700 text-sm md:text-base">{kp}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm md:text-base">暂无数据</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-3 text-red-600 text-sm md:text-base">
                  <TrendingDown size={18} className="md:w-5 md:h-5" />
                  <span style={{ fontWeight: 600 }}>需要关注</span>
                </div>
                {declining.length > 0 ? (
                  <div className="space-y-1.5 md:space-y-2">
                    {declining.map(kp => (
                      <div key={kp} className="px-2.5 md:px-3 py-1.5 md:py-2 bg-red-50 rounded-xl text-red-700 text-sm md:text-base">{kp}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm md:text-base">暂无数据</div>
                )}
              </div>
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
