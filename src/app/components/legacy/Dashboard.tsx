import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../../utils/storage';
import { getSubjectsByGrade } from '../../utils/questions';
import {
  Bell, ChevronRight, Trophy, Star, User
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BottomNav } from './BottomNav';

// ── Dynamic import: all PNG icons from imports folder ──
const iconModules = import.meta.glob('../../imports/*.png', { eager: true, import: 'default' }) as Record<string, string>;

function getIcon(name: string): string {
  for (const [path, url] of Object.entries(iconModules)) {
    if (path.includes(name)) return url;
  }
  return '';
}

// ── Subject config: use custom PNG icons ──
const SUBJECT_CONFIG: Record<string, {
  bg: string;
  imgUrl: string;
  desc: string;
  btnBg: string;
  cardBorder: string;
}> = {
  math: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
    imgUrl: getIcon('数学'),
    desc: '数与逻辑的世界',
    btnBg: 'bg-blue-500',
    cardBorder: 'border-blue-100',
  },
  english: {
    bg: 'bg-gradient-to-br from-green-100 to-green-50',
    imgUrl: getIcon('英语'),
    desc: '探索语言的乐趣',
    btnBg: 'bg-green-500',
    cardBorder: 'border-green-100',
  },
  physics: {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-50',
    imgUrl: getIcon('物理'),
    desc: '发现物理的奥秘',
    btnBg: 'bg-purple-500',
    cardBorder: 'border-purple-100',
  },
  chemistry: {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-50',
    imgUrl: getIcon('化学'),
    desc: '探索物质的变化',
    btnBg: 'bg-amber-500',
    cardBorder: 'border-amber-100',
  },
};

const GRADE_CHINESE: Record<number, string> = {
  1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级',
  7: '初一', 8: '初二', 9: '初三',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [todayCount, setTodayCount] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [weakCount, setWeakCount] = useState(0);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setAvailableSubjects(getSubjectsByGrade(currentUser.grade));

    const todayAnswers = storage.getTodayAnswers();
    setTodayCount(todayAnswers.length);

    const allAnswers = storage.getAnswers();
    if (allAnswers.length > 0) {
      const correct = allAnswers.filter(a => a.isCorrect).length;
      setOverallAccuracy(Math.round((correct / allAnswers.length) * 100));
    }

    const stats = storage.getKnowledgeStats();
    setWeakCount(stats.filter(s => s.accuracy < 60).length);
  }, [navigate]);

  if (!user) return null;

  const gradeLabel = GRADE_CHINESE[user.grade] || `${user.grade}年级`;
  const allAnswers = storage.getAnswers();
  const badgeCount = Math.floor(allAnswers.filter(a => a.isCorrect).length / 5);

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>

      {/* ── Header: avatar + grade + badges + bell, no white bg ── */}
      <header className="px-4 md:px-8 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        {/* Avatar + Name + Grade */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
              <User size={22} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star size={9} className="text-white" style={{ fill: 'white' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight: 700, fontSize: '16px' }}>{user.username}同学</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full"
                style={{ fontSize: '11px', fontWeight: 600 }}>{gradeLabel}</span>
            </div>
            <p className="text-gray-500" style={{ fontSize: '12px' }}>
              继续加油，你一定会越来越棒！
            </p>
          </div>
        </div>

        {/* Right: badges + bell */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl px-3 py-2 border border-yellow-200">
            <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center">
              <Trophy size={14} className="text-white" />
            </div>
            <div className="text-center">
              <div className="text-amber-500" style={{ fontSize: '10px' }}>勋章</div>
              <div className="text-amber-600" style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>
                {badgeCount}<span style={{ fontWeight: 500, fontSize: '11px' }} className="text-amber-500 ml-0.5">枚</span>
              </div>
            </div>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
              style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>3</span>
          </button>
        </div>
      </header>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-2 space-y-3 md:space-y-4">

          {/* ── Stats — single card with dividers ── */}
          <div className="bg-white rounded-2xl shadow-sm flex items-center">
            {/* 今日做题 */}
            <div className="flex-1 flex items-center justify-center py-3 gap-2.5">
              <img src={getIcon('今日做题')} alt="今日做题" className="w-11 h-11 object-contain flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-gray-500" style={{ fontSize: '12px' }}>今日做题</span>
                <span className="text-blue-600" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>{todayCount}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="bg-gray-200 rounded-full flex-shrink-0" style={{ width: '1px', height: '70px' }} />

            {/* 整体正确率 */}
            <div className="flex-1 flex items-center justify-center py-3 gap-2.5">
              <img src={getIcon('正确率')} alt="正确率" className="w-11 h-11 object-contain flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-gray-500" style={{ fontSize: '12px' }}>整体正确率</span>
                <span className="text-green-600" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>
                  {overallAccuracy}<span style={{ fontSize: '13px', fontWeight: 600 }}>%</span>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="bg-gray-200 rounded-full flex-shrink-0" style={{ width: '1px', height: '70px' }} />

            {/* 薄弱知识点 */}
            <div className="flex-1 flex items-center justify-center py-3 gap-2.5">
              <img src={getIcon('薄弱知识点')} alt="薄弱知识点" className="w-11 h-11 object-contain flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-gray-500" style={{ fontSize: '12px' }}>薄弱知识点</span>
                <span className="text-rose-600" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>{weakCount}</span>
              </div>
            </div>
          </div>

          {/* ── Weakness Training Banner ── */}
          <button
            onClick={() => navigate('/legacy/weakness')}
            className="w-full rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow relative flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4A9BF5 0%, #3B82F6 40%, #6366F1 100%)',
              minHeight: '96px',
            }}
          >
            {/* Icon – absolute at midpoint, same height as button */}
            <div
              className="absolute top-0 bottom-0 left-0 flex items-center justify-center"
              style={{ width: '28%' }}
            >
              <img
                src={getIcon('一键薄弱训练')}
                alt="薄弱训练"
                className="object-contain drop-shadow-lg"
                style={{ height: '96px', width: 'auto' }}
              />
            </div>

            {/* Text – absolutely centered in button */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <div className="text-white" style={{ fontWeight: 900, fontStyle: 'italic', fontSize: '22px', lineHeight: 1.2 }}>
                  一键薄弱专项训练
                </div>
                <div className="text-blue-100 mt-0.5" style={{ fontSize: '12px' }}>
                  AI智能诊断薄弱点，精准提升成绩
                </div>
              </div>
            </div>

            {/* Arrow – absolute right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md pointer-events-none">
                <ChevronRight size={20} className="text-blue-500" />
              </div>
            </div>
          </button>

          {/* ── Subject Cards ── */}
          <div>
            <h3 className="text-gray-700 mb-2.5 px-0.5" style={{ fontWeight: 700, fontSize: '15px' }}>
              选择科目开始练习
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSubjects.map(subject => {
                const cfg = SUBJECT_CONFIG[subject.id];
                if (!cfg) return null;
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/legacy/subject/${subject.id}`)}
                    className={`${cfg.bg} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border ${cfg.cardBorder} text-left flex flex-col`}
                  >
                    {/* Illustration – scale to max without cropping */}
                    <div className="flex-1 flex items-center justify-center p-3 pt-4">
                      <ImageWithFallback
                        src={cfg.imgUrl}
                        alt={subject.name}
                        className="w-full h-full max-h-28 object-contain"
                      />
                    </div>

                    {/* Bottom section */}
                    <div className="p-2.5 flex items-end justify-between">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }} className="text-gray-800">
                          {subject.name}
                        </div>
                        <div style={{ fontSize: '11px' }} className="text-gray-500 mt-0.5">
                          {cfg.desc}
                        </div>
                      </div>
                      <div className={`w-7 h-7 ${cfg.btnBg} rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ml-2`}>
                        <ChevronRight size={14} className="text-white" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spacing at bottom for nav */}
          <div className="h-1" />
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNav />
    </div>
  );
}