import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpenCheck, ChevronRight, Lightbulb, Target } from 'lucide-react';
import { SUBJECTS, getAllChapters } from '../utils/questions';
import { storage } from '../utils/storage';
import { BottomNav } from './BottomNav';

const ASSET = '/assets/';
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
  const startKnowledgePractice = (kp: string) => {
    navigate(isLowerGradeStudent ? `/lesson/knowledge/${encodeURIComponent(kp)}` : `/graded-practice/${encodeURIComponent(kp)}`);
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
