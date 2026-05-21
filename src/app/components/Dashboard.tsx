import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { getAllChapters, getAllQuestions, getSubjectsByGrade } from '../utils/questions';
import {
  Bell, Camera, ChevronRight, Edit3, Save, Sparkles, Star, Trophy, User, X
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
  progress: string;
}> = {
  math: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
    imgUrl: getIcon('数学'),
    desc: '数与逻辑的世界',
    btnBg: 'bg-blue-500',
    cardBorder: 'border-blue-100',
    progress: 'bg-blue-500',
  },
  english: {
    bg: 'bg-gradient-to-br from-green-100 to-green-50',
    imgUrl: getIcon('英语'),
    desc: '探索语言的乐趣',
    btnBg: 'bg-green-500',
    cardBorder: 'border-green-100',
    progress: 'bg-green-500',
  },
  physics: {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-50',
    imgUrl: getIcon('物理'),
    desc: '发现物理的奥秘',
    btnBg: 'bg-purple-500',
    cardBorder: 'border-purple-100',
    progress: 'bg-purple-500',
  },
  chemistry: {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-50',
    imgUrl: getIcon('化学'),
    desc: '探索物质的变化',
    btnBg: 'bg-amber-500',
    cardBorder: 'border-amber-100',
    progress: 'bg-amber-500',
  },
};

const GRADE_CHINESE: Record<number, string> = {
  1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级',
  7: '初一', 8: '初二', 9: '初三',
};

const ALL_GRADES = [
  { value: 1, label: '小学一年级' },
  { value: 2, label: '小学二年级' },
  { value: 3, label: '小学三年级' },
  { value: 4, label: '小学四年级' },
  { value: 5, label: '小学五年级' },
  { value: 6, label: '小学六年级' },
  { value: 7, label: '初中一年级' },
  { value: 8, label: '初中二年级' },
  { value: 9, label: '初中三年级' },
];

const BADGE_GOAL = 10;
const LANDSCAPE_BG = '/assets/横屏底图.png';
const PORTRAIT_BG = '/assets/竖屏底图.png';
const SUBJECT_RIBBON = '/assets/选择科目开始练习.png';

function getEncouragement(accuracy: number, answerCount: number, name: string) {
  if (answerCount === 0) return `${name}，今天从第一题开始，慢慢进入状态吧！`;
  if (accuracy >= 90) return `${name}，状态很棒，继续保持高准确率！`;
  if (accuracy >= 80) return `${name}，掌握得很扎实，再冲一冲满分！`;
  if (accuracy >= 60) return `${name}，已经在进步了，把易错点再巩固一下。`;
  return `${name}，别着急，先抓住薄弱点，一题一题稳住。`;
}

function getSubjectProgress(subjectId: string) {
  const chapters = getAllChapters()[subjectId] || [];
  const knowledgePoints = new Set(chapters.flatMap(chapter => chapter.knowledgePoints));
  if (knowledgePoints.size === 0) return 0;

  const questionSubjectMap = new Map(getAllQuestions().map(question => [question.id, question.subject]));
  const completed = new Set<string>();

  storage.getAnswers().forEach(answer => {
    const subject = questionSubjectMap.get(answer.questionId);
    if (subject === subjectId || (!subject && knowledgePoints.has(answer.knowledgePoint))) {
      completed.add(answer.knowledgePoint);
    }
  });

  return Math.min(100, Math.round((completed.size / knowledgePoints.size) * 100));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [todayCount, setTodayCount] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [weakCount, setWeakCount] = useState(0);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileGrade, setProfileGrade] = useState(1);
  const [profileAvatar, setProfileAvatar] = useState('');
  const [showAssessmentGuide, setShowAssessmentGuide] = useState(false);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    setAvailableSubjects(getSubjectsByGrade(currentUser.grade));
    setShowAssessmentGuide(localStorage.getItem(`assessment_guide_seen_${currentUser.username}`) !== '1');

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
  const displayName = user.displayName?.trim() || user.username;
  const allAnswers = storage.getAnswers();
  const correctCount = allAnswers.filter(a => a.isCorrect).length;
  const badgeCount = Math.min(BADGE_GOAL, Math.floor(correctCount / 5));
  const badgeProgress = Math.round((badgeCount / BADGE_GOAL) * 100);
  const encouragement = getEncouragement(overallAccuracy, allAnswers.length, displayName);

  const openProfileEditor = () => {
    setProfileName(displayName);
    setProfileGrade(user.grade);
    setProfileAvatar(user.avatarUrl || '');
    setIsProfileOpen(true);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileAvatar(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const ok = storage.updateProfile(user.username, {
      displayName: profileName,
      grade: profileGrade,
      avatarUrl: profileAvatar,
    });
    if (!ok) return;

    const updatedUser = storage.getCurrentUser();
    setUser(updatedUser);
    window.dispatchEvent(new Event('profile-updated'));
    setAvailableSubjects(getSubjectsByGrade(profileGrade));
    setIsProfileOpen(false);
  };

  const closeAssessmentGuide = () => {
    localStorage.setItem(`assessment_guide_seen_${user.username}`, '1');
    setShowAssessmentGuide(false);
  };

  const startAssessment = () => {
    closeAssessmentGuide();
    navigate('/weakness');
  };

  return (
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: '#EEF4FF' }}>
      <picture className="absolute inset-0 pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/10" />

      {/* ── Header: avatar + grade + badges + bell, no white bg ── */}
      <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
        {/* Avatar + Name + Grade */}
        <button onClick={openProfileEditor} className="flex items-center gap-3 text-left min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={22} className="text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star size={9} className="text-white" style={{ fill: 'white' }} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="truncate" style={{ fontWeight: 700, fontSize: '16px' }}>{displayName}同学</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full"
                style={{ fontSize: '11px', fontWeight: 600 }}>{gradeLabel}</span>
              <Edit3 size={13} className="text-gray-400" />
            </div>
            <p className="text-gray-500" style={{ fontSize: '12px' }}>
              {encouragement}
            </p>
          </div>
        </button>

        {/* Right: badges + bell */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl px-3 py-2 border border-yellow-200 min-w-[124px]">
            <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center">
              <Trophy size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-end justify-between gap-2">
                <span className="text-amber-500" style={{ fontSize: '10px' }}>勋章</span>
                <span className="text-amber-600" style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1 }}>
                  {badgeCount}<span style={{ fontWeight: 500, fontSize: '10px' }} className="text-amber-500 ml-0.5">枚</span>
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${badgeProgress}%` }} />
              </div>
              <div className="text-amber-500 mt-0.5 whitespace-nowrap" style={{ fontSize: '9px' }}>
                已获得{badgeCount}/{BADGE_GOAL}枚
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
      <div className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-3 space-y-5 md:space-y-6">

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
            onClick={() => navigate('/weakness')}
            className="w-full rounded-[24px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative flex items-center justify-center border border-white/70"
            style={{
              background: 'linear-gradient(180deg, #8FB5FF 0%, #6F8EF4 48%, #6564E7 100%)',
              boxShadow: '0 12px 22px rgba(83, 102, 214, 0.28), inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -5px 0 rgba(60, 53, 204, 0.18)',
              minHeight: '118px',
            }}
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.42),transparent_18%),radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.24),transparent_18%)]" />

            <div
              className="absolute top-0 bottom-0 left-0 flex items-center justify-center pointer-events-none"
              style={{ width: '30%' }}
            >
              <img
                src={getIcon('一键薄弱训练')}
                alt="薄弱训练"
                className="object-contain drop-shadow-xl"
                style={{ height: 'clamp(104px, 30vw, 124px)', width: 'auto', transform: 'translateX(4px)' }}
              />
            </div>

            <div
              className="absolute inset-y-0 left-[29%] right-[72px] md:left-[30%] md:right-[86px] flex items-center justify-center pointer-events-none"
            >
              <div className="text-center">
                <div className="text-white drop-shadow-sm whitespace-nowrap" style={{ fontWeight: 900, fontSize: 'clamp(20px, 5vw, 26px)', lineHeight: 1.15, letterSpacing: 0 }}>
                  先测评，再刷题！
                </div>
                <div className="text-blue-50 mt-2" style={{ fontSize: 'clamp(12px, 3.3vw, 14px)', lineHeight: 1.25, fontWeight: 600 }}>
                  AI帮你找薄弱点，少做无用功
                </div>
              </div>
            </div>

            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #FFF2A9 0%, #FFD45E 100%)',
                  boxShadow: '0 5px 10px rgba(75, 55, 146, 0.28), inset 0 2px 0 rgba(255,255,255,0.9)',
                }}
              >
                <span className="text-orange-500" style={{ fontSize: 'clamp(18px, 4.5vw, 21px)', fontWeight: 900, lineHeight: 1 }}>GO</span>
              </div>
            </div>
          </button>

          {/* ── Subject Cards ── */}
          <div
            className="relative rounded-[28px] bg-white/75 border border-white/80 shadow-sm px-3.5 pb-4 pt-11 md:px-4 md:pb-5 md:pt-12"
            style={{ boxShadow: '0 10px 24px rgba(65, 98, 165, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}
          >
            <div className="absolute left-3 top-2 md:left-4 md:top-2.5">
              <div
                className="w-[198px] md:w-[224px] h-9 md:h-10 flex items-center justify-center"
                style={{
                  backgroundImage: `url("${SUBJECT_RIBBON}")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'contain',
                }}
              >
                <h3
                  className="text-white text-center drop-shadow-sm"
                  style={{
                    fontWeight: 900,
                    fontSize: '16px',
                    lineHeight: 1.1,
                    letterSpacing: 0,
                    WebkitTextStroke: '0.6px rgba(0,0,0,0.7)',
                    textShadow: '0 1px 0 rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  选择科目开始练习
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableSubjects.map(subject => {
                const cfg = SUBJECT_CONFIG[subject.id];
                if (!cfg) return null;
                const progress = getSubjectProgress(subject.id);
                return (
                  <button
                    key={subject.id}
                    onClick={() => navigate(`/subject/${subject.id}`)}
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
                    <div className="p-3 pt-2.5">
                      <div className="flex items-end justify-between">
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
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500" style={{ fontSize: '10px', fontWeight: 600 }}>学习进度</span>
                          <span className="text-gray-700" style={{ fontSize: '10px', fontWeight: 700 }}>已完成{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.progress}`} style={{ width: `${progress}%` }} />
                        </div>
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
      <div className="relative z-10 flex-shrink-0">
        <BottomNav />
      </div>

      {showAssessmentGuide && (
        <>
          <div className="fixed inset-0 z-50 bg-black/45" onClick={closeAssessmentGuide} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl pointer-events-auto overflow-hidden">
              <div className="px-6 pt-6 pb-5 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sparkles size={28} className="text-orange-500" />
                </div>
                <div className="mt-4 text-gray-900" style={{ fontSize: '21px', fontWeight: 900 }}>
                  先测评再刷题
                </div>
                <p className="mt-2 text-gray-600" style={{ fontSize: '14px', lineHeight: 1.7 }}>
                  先做一次AI测评，系统帮你找出薄弱点，针对性刷题，效率更高。
                </p>
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={closeAssessmentGuide} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600" style={{ fontWeight: 700 }}>
                  稍后再说
                </button>
                <button onClick={startAssessment} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25" style={{ fontWeight: 800 }}>
                  开始测评
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isProfileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsProfileOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl pointer-events-auto overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="text-gray-800" style={{ fontWeight: 800, fontSize: '17px' }}>编辑学生资料</div>
                <button onClick={() => setIsProfileOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="flex justify-center">
                  <label className="relative cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden shadow-md">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="自定义头像" className="w-full h-full object-cover" />
                      ) : (
                        <User size={34} className="text-white" />
                      )}
                    </div>
                    <span className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-md">
                      <Camera size={15} className="text-white" />
                    </span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-gray-600 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>学生姓名</span>
                  <input
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400"
                    placeholder="请输入学生姓名"
                  />
                </label>

                <label className="block">
                  <span className="block text-gray-600 mb-1.5" style={{ fontSize: '13px', fontWeight: 600 }}>年级</span>
                  <select
                    value={profileGrade}
                    onChange={e => setProfileGrade(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-blue-400 bg-white"
                  >
                    {ALL_GRADES.map(grade => (
                      <option key={grade.value} value={grade.value}>{grade.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={() => setIsProfileOpen(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600" style={{ fontWeight: 700 }}>
                  取消
                </button>
                <button onClick={handleSaveProfile} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white flex items-center justify-center gap-2" style={{ fontWeight: 700 }}>
                  <Save size={17} />
                  保存
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
