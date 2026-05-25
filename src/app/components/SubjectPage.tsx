import { useParams, useNavigate } from 'react-router';
import { SUBJECTS, getAllChapters, getAllQuestions, getSubjectsByGrade } from '../utils/questions';
import { storage } from '../utils/storage';
import { ArrowLeft, Gem, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { publicAsset } from '../utils/assets';
import { SvgAppIcon, type SvgAppIconName } from './SvgAppIcon';

const SENIOR_ASSET = publicAsset('assets/senior-game/');
const SENIOR_ASSET_VERSION = '?v=senior-svg-6-20260522';

const seniorSubjectDetails: Record<string, {
  title: string;
  subtitle: string;
  images: string[];
  bg: string;
  accent: string;
  iconBg: string;
}> = {
  math: {
    title: '数学思维',
    subtitle: '练习计算、图形与逻辑推理，把每一步解题过程想清楚。',
    images: [
      `${SENIOR_ASSET}math-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}math-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#A889F3',
    accent: '#CBB8FF',
    iconBg: '#8F6BEB',
  },
  english: {
    title: '英语表达',
    subtitle: '积累词汇、语法和阅读能力，让语言练习更轻松。',
    images: [
      `${SENIOR_ASSET}english-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}english-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#87EBCF',
    accent: '#BDF8EA',
    iconBg: '#52C8AF',
  },
  physics: {
    title: '物理探索',
    subtitle: '从力、光和现象出发，训练观察与推理能力。',
    images: [
      `${SENIOR_ASSET}physics-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}physics-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#ED8F88',
    accent: '#FFC7C2',
    iconBg: '#D77470',
  },
  chemistry: {
    title: '化学实验',
    subtitle: '理解物质、变化与反应规律，建立清晰的知识连接。',
    images: [
      `${SENIOR_ASSET}chemistry-1.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-2.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-3.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-4.svg${SENIOR_ASSET_VERSION}`,
      `${SENIOR_ASSET}chemistry-5.svg${SENIOR_ASSET_VERSION}`,
    ],
    bg: '#FFAF18',
    accent: '#FFD986',
    iconBg: '#E69C12',
  },
};

function getChapterReward(subjectId: string, chapterId: string) {
  const seed = `${subjectId}-${chapterId}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (seed % 5) + 1;
}

const subjectSvgIconMap: Record<string, SvgAppIconName> = {
  math: 'math',
  english: 'english',
  physics: 'physics',
  chemistry: 'chemistry',
};

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'free' | 'weak'>('free');
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const chapters = getAllChapters()[subjectId || ''] || [];
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, number>>({});
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;
  const seniorScrollerRef = useRef<HTMLDivElement>(null);
  const seniorScrollTimerRef = useRef<number | null>(null);
  const isSyncingSeniorScrollRef = useRef(false);
  const seniorDragRef = useRef({
    active: false,
    dragged: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: -1,
    suppressClickUntil: 0,
  });
  const seniorSubjectIds = useMemo(() => {
    const subjects = currentUser?.grade !== undefined ? getSubjectsByGrade(currentUser.grade) : SUBJECTS;
    return subjects.filter(item => getAllChapters()[item.id]?.length).map(item => item.id);
  }, [currentUser?.grade]);
  const seniorSubjects = seniorSubjectIds
    .map(id => SUBJECTS.find(item => item.id === id))
    .filter(Boolean) as typeof SUBJECTS;
  const seniorActiveIndex = Math.max(0, seniorSubjectIds.indexOf(subjectId || ''));

  useEffect(() => {
    const stats = storage.getKnowledgeStats();
    const statsMap: Record<string, number> = {};
    stats.forEach(s => {
      statsMap[s.knowledgePoint] = s.accuracy;
    });
    setKnowledgeStats(statsMap);
  }, []);

  useEffect(() => {
    if (isLowerGradeStudent) return;
    const scroller = seniorScrollerRef.current;
    if (!scroller) return;

    isSyncingSeniorScrollRef.current = true;
    scroller.scrollTo({ left: seniorActiveIndex * scroller.clientWidth, behavior: 'auto' });

    window.setTimeout(() => {
      isSyncingSeniorScrollRef.current = false;
    }, 80);
  }, [isLowerGradeStudent, seniorActiveIndex]);

  useEffect(() => () => {
    if (seniorScrollTimerRef.current !== null) {
      window.clearTimeout(seniorScrollTimerRef.current);
    }
  }, []);

  const handleSeniorScroll = () => {
    const scroller = seniorScrollerRef.current;
    if (!scroller || seniorSubjectIds.length === 0 || isSyncingSeniorScrollRef.current || seniorDragRef.current.active) return;

    if (seniorScrollTimerRef.current !== null) {
      window.clearTimeout(seniorScrollTimerRef.current);
    }

    seniorScrollTimerRef.current = window.setTimeout(() => {
      const latestScroller = seniorScrollerRef.current;
      if (!latestScroller) return;

      const nextIndex = Math.round(latestScroller.scrollLeft / latestScroller.clientWidth);
      const nextSubjectId = seniorSubjectIds[Math.max(0, Math.min(nextIndex, seniorSubjectIds.length - 1))];
      if (nextSubjectId && nextSubjectId !== subjectId) {
        navigate(`/subject/${nextSubjectId}`, { replace: true });
      }
    }, 120);
  };

  const handleSeniorPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button,a,input,textarea,select,label')) return;
    const scroller = seniorScrollerRef.current;
    if (!scroller) return;

    seniorDragRef.current = {
      active: true,
      dragged: false,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      pointerId: event.pointerId,
      suppressClickUntil: 0,
    };
    scroller.setPointerCapture(event.pointerId);
    scroller.style.cursor = 'grabbing';
    scroller.style.scrollSnapType = 'none';
  };

  const handleSeniorPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = seniorDragRef.current;
    const scroller = seniorScrollerRef.current;
    if (!drag.active || !scroller || event.pointerId !== drag.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 3) {
      drag.dragged = true;
    }
    scroller.scrollLeft = drag.scrollLeft - deltaX;
    event.preventDefault();
  };

  const finishSeniorMouseDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = seniorDragRef.current;
    const scroller = seniorScrollerRef.current;
    if (!drag.active || !scroller || event.pointerId !== drag.pointerId) return;

    drag.active = false;
    scroller.style.cursor = '';
    scroller.style.scrollSnapType = '';
    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId);
    }

    const nextIndex = Math.max(0, Math.min(Math.round(scroller.scrollLeft / scroller.clientWidth), seniorSubjectIds.length - 1));
    const nextSubjectId = seniorSubjectIds[nextIndex];

    if (drag.dragged) {
      drag.suppressClickUntil = Date.now() + 250;
    }

    isSyncingSeniorScrollRef.current = true;
    scroller.scrollTo({ left: nextIndex * scroller.clientWidth, behavior: 'auto' });
    window.setTimeout(() => {
      isSyncingSeniorScrollRef.current = false;
    }, 80);

    if (nextSubjectId && nextSubjectId !== subjectId) {
      navigate(`/subject/${nextSubjectId}`, { replace: true });
    }
  };

  const handleSeniorClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!seniorDragRef.current.dragged || Date.now() > seniorDragRef.current.suppressClickUntil) {
      seniorDragRef.current.dragged = false;
      return;
    }
    seniorDragRef.current.dragged = false;
    seniorDragRef.current.suppressClickUntil = 0;
    event.preventDefault();
    event.stopPropagation();
  };

  if (!subject) return null;

  if (!isLowerGradeStudent) {
    return (
      <div className="size-full overflow-hidden [background:var(--senior-page-bg)] text-white">
        <div
          ref={seniorScrollerRef}
          onScroll={handleSeniorScroll}
          onPointerDown={handleSeniorPointerDown}
          onPointerMove={handleSeniorPointerMove}
          onPointerUp={finishSeniorMouseDrag}
          onPointerCancel={finishSeniorMouseDrag}
          onClickCapture={handleSeniorClickCapture}
          className="flex h-full cursor-grab snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {seniorSubjects.map((item, index) => {
            const detail = seniorSubjectDetails[item.id] || seniorSubjectDetails.math;
            const itemChapters = getAllChapters()[item.id] || [];
            const Icon = item.icon;

            return (
              <section key={item.id} className="h-full w-full flex-shrink-0 snap-start overflow-y-auto">
                <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col [background:var(--senior-page-bg)]">
                  <div className="relative min-h-[46vh] overflow-hidden rounded-b-[28px]" style={{ background: detail.bg }}>
                    <div className="absolute left-[-56px] top-[70px] h-[240px] w-[260px] rounded-full bg-white/30" />
                    <div className="absolute right-[-70px] top-[-60px] h-[260px] w-[210px] rotate-[32deg] rounded-full" style={{ background: detail.accent }} />
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="absolute left-5 top-7 z-20 flex h-9 items-center gap-2 rounded-full bg-white/24 px-3 text-white transition-colors hover:bg-white/32 focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <ArrowLeft size={17} />
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>关闭</span>
                    </button>
                    <div className="absolute bottom-[-24px] right-[-48px] left-3 z-10 flex justify-end">
                      <img src={detail.images[index % detail.images.length]} alt="" className="h-[270px] w-[380px] max-w-none object-contain" />
                    </div>
                  </div>

                  <div className="relative flex-1 px-4 pb-8 pt-7">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-8 items-center gap-1.5 rounded-full bg-white/22 px-3 text-white">
                        <Gem size={16} className="text-white" style={{ fill: 'rgba(255,255,255,0.28)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 900 }}>{27 + index}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {seniorSubjectIds.map(id => (
                          <span
                            key={id}
                            className={`h-1.5 rounded-full transition-all ${id === item.id ? 'w-5 bg-white' : 'w-1.5 bg-white/32'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '28px', fontWeight: 900, lineHeight: 1.08, letterSpacing: 0 }}>
                      {detail.title}
                    </h1>
                    <p className="mt-3 max-w-[420px] text-white/72" style={{ fontSize: '17px', fontWeight: 500, lineHeight: 1.35 }}>
                      {detail.subtitle}
                    </p>

                    <div className="mt-7">
                      <div className="mb-3 text-white/88" style={{ fontSize: '14px', fontWeight: 900, letterSpacing: 0 }}>练习</div>
                      <div className="space-y-3">
                        {itemChapters.map(chapter => {
                          const reward = getChapterReward(item.id, chapter.id);
                          const masteredCount = chapter.knowledgePoints.filter(kp => (knowledgeStats[kp] || 0) >= 85).length;
                          const questionCount = getAllQuestions().filter(question => question.subject === item.id && question.chapter === chapter.id).length;

                          return (
                            <button
                              key={chapter.id}
                              onClick={() => navigate(`/practice/${item.id}/${chapter.id}`)}
                              className="flex min-h-[70px] w-full items-center gap-3 rounded-[8px] bg-white/12 px-3 text-left transition-colors hover:bg-white/16 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-white"
                            >
                              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full" style={{ background: detail.iconBg }}>
                                <Icon size={24} className="text-white" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-white" style={{ fontSize: '16px', fontWeight: 700 }}>{chapter.name}</span>
                                <span className="mt-1 flex items-center gap-3 text-white/58" style={{ fontSize: '12px', fontWeight: 700 }}>
                                  <span className="flex items-center gap-1">
                                    <Gem size={13} style={{ fill: 'rgba(255,255,255,0.22)' }} />
                                    {reward}
                                  </span>
                                  <span>{questionCount || chapter.knowledgePoints.length}题</span>
                                  <span>{masteredCount}/{chapter.knowledgePoints.length}掌握</span>
                                </span>
                              </span>
                              <span className="flex h-9 items-center gap-1 rounded-full bg-white/22 px-3 text-white">
                                <Play size={14} fill="currentColor" />
                                <span style={{ fontSize: '13px', fontWeight: 900 }}>PLAY</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  }

  const lowSubjectIcon = subjectSvgIconMap[subject.id] || 'math';
  const mapTheme = {
    bg: 'linear-gradient(180deg, #7CC7FF 0%, #A7E8FF 42%, #F8F7E8 100%)',
    primary: '#2F7DF6',
    secondary: '#27C7A7',
    warm: '#FFB92E',
  };

  return (
    <div className="relative size-full flex flex-col overflow-hidden" style={{ background: mapTheme.bg }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(255,255,255,0.48),transparent_25%),radial-gradient(circle_at_88%_8%,rgba(255,238,173,0.48),transparent_24%)]" />

      <header className="relative z-10 px-4 md:px-8 pt-4 pb-3 flex-shrink-0">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex h-11 w-11 items-center justify-center rounded-[18px] border-2 border-white bg-white/88 text-sky-700 transition-transform active:translate-y-0.5"
            style={{ boxShadow: '0 6px 0 rgba(37, 99, 235, 0.16)' }}
          >
            <ArrowLeft size={22} />
          </button>
          <div className="min-w-0 flex-1 rounded-[24px] border-2 border-white bg-white/88 px-4 py-3" style={{ boxShadow: '0 8px 0 rgba(37, 99, 235, 0.13)' }}>
            <div className="flex items-center gap-2 text-slate-900">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: mapTheme.primary }}>
                <SvgAppIcon name={lowSubjectIcon} size={21} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <div className="truncate" style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1 }}>{subject.name}闯关地图</div>
                <div className="mt-1 truncate text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>选一关开始，收集星星和钻石</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-auto px-4 pb-5 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-[26px] border-2 border-white bg-white/78 p-2" style={{ boxShadow: '0 7px 0 rgba(15, 118, 110, 0.12)' }}>
            <button
              onClick={() => setMode('free')}
              className={`flex h-12 items-center justify-center gap-2 rounded-[20px] transition-all ${mode === 'free' ? 'text-white' : 'text-slate-500'}`}
              style={{ background: mode === 'free' ? mapTheme.primary : 'transparent', fontSize: '15px', fontWeight: 900, boxShadow: mode === 'free' ? '0 5px 0 rgba(30,64,175,0.18)' : undefined }}
            >
              <SvgAppIcon name="map" size={18} />
              自由闯关
            </button>
            <button
              onClick={() => setMode('weak')}
              className={`flex h-12 items-center justify-center gap-2 rounded-[20px] transition-all ${mode === 'weak' ? 'text-white' : 'text-slate-500'}`}
              style={{ background: mode === 'weak' ? mapTheme.secondary : 'transparent', fontSize: '15px', fontWeight: 900, boxShadow: mode === 'weak' ? '0 5px 0 rgba(15,118,110,0.18)' : undefined }}
            >
              <SvgAppIcon name="sparkles" size={18} />
              弱项补给
            </button>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-[22px] border-2 border-white bg-white/80 px-3 py-3 text-center">
              <SvgAppIcon name="trophy" size={22} className="mx-auto text-amber-500" filled />
              <div className="mt-1 text-slate-900" style={{ fontSize: '18px', fontWeight: 900 }}>{chapters.length}</div>
              <div className="text-slate-500" style={{ fontSize: '11px', fontWeight: 900 }}>关卡</div>
            </div>
            <div className="rounded-[22px] border-2 border-white bg-white/80 px-3 py-3 text-center">
              <SvgAppIcon name="star" size={22} className="mx-auto text-yellow-400" filled />
              <div className="mt-1 text-slate-900" style={{ fontSize: '18px', fontWeight: 900 }}>{chapters.reduce((sum, item) => sum + item.knowledgePoints.filter(kp => (knowledgeStats[kp] || 0) >= 85).length, 0)}</div>
              <div className="text-slate-500" style={{ fontSize: '11px', fontWeight: 900 }}>已掌握</div>
            </div>
            <div className="rounded-[22px] border-2 border-white bg-white/80 px-3 py-3 text-center">
              <SvgAppIcon name="gem" size={22} className="mx-auto text-sky-500" filled />
              <div className="mt-1 text-slate-900" style={{ fontSize: '18px', fontWeight: 900 }}>{chapters.reduce((sum, item) => sum + getChapterReward(subject.id, item.id), 0)}</div>
              <div className="text-slate-500" style={{ fontSize: '11px', fontWeight: 900 }}>钻石</div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
            {chapters.map((chapter, index) => {
              const masteredCount = chapter.knowledgePoints.filter(kp => (knowledgeStats[kp] || 0) >= 85).length;
              const reward = getChapterReward(subject.id, chapter.id);
              const questionCount = getAllQuestions().filter(question => question.subject === subject.id && question.chapter === chapter.id).length || chapter.knowledgePoints.length;
              const palette = [
                ['#8B5CF6', '#C4B5FD'],
                ['#14B8A6', '#99F6E4'],
                ['#F97316', '#FED7AA'],
                ['#EC4899', '#FBCFE8'],
                ['#2563EB', '#BFDBFE'],
              ][index % 5];

              return (
                <article
                  key={chapter.id}
                  className="relative min-h-[244px] w-[252px] flex-shrink-0 overflow-hidden rounded-[30px] border-2 border-white p-4 text-left text-white md:w-auto"
                  style={{ background: palette[0], boxShadow: '0 10px 0 rgba(15, 23, 42, 0.15)' }}
                >
                  <div className="absolute right-[-34px] top-[-42px] h-32 w-32 rounded-full opacity-70" style={{ background: palette[1] }} />
                  <div className="absolute bottom-[-48px] left-[-22px] h-36 w-36 rounded-full bg-white/18" />

                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[20px] border-2 border-white/70 bg-white/20">
                      {index === chapters.length - 1 ? <SvgAppIcon name="flag" size={24} /> : <SvgAppIcon name={lowSubjectIcon} size={24} />}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-white/24 px-3 py-1.5" style={{ fontSize: '13px', fontWeight: 900 }}>
                      <SvgAppIcon name="gem" size={15} filled />
                      {reward}
                    </span>
                  </div>

                  <div className="relative mt-7">
                    <div className="text-white/82" style={{ fontSize: '13px', fontWeight: 900 }}>第 {index + 1} 关</div>
                    <div className="mt-1 line-clamp-2" style={{ fontSize: '25px', fontWeight: 900, lineHeight: 1.08 }}>{chapter.name}</div>
                  </div>

                  <div className="relative mt-5 flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, starIndex) => (
                      <SvgAppIcon
                        key={starIndex}
                        name="star"
                        size={20}
                        className={masteredCount > starIndex ? 'text-yellow-200' : 'text-white/35'}
                        filled={masteredCount > starIndex}
                      />
                    ))}
                  </div>

                  <div className="relative mt-4 flex items-center justify-between rounded-[18px] bg-white/18 px-3 py-2">
                    <span className="text-white/86" style={{ fontSize: '12px', fontWeight: 900 }}>{questionCount} 题 · {masteredCount}/{chapter.knowledgePoints.length}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900">
                      {mode === 'weak' ? <SvgAppIcon name="gift" size={18} /> : <SvgAppIcon name="play" size={16} filled />}
                    </span>
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/lesson/chapter/${subjectId}/${chapter.id}`)}
                      className={`flex h-11 items-center justify-center gap-1.5 rounded-[16px] border-2 border-white/65 bg-white text-slate-900 transition-transform active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white ${
                        mode === 'free' ? 'ring-2 ring-yellow-200' : ''
                      }`}
                      style={{ fontSize: '14px', fontWeight: 900 }}
                    >
                      <SvgAppIcon name="play" size={15} filled />
                      看课程
                    </button>
                    <button
                      onClick={() => navigate(`/practice/${subjectId}/${chapter.id}`)}
                      className={`flex h-11 items-center justify-center gap-1.5 rounded-[16px] border-2 border-white/35 bg-[#2F7DF6] text-white transition-transform active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white ${
                        mode === 'weak' ? 'ring-2 ring-yellow-200' : ''
                      }`}
                      style={{ fontSize: '14px', fontWeight: 900 }}
                    >
                      <SvgAppIcon name="sparkles" size={15} />
                      做练习
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-1 rounded-[24px] border-2 border-white bg-white/76 px-4 py-3 text-slate-600" style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.45 }}>
            {mode === 'weak' ? '弱项补给会直接进入本关练习，优先补上容易出错的知识点。' : '自由闯关会先看课程内容，再进入练习。'}
          </div>
        </div>
      </main>
    </div>
  );
}
