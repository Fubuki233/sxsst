import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, CircleDot, Lightbulb, Star } from 'lucide-react';
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

const SUBJECT_BANNERS: Record<string, string> = {
  math: `${ASSET}math_banner.png`,
  english: `${ASSET}eng_banner.png`,
  physics: `${ASSET}phy_banner.png`,
  chemistry: `${ASSET}chem_banner.png`,
};

const SUBJECT_COLORS: Record<string, { main: string; soft: string; deep: string; leaf: string; warm: string }> = {
  math: { main: '#5E7CF4', soft: '#EEF4FF', deep: '#18367E', leaf: '#86A3FF', warm: '#FF6335' },
  english: { main: '#33B982', soft: '#ECFBF4', deep: '#0F6F50', leaf: '#73D8AB', warm: '#32B77D' },
  physics: { main: '#9B5CF6', soft: '#F4EEFF', deep: '#4A2B86', leaf: '#C08BFF', warm: '#8B5CF6' },
  chemistry: { main: '#5F8DF7', soft: '#EEF6FF', deep: '#244078', leaf: '#93B7FF', warm: '#4F8CF7' },
};

const SUBJECT_COPY: Record<string, string> = {
  math: '系统掌握知识脉络，提升学习效率',
  english: '串联词汇语法阅读，稳步提升表达能力',
  physics: '理清概念与规律，建立科学思维',
  chemistry: '掌握物质变化规律，理解实验与反应',
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
  const selected = SUBJECTS.find(s => s.id === selectedSubject) || SUBJECTS[0];
  const colors = SUBJECT_COLORS[selectedSubject] || SUBJECT_COLORS.math;

  return (
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: '#EEF4FF' }}>
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/10" />

      <div className="relative z-10 flex-1 overflow-auto px-3 md:px-8 pt-4 md:pt-6 pb-6">
        <div className="max-w-6xl mx-auto space-y-5 md:space-y-7">
          <div className="max-w-4xl mx-auto bg-white/90 rounded-[28px] md:rounded-full shadow-lg px-2 py-2.5 md:px-3 md:py-3 grid grid-cols-4 gap-1.5 md:gap-4 border border-white">
            {SUBJECTS.map(subject => {
              const active = selectedSubject === subject.id;
              const subjectColor = SUBJECT_COLORS[subject.id] || SUBJECT_COLORS.math;

              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`min-w-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2.5 rounded-2xl md:rounded-full px-1 md:px-4 py-2 md:py-2.5 transition-all ${
                    active ? 'text-white' : 'text-slate-700 hover:bg-blue-50'
                  }`}
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(11px, 3vw, 17px)',
                    background: active ? `linear-gradient(180deg, ${subjectColor.leaf} 0%, ${subjectColor.main} 100%)` : 'transparent',
                    boxShadow: active ? '0 8px 14px rgba(54, 100, 229, 0.28)' : 'none',
                  }}
                >
                  <img src={SUBJECT_TAB_ICONS[subject.id]} alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0" />
                  <span className="leading-none truncate max-w-full">{subject.name}</span>
                </button>
              );
            })}
          </div>

          <div className="relative overflow-visible">
            <section
              className="relative overflow-hidden px-5 py-5 md:px-9 md:py-7 min-h-[156px] md:min-h-[178px]"
              style={{ background: 'linear-gradient(180deg, #C4D1F8 0%, rgba(196, 209, 248, 0.58) 42%, rgba(196, 209, 248, 0) 100%)' }}
            >
              <div className="absolute inset-0 opacity-45 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] bg-[length:32px_32px]" />
              <div className="relative z-10 max-w-[58%] min-h-[116px] md:min-h-[128px] flex flex-col justify-center">
                <h1 className="text-slate-900" style={{ fontWeight: 900, fontSize: 'clamp(34px, 7vw, 62px)', lineHeight: 1.02, letterSpacing: '0.08em' }}>
                  {selected.name}
                </h1>
                <div className="mt-2 text-blue-500" style={{ fontWeight: 900, fontSize: 'clamp(22px, 4.6vw, 38px)', lineHeight: 1.05, letterSpacing: '0.12em' }}>知识图谱</div>
                <div className="mt-3 h-1 w-12 rounded-full" style={{ background: colors.deep }} />
                <p className="mt-3 whitespace-nowrap text-slate-600" style={{ fontWeight: 700, fontSize: 'clamp(12px, 2.2vw, 16px)', lineHeight: 1.25 }}>
                  {SUBJECT_COPY[selectedSubject]}
                </p>
              </div>
              <img
                src={SUBJECT_BANNERS[selectedSubject]}
                alt=""
                className="absolute right-0 md:right-5 top-1/2 -translate-y-1/2 h-[86%] md:h-[92%] max-w-[52%] object-contain object-right pointer-events-none"
              />
            </section>

            <div className="relative z-10 space-y-8 px-3 pb-7 md:space-y-10 md:px-8 md:pb-10">
              <div
                className="absolute left-8 top-0 bottom-8 w-1 -translate-x-1/2 rounded-full opacity-45 sm:left-1/2"
                style={{ background: `linear-gradient(180deg, ${colors.leaf}, ${colors.main} 45%, ${colors.leaf})` }}
              />
              {chapters.map((chapter, index) => {
                const left = index % 2 === 0;
                const mastery = getChapterMastery(chapter.knowledgePoints, knowledgeStats);
                const hasChapterData = chapter.knowledgePoints.some(kp => knowledgeStats[kp] !== undefined);
                const accent = mastery >= 85 ? '#35B779' : mastery > 0 ? '#6A84F6' : '#A6B1C5';

                return (
                  <section key={chapter.id} className="relative pl-14 sm:pl-0">
                    <div
                      className="hidden sm:block absolute top-11 h-1 rounded-full opacity-45"
                      style={{
                        background: accent,
                        left: left ? '18%' : '50%',
                        right: left ? '50%' : '18%',
                      }}
                    />
                    <div
                      className="absolute left-5 top-7 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-[6px] border-white shadow-md sm:left-1/2"
                      style={{ background: accent }}
                    >
                      <CircleDot size={15} className="text-white" />
                    </div>

                    <div className={`relative sm:w-[43%] ${left ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                      <div
                        className="overflow-hidden rounded-[30px] border-2 bg-white/[0.9] shadow-lg"
                        style={{
                          borderColor: '#C9D7FF',
                          boxShadow: '0 18px 34px rgba(58, 84, 140, 0.12), 0 0 0 1px rgba(255,255,255,0.82), inset 0 1px 0 rgba(255,255,255,0.94)',
                        }}
                      >
                        <button
                          onClick={() => navigate(`/subject/${selectedSubject}`)}
                          className="w-full px-4 md:px-5 py-3.5 text-left transition-colors"
                          style={{
                            background: 'linear-gradient(90deg, rgba(196, 209, 248, 0.92) 0%, rgba(196, 209, 248, 0.52) 58%, rgba(196, 209, 248, 0.12) 100%)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md"
                              style={{ background: `linear-gradient(180deg, ${colors.leaf} 0%, ${colors.main} 100%)` }}
                            >
                              <BookOpen size={26} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-slate-800" style={{ fontWeight: 900, fontSize: 'clamp(20px, 4.8vw, 29px)' }}>{chapter.name}</span>
                            <span
                              className="rounded-full px-3 py-1 text-sm md:text-base whitespace-nowrap"
                              style={{ background: `${colors.main}12`, color: colors.main, fontWeight: 900 }}
                            >
                              掌握度 {mastery}%
                            </span>
                          </div>
                        </button>

                        <div className="bg-white/[0.9] p-3 md:p-4">
                          <div
                            className="rounded-[24px] border bg-white/[0.72] p-3 md:p-4"
                            style={{
                              borderColor: '#D6E0FF',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.92)',
                            }}
                          >
                          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-3 md:gap-4">
                            {chapter.knowledgePoints.map(kp => {
                              const accuracy = knowledgeStats[kp];
                              const percent = accuracy ?? 0;
                              const statusColor = getStatusColor(accuracy, colors);

                              return (
                                <button
                                  key={kp}
                                  onClick={() => navigate(`/graded-practice/${encodeURIComponent(kp)}`)}
                                  className="group rounded-[22px] border bg-white px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                                  style={{
                                    borderColor: '#E4EAF5',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95)',
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <span
                                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white shadow-md"
                                      style={{
                                        background: `linear-gradient(180deg, ${statusColor}cc 0%, ${statusColor} 100%)`,
                                        fontWeight: 900,
                                        fontSize: '28px',
                                      }}
                                    >
                                      {getPointSymbol(kp)}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block break-words text-slate-800" style={{ fontWeight: 900, fontSize: 'clamp(15px, 3.5vw, 21px)', lineHeight: 1.25 }}>{kp}</span>
                                      <span className="mt-1 block" style={{ color: statusColor, fontWeight: 900, fontSize: 'clamp(13px, 3vw, 18px)' }}>
                                        {getLabel(accuracy)} · {percent}%
                                      </span>
                                      <span className="mt-4 flex items-center gap-3">
                                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                          <span
                                            className="block h-full rounded-full transition-all"
                                            style={{ width: `${percent}%`, background: statusColor }}
                                          />
                                        </span>
                                        <span className="text-slate-500 tabular-nums" style={{ fontWeight: 700, fontSize: '14px' }}>{percent}%</span>
                                      </span>
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {hasChapterData && (
                            <div
                              className="mt-4 rounded-full px-4 py-3 flex items-center justify-center gap-2 text-slate-600"
                              style={{ background: `linear-gradient(90deg, ${colors.soft} 0%, rgba(255,255,255,0.78) 100%)`, fontWeight: 700 }}
                            >
                              {mastery >= 85 ? <Star size={19} style={{ color: accent }} /> : <Lightbulb size={18} style={{ color: colors.main }} />}
                              <span className="text-center text-sm md:text-base">{getChapterAdvice(mastery)}</span>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
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
