import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../../utils/storage';
import { TrendingUp, TrendingDown, User, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { BottomNav } from './BottomNav';

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
  }, [navigate]);

  if (!user) return null;

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

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <div className="flex-1 overflow-auto p-4 md:p-6 pt-6">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">

          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 relative">
            {/* Settings gear – top right */}
            <button
              onClick={() => navigate('/legacy/settings')}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              title="设置"
            >
              <Settings size={20} className="text-gray-400 hover:text-gray-600" />
            </button>
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <User size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, fontSize: '18px' }}>{user.username}</span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 rounded-full" style={{ fontSize: '12px', fontWeight: 600 }}>
                    {getGradeLabel(user.grade)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{user.role === 'student' ? '学生' : '老师'}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="text-center p-3 md:p-4 bg-blue-50 rounded-xl">
                <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '24px' }}>{totalQuestions}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-0.5">累计做题</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-green-50 rounded-xl">
                <div className="text-green-600" style={{ fontWeight: 800, fontSize: '24px' }}>{overallAccuracy}%</div>
                <div className="text-xs md:text-sm text-gray-600 mt-0.5">正确率</div>
              </div>
              <div className="text-center p-3 md:p-4 bg-purple-50 rounded-xl">
                <div className="text-purple-600" style={{ fontWeight: 800, fontSize: '24px' }}>{totalTime}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-0.5">学习时长(分)</div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                {calendarYear}年 {MONTH_NAMES[calendarMonth - 1]}
              </h3>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map(name => (
                <div key={name} className="text-center text-gray-400" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-2">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;

                const key = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const stat = dailyStatsMap[key];
                const hasData = stat && stat.count > 0;

                return (
                  <div key={key} className="flex flex-col items-center gap-0.5 py-1">
                    {/* Date circle */}
                    <div
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors ${
                        hasData ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500'
                      }`}
                      style={{ fontSize: '13px', fontWeight: hasData ? 700 : 400 }}
                    >
                      {day}
                    </div>
                    {/* Stats below */}
                    {hasData ? (
                      <>
                        <div className="text-blue-600" style={{ fontSize: '10px', fontWeight: 600, lineHeight: 1 }}>
                          {stat.count}题
                        </div>
                        <div className="text-green-600" style={{ fontSize: '9px', lineHeight: 1 }}>
                          {stat.accuracy}%
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '20px' }} />
                    )}
                  </div>
                );
              })}
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

      <BottomNav />
    </div>
  );
}