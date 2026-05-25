import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { getAllChapters, getAllQuestions, getSubjectsByGrade } from '../utils/questions';
import {
  Camera, ChevronRight, ClipboardList, Crown, Gem, Gift, Play, Save, Settings, Shirt, Sparkles, Trophy, User, X
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BottomNav } from './BottomNav';
import { publicAsset } from '../utils/assets';
import { SvgAppIcon, type SvgAppIconName } from './SvgAppIcon';

const PUBLIC_ASSET = publicAsset('assets/');
const SENIOR_ASSET = publicAsset('assets/senior-game/');
const SENIOR_ASSET_VERSION = '?v=senior-svg-6-20260522';

// ── Subject config: use SVG icons ──
const SUBJECT_CONFIG: Record<string, {
  bg: string;
  svgIcon: SvgAppIconName;
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
    svgIcon: 'math',
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
    svgIcon: 'english',
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
    svgIcon: 'physics',
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
    svgIcon: 'chemistry',
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

const seniorSubjectArt: Record<string, { images: string[]; bg: string; accent: string }> = {
  math: {
    images: [
      `${SENIOR_ASSET}math-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#A889F3',
    accent: '#CBB8FF',
  },
  english: {
    images: [
      `${SENIOR_ASSET}english-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#87EBCF',
    accent: '#BDF8EA',
  },
  physics: {
    images: [
      `${SENIOR_ASSET}physics-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#ED8F88',
    accent: '#FFC7C2',
  },
  chemistry: {
    images: [
      `${SENIOR_ASSET}chemistry-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#FFAF18',
    accent: '#FFD986',
  },
};

const seniorCategoryFallback = [
  { id: 'math', label: 'Math', svgIcon: 'math' as SvgAppIconName, color: '#A98BFF', path: '/subject/math' },
  { id: 'physics', label: 'Physics', svgIcon: 'physics' as SvgAppIconName, color: '#63E7CB', path: '/subject/physics' },
  { id: 'english', label: 'Grammar', svgIcon: 'english' as SvgAppIconName, color: '#EF8A84', path: '/subject/english' },
  { id: 'chemistry', label: 'Science', svgIcon: 'chemistry' as SvgAppIconName, color: '#F4B12E', path: '/subject/chemistry' },
] as const;

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomShuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildSeniorCourseCards(subjects: { id: string; name: string }[], count: number, titleSuffix: string) {
  const courses = subjects.flatMap(subject => {
    const art = seniorSubjectArt[subject.id] || seniorSubjectArt.math;
    return (getAllChapters()[subject.id] || []).map(chapter => ({
      key: `${subject.id}-${chapter.id}`,
      title: `${subject.name}\n${chapter.name}${titleSuffix}`,
      image: randomItem(art.images),
      bg: art.bg,
      accent: art.accent,
      diamonds: Math.floor(Math.random() * 5) + 1,
      path: `/practice/${subject.id}/${chapter.id}`,
    }));
  });

  const fallback = subjects.map(subject => {
    const art = seniorSubjectArt[subject.id] || seniorSubjectArt.math;
    return {
      key: subject.id,
      title: `${subject.name}\n专项${titleSuffix}`,
      image: randomItem(art.images),
      bg: art.bg,
      accent: art.accent,
      diamonds: Math.floor(Math.random() * 5) + 1,
      path: `/subject/${subject.id}`,
    };
  });

  const pool = courses.length ? courses : fallback;
  const picked = randomShuffle(pool).slice(0, Math.min(count, pool.length));
  while (picked.length < count && pool.length > 0) {
    picked.push(pool[picked.length % pool.length]);
  }
  return picked;
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

function buildSeniorGreeting(name: string, subjects: { id: string; name: string }[]) {
  const subject = randomItem(subjects)?.name || '练习';
  const target = randomItem((subjects || []).flatMap(subjectItem => (
    getAllChapters()[subjectItem.id] || []
  )))?.name || '目标';

  return randomItem([
    `${name}，该练习${subject}了`,
    `${name}，花 5 分钟保持连续记录`,
    `${name}，距离${target}只差一节课`,
    `${name}，不要失去连续记录`,
    `${name}，让我们回到学习节奏`,
    `${name}，明天继续保持`,
    `${name}，建立每日学习习惯`,
  ]);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(storage.getCurrentUser());
  const [todayCount, setTodayCount] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
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

  }, [navigate]);

  const seniorSubjects = user
    ? (availableSubjects.length ? availableSubjects : getSubjectsByGrade(user.grade))
    : [];
  const seniorRecentCards = useMemo(
    () => buildSeniorCourseCards(seniorSubjects, 3, '闯关'),
    [seniorSubjects]
  );
  const seniorNewCards = useMemo(
    () => buildSeniorCourseCards(seniorSubjects, 4, '挑战'),
    [seniorSubjects]
  );
  const seniorGreeting = useMemo(() => {
    const name = user?.displayName?.trim() || user?.username || '同学';
    return buildSeniorGreeting(name, seniorSubjects);
  }, [seniorSubjects, user?.displayName, user?.username]);

  if (!user) return null;

  const gradeLabel = GRADE_CHINESE[user.grade] || `${user.grade}年级`;
  const displayName = user.displayName?.trim() || user.username;
  const allAnswers = storage.getAnswers();
  const correctCount = allAnswers.filter(a => a.isCorrect).length;
  const badgeCount = Math.min(BADGE_GOAL, Math.floor(correctCount / 5));
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
          : 'var(--senior-page-bg, #2B2B2E)',
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
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#4E4248]/85 to-transparent" />
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
              <div className="flex h-8 md:h-10 items-center gap-1.5 md:gap-2 rounded-full bg-blue-800/28 px-2 md:px-3 text-white shadow-sm ring-1 ring-white/18">
                <SvgAppIcon name="flame" size={16} className="text-sky-100" />
                <span style={{ fontSize: 'clamp(14px, 3.8vw, 18px)', fontWeight: 900 }}>{todayCount}</span>
              </div>
              <div className="flex h-8 md:h-10 items-center gap-1.5 md:gap-2 rounded-full bg-blue-800/28 px-2 md:px-3 text-white shadow-sm ring-1 ring-white/18">
                <SvgAppIcon name="gem" size={16} className="text-slate-100" />
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
        <header className="relative z-10 mx-auto w-full max-w-[480px] px-5 pt-7 pb-2 flex-shrink-0 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="whitespace-pre-line text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '31px', fontWeight: 900, lineHeight: 1.08, letterSpacing: 0 }}>
                {seniorGreeting}
              </h1>
            </div>
            <div className="mt-8 flex items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="flex h-12 items-center gap-2 rounded-full bg-white/18 px-4 text-white shadow-sm transition-all hover:bg-white/24 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
              >
                <Gem size={26} className="text-white" style={{ fill: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '19px', fontWeight: 900 }}>{Math.max(22, badgeCount * 10 || 22)}</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white transition-all hover:bg-white/18 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                aria-label="设置"
              >
                <Settings size={22} />
              </button>
            </div>
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
                          <div className="flex items-center gap-2 text-slate-900">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                              <SvgAppIcon name={cfg.svgIcon} size={23} strokeWidth={2.4} />
                            </span>
                            <span className="truncate" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.15 }}>
                              {subject.name} | {cfg.textbook}
                            </span>
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
                                    <SvgAppIcon
                                      key={starIndex}
                                      name="star"
                                      size={14}
                                      className={filled ? 'text-amber-400' : 'text-slate-300'}
                                      filled={filled}
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
                                +10 <SvgAppIcon name="trophy" size={20} filled />
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
                  { label: '学习计划', icon: 'clipboard' as SvgAppIconName, action: () => navigate('/dashboard'), active: true },
                  { label: '学科闯关', icon: 'map' as SvgAppIconName, action: () => navigate('/subject/math'), active: false },
                  { label: '专项提升', icon: 'flame' as SvgAppIconName, action: () => navigate('/weakness'), active: false },
                ].map(item => {
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-white ${
                        item.active ? 'text-blue-700' : 'text-slate-500 hover:bg-white/35'
                      }`}
                    >
                      <SvgAppIcon name={item.icon} size={24} className={item.active ? 'text-orange-400' : 'text-sky-500'} filled={item.icon !== 'clipboard'} />
                      <span className="truncate" style={{ fontSize: '15px', fontWeight: 900 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <section className="mx-auto w-full max-w-[480px] text-white">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="uppercase text-white/88" style={{ fontSize: '14px', fontWeight: 900, letterSpacing: 0 }}>最近</h2>
                </div>
                <div className="-mx-3 flex snap-x gap-4 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {seniorRecentCards.map((card, index) => (
                    <button
                      key={`${card.key}-${index}`}
                      onClick={() => navigate(card.path)}
                      className="relative h-[182px] w-[264px] flex-shrink-0 snap-start overflow-hidden rounded-[8px] text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
                      style={{ background: card.bg }}
                    >
                      <div className="absolute right-[-16px] bottom-[-34px] h-[132px] w-[132px] rounded-full" style={{ background: card.accent }} />
                      <div className="absolute right-4 top-4 z-10 flex h-8 items-center gap-1.5 rounded-full bg-white/28 px-3 text-white shadow-sm backdrop-blur-sm">
                        <Gem size={16} className="text-white" style={{ fill: 'rgba(255,255,255,0.28)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 900 }}>{card.diamonds}</span>
                      </div>
                      <div className="absolute left-5 top-6 whitespace-pre-line text-white" style={{ fontFamily: '"STKaiti", "KaiTi", "Kaiti SC", "华文楷体", Georgia, serif', fontSize: '30px', fontWeight: 900, lineHeight: 1.04, letterSpacing: 0 }}>
                        {card.title}
                      </div>
                      <img src={card.image} alt="" className="absolute -bottom-4 right-[-18px] h-[140px] w-[198px] object-contain" />
                      <div className="absolute bottom-[-16px] left-6 h-[78px] w-[78px] rounded-full border-[5px] border-[#2B2B2E] bg-white/20 p-1">
                        <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/85 text-white" style={{ background: 'rgba(255,255,255,0.12)' }}>
                          <span style={{ fontSize: '15px', fontWeight: 900 }}>PLAY</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <button
                onClick={() => navigate('/weakness')}
                className="mx-auto mt-6 flex h-14 w-full max-w-[480px] items-center justify-between rounded-[8px] bg-white/9 px-4 text-white transition-colors hover:bg-white/13 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-white"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#63E7CB] text-white">
                    <Sparkles size={22} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block truncate" style={{ fontSize: '15px', fontWeight: 800 }}>AI 诊断训练</span>
                    <span className="mt-0.5 block text-white/62" style={{ fontSize: '12px', fontWeight: 500 }}>今日 {todayCount} 题 · 正确率 {overallAccuracy}%</span>
                  </span>
                </span>
                <span className="flex h-9 items-center gap-1 rounded-full bg-white/18 px-3">
                  <Play size={15} fill="currentColor" />
                  <span style={{ fontSize: '13px', fontWeight: 900 }}>PLAY</span>
                </span>
              </button>

              <section className="mx-auto mt-8 w-full max-w-[480px] text-white">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="uppercase text-white/88" style={{ fontSize: '14px', fontWeight: 900, letterSpacing: 0 }}>分类</h2>
                  <button onClick={() => navigate('/knowledge-map')} className="flex items-center gap-1 text-white/76 hover:text-white focus-visible:outline-2 focus-visible:outline-white" style={{ fontSize: '15px', fontWeight: 500 }}>
                    查看全部 <ChevronRight size={15} />
                  </button>
                </div>
                <div className="-mx-3 flex gap-4 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {(availableSubjects.length ? availableSubjects : seniorCategoryFallback).map(subject => {
                    const fallback = seniorCategoryFallback.find(item => item.id === subject.id) || seniorCategoryFallback[0];
                    const label = 'name' in subject ? subject.name : fallback.label;
                    const path = 'id' in subject ? `/subject/${subject.id}` : fallback.path;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => navigate(path)}
                        className="flex h-[114px] w-[106px] flex-shrink-0 flex-col items-center justify-center gap-3 rounded-[8px] bg-white/8 transition-colors hover:bg-white/12 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
                      >
                        <span className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: fallback.color }}>
                          <SvgAppIcon name={fallback.svgIcon} size={32} className="text-white" strokeWidth={2.8} />
                        </span>
                        <span className="max-w-[86px] truncate text-white/92" style={{ fontSize: '17px', fontWeight: 500 }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mx-auto mt-8 w-full max-w-[480px] text-white">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="uppercase text-white/88" style={{ fontSize: '14px', fontWeight: 900, letterSpacing: 0 }}>新练习</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {seniorNewCards.map((card, index) => (
                    <button
                      key={`${card.key}-${index}`}
                      onClick={() => navigate(card.path)}
                      className="relative h-[206px] overflow-hidden rounded-[8px] text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
                      style={{ background: card.bg }}
                    >
                      <div className="absolute right-[-36px] bottom-[-44px] h-[132px] w-[132px] rounded-full" style={{ background: card.accent }} />
                      <div className="absolute right-3 top-3 z-10 flex h-8 items-center gap-1.5 rounded-full bg-white/28 px-3 text-white shadow-sm backdrop-blur-sm">
                        <Gem size={16} className="text-white" style={{ fill: 'rgba(255,255,255,0.28)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 900 }}>{card.diamonds}</span>
                      </div>
                      <div className="absolute left-5 top-7 whitespace-pre-line text-white" style={{ fontFamily: '"STKaiti", "KaiTi", "Kaiti SC", "华文楷体", Georgia, serif', fontSize: '28px', fontWeight: 900, lineHeight: 1.04, letterSpacing: 0 }}>
                        {card.title}
                      </div>
                      <img src={card.image} alt="" className="absolute -bottom-7 right-[-28px] h-[142px] w-[190px] object-contain" />
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Spacing at bottom for nav */}
          <div className="h-1" />
        </div>
      </div>

      {!isLowerGradeStudent && (
        <div className="relative z-10 flex-shrink-0">
          <BottomNav />
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
