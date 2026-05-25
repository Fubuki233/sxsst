import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { getAllChapters, getAllQuestions, getSubjectsByGrade } from '../utils/questions';
import {
  Bell, Camera, ChevronRight, ClipboardList, Crown, Edit3, Flame, Gem, Gift, Save, Settings, Shirt, Sparkles, Star, Trophy, User, X
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { GithubLegacyBottomNav } from './GithubLegacyBottomNav';
import { publicAsset } from '../utils/assets';

// ── Dynamic import: all PNG icons from imports folder ──
const iconModules = import.meta.glob('../../imports/*.png', { eager: true, import: 'default' }) as Record<string, string>;

function getIcon(name: string): string {
  for (const [path, url] of Object.entries(iconModules)) {
    if (path.includes(name)) return url;
  }
  return '';
}

const PUBLIC_ASSET = publicAsset('assets/');

// ── Subject config: use custom PNG icons ──
const SUBJECT_CONFIG: Record<string, {
  bg: string;
  imgUrl: string;
  bannerUrl: string;
  desc: string;
  textbook: string;
  lesson: string;
  btnBg: string;
  cardBorder: string;
  progress: string;
}> = {
  math: {
    bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
    imgUrl: getIcon('数学'),
    bannerUrl: `${PUBLIC_ASSET}math_banner.png`,
    desc: '数与逻辑的世界',
    textbook: '苏教版',
    lesson: '整理与复习：整数除法',
    btnBg: 'bg-blue-500',
    cardBorder: 'border-blue-100',
    progress: 'bg-blue-500',
  },
  english: {
    bg: 'bg-gradient-to-br from-green-100 to-green-50',
    imgUrl: getIcon('英语'),
    bannerUrl: `${PUBLIC_ASSET}eng_banner.png`,
    desc: '探索语言的乐趣',
    textbook: '苏教版',
    lesson: 'Unit 1 知识综合复习',
    btnBg: 'bg-green-500',
    cardBorder: 'border-green-100',
    progress: 'bg-green-500',
  },
  physics: {
    bg: 'bg-gradient-to-br from-purple-100 to-purple-50',
    imgUrl: getIcon('物理'),
    bannerUrl: `${PUBLIC_ASSET}phy_banner.png`,
    desc: '发现物理的奥秘',
    textbook: '苏教版',
    lesson: '力与运动入门',
    btnBg: 'bg-purple-500',
    cardBorder: 'border-purple-100',
    progress: 'bg-purple-500',
  },
  chemistry: {
    bg: 'bg-gradient-to-br from-amber-100 to-amber-50',
    imgUrl: getIcon('化学'),
    bannerUrl: `${PUBLIC_ASSET}chem_banner.png`,
    desc: '探索物质的变化',
    textbook: '苏教版',
    lesson: '物质变化入门',
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
const LANDSCAPE_BG = publicAsset('assets/横屏底图.png');
const PORTRAIT_BG = publicAsset('assets/竖屏底图.png');

const statCards = [
  { key: 'today', label: '今日做题', icon: '今日做题', color: 'text-blue-600', bg: 'bg-blue-50', unit: '题' },
  { key: 'accuracy', label: '整体正确率', icon: '正确率', color: 'text-emerald-600', bg: 'bg-emerald-50', unit: '%' },
  { key: 'weak', label: '薄弱知识点', icon: '薄弱知识点', color: 'text-rose-600', bg: 'bg-rose-50', unit: '个' },
] as const;

function getEncouragement(accuracy: number, answerCount: number) {
  if (answerCount === 0) return '今天从第一题开始';
  if (accuracy >= 90) return '状态很棒';
  if (accuracy >= 80) return '继续冲满分';
  if (accuracy >= 60) return '稳步进步中';
  return '先巩固薄弱点';
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

function getLowerGradeDayTabs() {
  const today = new Date();
  return [-1, 0, 1, 2, 3, 4].map(offset => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' });
    return {
      label: offset === 0 ? '今日' : weekday,
      day: date.getDate(),
      active: offset === 0,
    };
  });
}

export default function GithubLegacyDashboard() {
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
  const encouragement = getEncouragement(overallAccuracy, allAnswers.length);
  const statValues = {
    today: todayCount,
    accuracy: overallAccuracy,
    weak: weakCount,
  };
  const isLowerGradeStudent = user.grade < 4;
  const lowerGradeDayTabs = getLowerGradeDayTabs();

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
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{
        background: isLowerGradeStudent
          ? 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 46%, #8BE2F2 100%)'
          : '#EEF4FF',
      }}
    >
      {isLowerGradeStudent ? (
        <>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />
          <div className="absolute -top-16 -right-20 h-48 w-96 rotate-[-18deg] rounded-full bg-white/10 blur-sm" />
          <div className="absolute bottom-4 right-8 h-28 w-28 rotate-45 rounded-[28px] border border-white/20" />
        </>
      ) : (
        <>
          <picture className="absolute inset-0 pointer-events-none">
            <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
            <img src={PORTRAIT_BG} alt="" className="w-full h-full object-cover" />
          </picture>
          <div className="absolute inset-0 pointer-events-none bg-white/15" />
        </>
      )}

      {isLowerGradeStudent ? (
        <header className="relative z-10 px-3 md:px-8 pt-2 md:pt-4 pb-1 md:pb-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={openProfileEditor}
              className="h-11 w-11 md:h-14 md:w-14 rounded-full bg-white/78 p-1 md:p-1.5 shadow-lg ring-2 ring-white/90 transition-all hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <div className="h-full w-full rounded-full bg-gradient-to-br from-sky-200 to-blue-500 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-8 md:h-10 items-center gap-1.5 rounded-full bg-blue-800/35 px-2 md:px-3 text-white shadow-sm ring-1 ring-white/18">
                <Star size={16} className="text-yellow-300" style={{ fill: 'currentColor' }} />
                <span style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', fontWeight: 900 }}>{gradeLabel}</span>
              </div>
              <div className="flex h-8 md:h-10 items-center gap-1.5 md:gap-2 rounded-full bg-blue-800/28 px-2 md:px-3 text-white shadow-sm ring-1 ring-white/18">
                <Flame size={16} className="text-sky-100" />
                <span style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', fontWeight: 900 }}>{todayCount}</span>
              </div>
              <div className="flex h-8 md:h-10 items-center gap-1.5 md:gap-2 rounded-full bg-blue-800/28 px-2 md:px-3 text-white shadow-sm ring-1 ring-white/18">
                <Gem size={16} className="text-slate-100" />
                <span style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', fontWeight: 900 }}>{badgeCount}</span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-7 gap-1 lg:w-auto lg:flex lg:items-center lg:gap-2 lg:overflow-x-auto lg:pb-0">
            {[
              { label: '会员', icon: Crown, action: () => navigate('/profile') },
              { label: '学习榜', icon: Trophy, action: () => navigate('/knowledge-map') },
              { label: '任务', icon: ClipboardList, action: () => navigate('/weakness') },
              { label: '兑换', icon: Gift, action: () => navigate('/wrong-questions') },
              { label: '形象', icon: Shirt, action: openProfileEditor },
              { label: '我的', icon: User, action: () => navigate('/profile') },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full min-w-0 lg:w-[74px] flex-shrink-0 rounded-xl md:rounded-2xl bg-blue-900/24 px-1 py-1.5 md:px-2 md:py-2 text-white shadow-sm ring-1 ring-white/14 transition-all hover:bg-blue-900/32 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Icon className="mx-auto h-5 w-5 md:h-6 md:w-6 text-white" />
                  <span className="mt-0.5 block truncate leading-none" style={{ fontSize: 'clamp(10px, 2.7vw, 13px)', fontWeight: 900 }}>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => navigate('/settings')}
              className="w-full min-w-0 lg:w-[74px] flex-shrink-0 rounded-xl md:rounded-2xl bg-violet-500/44 px-1 py-1.5 md:px-2 md:py-2 text-white shadow-sm ring-1 ring-white/14 transition-all hover:bg-violet-500/56 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Settings className="mx-auto h-5 w-5 md:h-6 md:w-6 text-yellow-200" />
              <span className="mt-0.5 block truncate leading-none" style={{ fontSize: 'clamp(10px, 2.7vw, 13px)', fontWeight: 900 }}>设置</span>
            </button>
          </div>
        </header>
      ) : (
        <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={openProfileEditor}
            className="flex items-center gap-3 text-left min-w-0 rounded-2xl px-2 py-1.5 -ml-2 transition-all hover:bg-white/55 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md ring-2 ring-white/80 overflow-hidden">
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
            <div className="min-w-0 max-w-[54vw] md:max-w-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="truncate text-slate-800" style={{ fontWeight: 800, fontSize: '17px', lineHeight: 1.15 }}>{displayName}同学</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full"
                  style={{ fontSize: '11px', fontWeight: 600 }}>{gradeLabel}</span>
                <Edit3 size={13} className="text-gray-400" />
              </div>
              <p className="text-slate-500 truncate mt-1" style={{ fontSize: '12px', lineHeight: 1.35 }}>
                {encouragement}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl px-3 py-2 border border-yellow-200 min-w-[126px] shadow-sm">
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
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/55 shadow-sm hover:bg-white/80 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-blue-400">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
                style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>3</span>
            </button>
          </div>
        </header>
      )}

      {/* ── Scrollable Body ── */}
      <div className="relative z-10 flex-1 overflow-auto">
        <div className={`${isLowerGradeStudent ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-3 md:px-6 pt-1.5 md:pt-3 pb-3 md:pb-4 space-y-2.5 md:space-y-5`}>

          {isLowerGradeStudent ? (
            <>
              <section
                className="relative overflow-hidden rounded-[26px] md:rounded-[34px] border-2 border-cyan-100/90 p-1.5 md:p-3"
                style={{
                  background: 'linear-gradient(180deg, rgba(72, 157, 255, 0.78) 0%, rgba(60, 186, 238, 0.58) 100%)',
                  boxShadow: '0 0 0 5px rgba(185, 244, 255, 0.26), 0 20px 44px rgba(9, 73, 142, 0.22), inset 0 2px 0 rgba(255,255,255,0.46)',
                }}
              >
                <div className="grid grid-cols-6 rounded-[20px] md:rounded-[24px] overflow-hidden border border-cyan-100/70 bg-blue-700/20">
                  {lowerGradeDayTabs.map(tab => (
                    <button
                      key={`${tab.label}-${tab.day}`}
                      className={`min-h-[48px] md:min-h-[86px] px-1 md:px-2 py-1.5 md:py-2 transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                        tab.active
                          ? 'bg-gradient-to-b from-cyan-200/88 to-blue-400/78 text-white shadow-[0_0_18px_rgba(125,211,252,0.55)]'
                          : 'text-white/82 hover:bg-white/10'
                      }`}
                    >
                      <span className="block" style={{ fontSize: tab.active ? 'clamp(17px, 4.8vw, 25px)' : 'clamp(12px, 3.5vw, 19px)', fontWeight: 900, lineHeight: 1.1 }}>{tab.label}</span>
                      <span className="mt-0.5 md:mt-1 block" style={{ fontSize: 'clamp(12px, 3.4vw, 18px)', fontWeight: 800, opacity: tab.active ? 0.92 : 0.76 }}>{tab.day}</span>
                    </button>
                  ))}
                </div>

                <div
                  className="relative mt-2 md:mt-3 rounded-[24px] md:rounded-[30px] border-2 border-cyan-100/80 p-2 md:p-5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(191, 247, 255, 0.62) 0%, rgba(160, 235, 248, 0.42) 100%)',
                    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55)',
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {availableSubjects.map(subject => {
                      const cfg = SUBJECT_CONFIG[subject.id];
                      if (!cfg) return null;
                      const progress = getSubjectProgress(subject.id);
                      const firstChapterId = getAllChapters()[subject.id]?.[0]?.id;
                      const lessonPath = firstChapterId ? `/lesson/chapter/${subject.id}/${firstChapterId}` : `/subject/${subject.id}`;

                      return (
                        <article
                          key={subject.id}
                          className="rounded-[24px] bg-white/94 p-3.5 shadow-lg border-2 border-white min-h-[328px] flex flex-col"
                          style={{ boxShadow: '0 9px 0 rgba(14, 116, 144, 0.12), 0 16px 26px rgba(37, 99, 235, 0.14)' }}
                        >
                          <div className="text-slate-900 truncate" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.15 }}>
                            {subject.name} | {cfg.textbook}
                          </div>

                          <button
                            onClick={() => navigate(lessonPath)}
                            className="mt-3 block rounded-[18px] bg-sky-50 border-2 border-sky-100 overflow-hidden focus-visible:outline-2 focus-visible:outline-sky-400"
                          >
                            <ImageWithFallback
                              src={cfg.bannerUrl}
                              alt={subject.name}
                              className="w-full aspect-[16/9] object-cover"
                            />
                          </button>

                          <div className="mt-3 min-h-[52px] text-slate-800" style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1.25 }}>
                            {cfg.lesson}
                          </div>

                          <div className="mt-auto">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>进度 {progress}%</span>
                              <span className="flex items-center gap-0.5">
                                {Array.from({ length: 3 }).map((_, starIndex) => {
                                  const filled = Math.ceil(progress / 34) > starIndex;
                                  return (
                                    <Star
                                      key={starIndex}
                                      size={14}
                                      className={filled ? 'text-amber-400' : 'text-slate-300'}
                                      style={{ fill: filled ? 'currentColor' : 'none' }}
                                    />
                                  );
                                })}
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(lessonPath)}
                              className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-amber-300"
                              style={{
                                background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)',
                                boxShadow: '0 6px 0 rgba(194, 91, 0, 0.28), inset 0 2px 0 rgba(255,255,255,0.52)',
                                textShadow: '0 1px 0 rgba(154, 52, 18, 0.22)',
                              }}
                            >
                              <span style={{ fontSize: '22px', fontWeight: 900 }}>去学习</span>
                              <span className="flex items-center gap-1 text-white/95" style={{ fontSize: '18px', fontWeight: 900 }}>
                                +10 <Trophy size={20} />
                              </span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div className="mx-auto flex w-full max-w-xl items-center justify-around rounded-[26px] bg-white/46 px-4 py-2 shadow-lg ring-1 ring-white/55 backdrop-blur">
                {[
                  { label: '学习计划', icon: ClipboardList, action: () => navigate('/dashboard'), active: true },
                  { label: '同步学习', icon: Gem, action: () => navigate('/knowledge-map'), active: false },
                  { label: '专项提升', icon: Flame, action: () => navigate('/weakness'), active: false },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-white ${
                        item.active ? 'text-blue-700' : 'text-slate-500 hover:bg-white/35'
                      }`}
                    >
                      <Icon size={24} className={item.active ? 'text-orange-400' : 'text-sky-500'} />
                      <span className="truncate" style={{ fontSize: '15px', fontWeight: 900 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div
                className="relative overflow-hidden rounded-[28px] px-3.5 py-4 md:px-5 md:py-5 border border-white/85"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.94) 52%, rgba(236,253,245,0.84) 100%)',
                  boxShadow: '0 14px 34px rgba(65, 98, 165, 0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 md:gap-4">
                  <div className="grid grid-cols-3 gap-0 flex-1 rounded-2xl bg-white/65 border border-white/85 overflow-hidden">
                    {statCards.map((stat, index) => (
                      <div key={stat.key} className={`px-2.5 py-3 md:px-4 md:py-3.5 min-w-0 ${index > 0 ? 'border-l border-white/90' : ''}`}>
                        <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3">
                          <img src={getIcon(stat.icon)} alt={stat.label} className="w-8 h-8 md:w-10 md:h-10 object-contain flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-slate-500 truncate" style={{ fontSize: '11px', fontWeight: 800 }}>{stat.label}</span>
                            <span className={`${stat.color} block whitespace-nowrap`} style={{ fontWeight: 900, fontSize: 'clamp(18px, 5vw, 24px)', lineHeight: 1.05 }}>
                              {statValues[stat.key]}<span style={{ fontSize: '12px', fontWeight: 800 }} className="ml-0.5">{stat.unit}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/weakness')}
                    className="relative overflow-hidden rounded-2xl px-4 py-3 lg:w-[190px] text-left text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-indigo-400"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 54%, #22C55E 100%)',
                      boxShadow: '0 12px 20px rgba(79, 70, 229, 0.22), inset 0 1px 0 rgba(255,255,255,0.42)',
                    }}
                  >
                    <div className="absolute -right-5 -bottom-6 w-24 h-24 rounded-full bg-white/16" />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div style={{ fontWeight: 900, fontSize: '16px', lineHeight: 1.15 }}>薄弱训练</div>
                        <div className="mt-1 text-white/82" style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>先测评再刷题</div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/24 flex items-center justify-center flex-shrink-0">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ── Subject Cards ── */}
              <div
                className="relative rounded-[28px] bg-white/82 border border-white/85 shadow-sm p-3.5 md:p-5"
                style={{ boxShadow: '0 10px 24px rgba(65, 98, 165, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}
              >
                <div className="mb-3 md:mb-4 flex items-center justify-end gap-3">
                  <div className="hidden sm:flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100">
                    <Trophy size={15} className="text-amber-500" />
                    <span className="text-amber-600" style={{ fontSize: '12px', fontWeight: 900 }}>{badgeCount}/{BADGE_GOAL}枚勋章</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
                  {availableSubjects.map(subject => {
                    const cfg = SUBJECT_CONFIG[subject.id];
                    if (!cfg) return null;
                    const progress = getSubjectProgress(subject.id);
                    return (
                      <button
                        key={subject.id}
                        onClick={() => navigate(`/subject/${subject.id}`)}
                        className={`${cfg.bg} rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.98] transition-all border ${cfg.cardBorder} text-left flex flex-col min-h-[178px] focus-visible:outline-2 focus-visible:outline-blue-400`}
                      >
                        {/* Illustration – scale to max without cropping */}
                        <div className="flex-1 min-h-[82px] flex items-center justify-center p-3 pt-4">
                          <ImageWithFallback
                            src={cfg.imgUrl}
                            alt={subject.name}
                            className="w-full h-full max-h-24 object-contain"
                          />
                        </div>

                        {/* Bottom section */}
                        <div className="p-3 pt-2.5 bg-white/36">
                          <div className="flex items-end justify-between">
                            <div className="min-w-0">
                              <div style={{ fontWeight: 700, fontSize: '15px' }} className="text-gray-800">
                                {subject.name}
                              </div>
                              <div style={{ fontSize: '11px' }} className="text-gray-500 mt-0.5 truncate">
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
                            <div className="h-2 bg-white/75 rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full rounded-full ${cfg.progress}`} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Spacing at bottom for nav */}
          <div className="h-1" />
        </div>
      </div>

      {!isLowerGradeStudent && (
        <div className="relative z-10 flex-shrink-0">
          <GithubLegacyBottomNav />
        </div>
      )}

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
