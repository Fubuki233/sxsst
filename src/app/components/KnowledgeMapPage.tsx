import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenCheck, Bookmark, Check, ChevronRight, Lightbulb, Lock, Target } from 'lucide-react';
import { SUBJECTS, getAllChapters, getSubjectsByGrade } from '../utils/questions';
import { storage } from '../utils/storage';
import { BottomNav } from './BottomNav';
import { publicAsset } from '../utils/assets';

const ASSET = publicAsset('assets/');
const LANDSCAPE_BG = `${ASSET}横屏背景图.png`;
const PORTRAIT_BG = `${ASSET}竖屏背景图.png`;

const SUBJECT_TAB_ICONS: Record<string, string> = {
  math: `${ASSET}math.png`,
  english: `${ASSET}eng.png`,
  physics: `${ASSET}phy.png`,
  chemistry: `${ASSET}chem.png`,
};

const SUBJECT_COLORS: Record<string, { main: string; soft: string; deep: string; leaf: string; warm: string }> = {
  math: { main: '#5E7CF4', soft: '#EEF4FF', deep: '#18367E', leaf: '#86A3FF', warm: '#FF6335' },
  english: { main: '#33B982', soft: '#ECFBF4', deep: '#0F6F50', leaf: '#73D8AB', warm: '#32B77D' },
  physics: { main: '#9B5CF6', soft: '#F4EEFF', deep: '#4A2B86', leaf: '#C08BFF', warm: '#8B5CF6' },
  chemistry: { main: '#5F8DF7', soft: '#EEF6FF', deep: '#244078', leaf: '#93B7FF', warm: '#4F8CF7' },
};

const SENIOR_ASSET = publicAsset('assets/senior-game/');
const SENIOR_ASSET_VERSION = '?v=senior-svg-6-20260522';

const seniorMapArt: Record<string, { images: string[]; bg: string; accent: string }> = {
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

const seniorChapterPalettes = [
  { bg: '#A889F3', accent: '#CBB8FF' },
  { bg: '#87EBCF', accent: '#BDF8EA' },
  { bg: '#ED8F88', accent: '#FFC7C2' },
  { bg: '#FFAF18', accent: '#FFD986' },
  { bg: '#E8669A', accent: '#F59FC2' },
  { bg: '#FF6058', accent: '#FFAAA6' },
];

function getStableSeed(value: string) {
  return value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getSeniorChapterStyle(value: string) {
  const seed = getStableSeed(value);
  return {
    palette: seniorChapterPalettes[seed % seniorChapterPalettes.length],
    reward: (seed % 5) + 1,
    height: 254 + (seed % 3) * 30,
  }
}

function getLabel(acc?: number): string {
  if (acc === undefined) return '未练习';
  if (acc < 60) return '薄弱';
  if (acc < 85) return '一般';
  return '熟练';
}

function getStatusColor(acc?: number, colors = SUBJECT_COLORS.math): string {
  if (acc === undefined) return '#A6B1C5';
  if (acc < 60) return '#E4544B';
  if (acc < 85) return '#F59E0B';
  return colors.warm;
}

function getPointSymbol(name: string): string {
  if (name.includes('加')) return '+';
  if (name.includes('减') || name.includes('退位')) return '-';
  if (name.includes('乘')) return '×';
  if (name.includes('除')) return '÷';
  if (name.includes('面积') || name.includes('体积')) return '□';
  if (name.includes('周长')) return '⌒';
  if (name.includes('图形')) return '△';
  if (name.includes('单词')) return 'A';
  if (name.includes('语法')) return 'G';
  if (name.includes('阅读')) return 'R';
  return '→';
}

function getChapterMastery(points: string[], stats: Record<string, number>): number {
  if (points.length === 0) return 0;
  const total = points.reduce((sum, kp) => sum + (stats[kp] ?? 0), 0);
  return Math.round(total / points.length);
}

function getChapterAdvice(mastery: number): string {
  if (mastery >= 85) return '太棒了！继续保持，挑战更高难度题目吧！';
  if (mastery >= 60) return '建议：继续巩固易错点，把正确率稳定下来';
  return '建议：加强基础训练，先把核心知识点练熟';
}

export default function KnowledgeMapPage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const stats = storage.getKnowledgeStats();
    const m: Record<string, number> = {};
    stats.forEach(s => { m[s.knowledgePoint] = s.accuracy; });
    setKnowledgeStats(m);
  }, []);

  const chapters = useMemo(() => getAllChapters()[selectedSubject] || [], [selectedSubject]);
  const colors = SUBJECT_COLORS[selectedSubject] || SUBJECT_COLORS.math;
  const allKnowledgePoints = chapters.flatMap(chapter => chapter.knowledgePoints);
  const practicedCount = allKnowledgePoints.filter(kp => knowledgeStats[kp] !== undefined).length;
  const weakCount = allKnowledgePoints.filter(kp => knowledgeStats[kp] !== undefined && knowledgeStats[kp] < 60).length;
  const averageMastery = allKnowledgePoints.length > 0
    ? Math.round(allKnowledgePoints.reduce((sum, kp) => sum + (knowledgeStats[kp] ?? 0), 0) / allKnowledgePoints.length)
    : 0;
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;
  const visibleSubjects = currentUser?.grade !== undefined ? getSubjectsByGrade(currentUser.grade) : SUBJECTS;
  const startKnowledgePractice = (kp: string) => {
    navigate(isLowerGradeStudent ? `/lesson/knowledge/${encodeURIComponent(kp)}` : `/graded-practice/${encodeURIComponent(kp)}`);
  };

  if (!isLowerGradeStudent) {
    const activeSubject = visibleSubjects.find(subject => subject.id === selectedSubject) || visibleSubjects[0] || SUBJECTS[0];

    return (
      <div className="size-full flex flex-col relative overflow-hidden [background:var(--senior-page-bg)] text-white">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#4E4248]/85 to-transparent" />

        <div className="relative z-10 flex-1 overflow-auto px-4 pt-7 pb-7">
          <div className="mx-auto w-full max-w-[680px]">
            <header className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '28px', fontWeight: 900, lineHeight: 1, letterSpacing: 0 }}>
                  知识图谱
                </h1>
                <p className="mt-1 truncate text-white/52" style={{ fontSize: '12px', fontWeight: 700 }}>
                  {activeSubject?.name || '课程'} · 章节进度
                </p>
              </div>
              <div className="grid w-[214px] flex-shrink-0 grid-cols-3 gap-1.5">
                {[
                  { label: '掌握', value: `${averageMastery}%` },
                  { label: '已练', value: `${practicedCount}/${allKnowledgePoints.length}` },
                  { label: '薄弱', value: weakCount },
                ].map(item => (
                  <div key={item.label} className="rounded-[8px] bg-white/10 px-2 py-2 text-center">
                    <div className="text-white" style={{ fontSize: '15px', fontWeight: 900, lineHeight: 1 }}>{item.value}</div>
                    <div className="mt-1 text-white/52" style={{ fontSize: '10px', fontWeight: 800, lineHeight: 1 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </header>

            <div className="-mx-4 flex gap-7 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visibleSubjects.map((subject, index) => {
                const active = selectedSubject === subject.id;
                const art = seniorMapArt[subject.id] || seniorMapArt.math;
                const label = subject.name;
                return (
                  <div key={subject.id} className="relative h-[192px] w-[180px] flex-shrink-0">
                    {active && (
                      <span
                        className="absolute bottom-0 left-1/2 z-0 h-8 w-8 -translate-x-1/2 rotate-45 rounded-[6px]"
                        style={{
                          background: 'var(--senior-map-card-bg)',
                          boxShadow: '10px 10px 18px rgba(35,43,69,0.05)',
                        }}
                      />
                    )}
                    <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className="relative z-10 h-[176px] w-full rounded-[8px] text-left transition-transform hover:-translate-y-1 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-white"
                    style={{
                      background: 'var(--senior-map-card-bg)',
                      boxShadow: 'var(--senior-map-card-shadow)',
                    }}
                  >
                    <div className="relative z-10 h-[92px] overflow-hidden rounded-t-[8px]" style={{ background: art.bg }}>
                      <div className="absolute right-[-18px] top-[-24px] h-28 w-28 rounded-full" style={{ background: art.accent }} />
                      <img src={art.images[index % art.images.length]} alt="" className="relative z-10 h-[104px] w-full object-contain object-right-bottom" />
                    </div>
                    <div className="relative z-10 px-5 pt-4" style={{ color: 'var(--senior-map-card-text)', fontSize: '24px', lineHeight: 1.12, fontWeight: active ? 900 : 500 }}>
                      {label}
                    </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <section className="mt-4 space-y-6">
              {chapters.map((chapter, chapterIndex) => {
                const mastery = getChapterMastery(chapter.knowledgePoints, knowledgeStats);
                const isSaved = chapterIndex === 1;
                const headerTitle = chapterIndex === 0
                  ? `${activeSubject?.name || '课程'}基础`
                  : chapter.name;

                return (
                  <article
                    key={chapter.id}
                    className="relative overflow-hidden rounded-[8px] px-6 py-7"
                    style={{
                      background: 'var(--senior-map-card-bg)',
                      boxShadow: 'var(--senior-map-card-shadow)',
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className="relative flex h-[62px] w-[62px] flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#20D6C9 ${Math.max(12, mastery)}%, var(--senior-map-progress-track) 0)`,
                        }}
                      >
                        <div className="h-[48px] w-[48px] rounded-full" style={{ background: 'var(--senior-map-card-bg)' }} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-[#5964F2]" style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1.2 }}>
                          {headerTitle}
                        </h2>
                        <p className="mt-1" style={{ color: 'var(--senior-map-muted-text)', fontSize: '13px', fontWeight: 700 }}>
                          掌握 {mastery}% · {chapter.knowledgePoints.length} 个知识点
                        </p>
                      </div>
                      {isSaved && (
                        <button
                          onClick={() => navigate(`/subject/${selectedSubject}`)}
                          className="ml-auto flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#5964F2] text-white shadow-[0_18px_34px_rgba(89,100,242,0.26)] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                          aria-label="保存课程"
                        >
                          <Bookmark size={36} strokeWidth={2.8} />
                        </button>
                      )}
                    </div>

                    <div className="relative mt-6 pl-[95px]">
                      <div className="absolute left-[30px] top-0 bottom-2 w-px" style={{ background: 'var(--senior-map-line)' }} />
                      <div className="space-y-8">
                        {chapter.knowledgePoints.map((kp, pointIndex) => {
                          const accuracy = knowledgeStats[kp];
                          const completed = accuracy !== undefined ? accuracy >= 70 : chapterIndex === 0 && pointIndex === 0;
                          const active = !completed && chapterIndex === 0 && pointIndex === 1;
                          const locked = !completed && !active && chapterIndex > 0 && pointIndex === 0;
                          const subtitle = accuracy !== undefined
                            ? `${getLabel(accuracy)} · ${accuracy}%`
                            : active
                              ? '正在学习'
                              : completed
                                ? '已完成'
                                : '待解锁';

                          return (
                            <button
                              key={kp}
                              onClick={() => startKnowledgePractice(kp)}
                              className="group relative block w-full text-left focus-visible:outline-2 focus-visible:outline-white"
                            >
                              <span
                                className={`absolute left-[-76px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white ${
                                  completed
                                    ? 'bg-[#20D6C9] text-white'
                                    : active
                                      ? 'bg-[#20D6C9]'
                                      : locked
                                        ? 'text-slate-300 ring-4'
                                        : ''
                                }`}
                                style={!completed && !active ? {
                                  background: locked ? 'var(--senior-map-card-bg)' : 'var(--senior-map-line)',
                                  ['--tw-ring-color' as string]: 'var(--senior-map-line)',
                                } : undefined}
                              >
                                {completed && <Check size={16} strokeWidth={4} />}
                                {locked && <Lock size={12} strokeWidth={3} />}
                              </span>
                              <span className="block transition-colors group-hover:text-[#5964F2]" style={{ color: 'var(--senior-map-card-text)', fontSize: 'clamp(24px, 6.2vw, 36px)', lineHeight: 1.08, fontWeight: 400 }}>
                                {kp}
                              </span>
                              <span className="mt-1 block" style={{ color: 'var(--senior-map-muted-text)', fontSize: 'clamp(15px, 3.8vw, 22px)', lineHeight: 1.2, fontWeight: 400 }}>
                                {subtitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <BottomNav />
        </div>
      </div>
    );
  };

  return (
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: '#EEF4FF' }}>
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/20" />

      <div className="relative z-10 flex-1 overflow-auto px-3 md:px-8 pt-3 md:pt-5 pb-6">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-5">
          <section
            className="relative overflow-hidden rounded-[28px] px-3.5 py-4 md:px-5 md:py-5 border border-white/85"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,249,255,0.94) 52%, rgba(255,251,235,0.86) 100%)',
              boxShadow: '0 14px 34px rgba(65, 98, 165, 0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 md:gap-5">
              <div className="grid grid-cols-3 gap-0 flex-1 rounded-2xl bg-white/65 border border-white/85 overflow-hidden">
                <div className="px-3 py-2.5 md:px-4">
                  <div className="text-sky-600 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>平均掌握</div>
                  <div className="text-sky-700" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.05 }}>{averageMastery}%</div>
                </div>
                <div className="px-3 py-2.5 md:px-4 border-l border-white/90">
                  <div className="text-emerald-600 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>已练知识点</div>
                  <div className="text-emerald-700" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.05 }}>{practicedCount}/{allKnowledgePoints.length}</div>
                </div>
                <div className="px-3 py-2.5 md:px-4 border-l border-white/90">
                  <div className="text-rose-500 whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 900 }}>薄弱点</div>
                  <div className="text-rose-700" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.05 }}>{weakCount}</div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5 md:gap-3">
              {SUBJECTS.map(subject => {
                const active = selectedSubject === subject.id;
                const subjectColor = SUBJECT_COLORS[subject.id] || SUBJECT_COLORS.math;

                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`min-w-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2.5 rounded-2xl md:rounded-full px-1 md:px-4 py-2 md:py-2.5 transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      active ? 'text-white' : 'text-slate-600 hover:bg-white/70'
                    }`}
                    style={{
                      fontWeight: 800,
                      fontSize: 'clamp(11px, 3vw, 16px)',
                      background: active ? `linear-gradient(180deg, ${subjectColor.leaf} 0%, ${subjectColor.main} 100%)` : 'transparent',
                      boxShadow: active ? '0 8px 14px rgba(54, 100, 229, 0.24)' : 'none',
                    }}
                  >
                    <img src={SUBJECT_TAB_ICONS[subject.id]} alt="" className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0" />
                    <span className="leading-none truncate max-w-full">{subject.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-4">
            {chapters.map((chapter) => {
                const mastery = getChapterMastery(chapter.knowledgePoints, knowledgeStats);
                const hasChapterData = chapter.knowledgePoints.some(kp => knowledgeStats[kp] !== undefined);
                const accent = mastery >= 85 ? '#35B779' : mastery > 0 ? '#6A84F6' : '#A6B1C5';

                return (
                  <section
                    key={chapter.id}
                    className="relative overflow-hidden rounded-[26px] bg-white/[0.96] border border-white"
                    style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10), inset 0 1px 0 rgba(255,255,255,0.9)' }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: `linear-gradient(180deg, ${colors.leaf} 0%, ${accent} 52%, ${colors.main} 100%)` }} />

                    <div className="px-4 pl-5 md:px-5 md:pl-6 py-4">
                      <button
                        onClick={() => navigate(`/subject/${selectedSubject}`)}
                        className="w-full text-left flex items-start justify-between gap-3 rounded-2xl transition-all hover:bg-slate-50/70 focus-visible:outline-2 focus-visible:outline-sky-400"
                      >
                        <div className="min-w-0 flex items-start gap-3">
                          <span
                            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md flex-shrink-0"
                            style={{ background: `linear-gradient(180deg, ${colors.leaf} 0%, ${colors.main} 100%)` }}
                          >
                            <BookOpenCheck size={23} />
                          </span>
                          <div className="min-w-0">
                            <h2 className="truncate text-slate-900" style={{ fontWeight: 900, fontSize: '20px', lineHeight: 1.2 }}>{chapter.name}</h2>
                            <div className="mt-1 text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{chapter.knowledgePoints.length}个知识点</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="rounded-full px-3 py-1 whitespace-nowrap" style={{ background: `${accent}16`, color: accent, fontWeight: 900, fontSize: '13px' }}>
                            {mastery}%
                          </span>
                          <ChevronRight size={18} className="text-slate-400" />
                        </div>
                      </button>

                      <div className="mt-4 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${mastery}%`, background: accent }} />
                      </div>

                      <div className="mt-4 grid grid-cols-1 min-[520px]:grid-cols-2 gap-2.5">
                            {chapter.knowledgePoints.map(kp => {
                              const accuracy = knowledgeStats[kp];
                              const percent = accuracy ?? 0;
                              const statusColor = getStatusColor(accuracy, colors);

                              return (
                                <button
                                  key={kp}
                                  onClick={() => startKnowledgePractice(kp)}
                                  className="group rounded-2xl border bg-white px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-sky-400"
                                  style={{
                                    borderColor: `${statusColor}22`,
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95)',
                                  }}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <span
                                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white shadow-sm"
                                      style={{
                                        background: `linear-gradient(180deg, ${statusColor}cc 0%, ${statusColor} 100%)`,
                                        fontWeight: 900,
                                        fontSize: '20px',
                                      }}
                                    >
                                      {getPointSymbol(kp)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block break-words text-slate-800" style={{ fontWeight: 900, fontSize: '15px', lineHeight: 1.25 }}>{kp}</span>
                                      <span className="mt-1 block" style={{ color: statusColor, fontWeight: 900, fontSize: 'clamp(13px, 3vw, 18px)' }}>
                                        {getLabel(accuracy)} · {percent}%
                                      </span>
                                      <span className="mt-3 flex items-center gap-2">
                                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                          <span
                                            className="block h-full rounded-full transition-all"
                                            style={{ width: `${percent}%`, background: statusColor }}
                                          />
                                        </span>
                                      </span>
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                      </div>

                          {hasChapterData && (
                            <div
                              className="mt-3 rounded-2xl px-4 py-3 flex items-start gap-2 text-slate-600 border"
                              style={{ background: `linear-gradient(90deg, ${colors.soft} 0%, rgba(255,255,255,0.78) 100%)`, borderColor: `${colors.main}18`, fontWeight: 700 }}
                            >
                              {mastery >= 85 ? <Target size={18} style={{ color: accent }} className="mt-0.5 flex-shrink-0" /> : <Lightbulb size={18} style={{ color: colors.main }} className="mt-0.5 flex-shrink-0" />}
                              <span className="text-sm md:text-base">{getChapterAdvice(mastery)}</span>
                            </div>
                          )}
                    </div>
                  </section>
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
