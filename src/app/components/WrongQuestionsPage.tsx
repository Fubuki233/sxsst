import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../utils/storage';
import { getAllQuestions } from '../utils/questions';
import { AlertCircle, CheckCircle, Clock3, Gem, Lightbulb, Play, RotateCcw, Search, Target, XCircle } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { publicAsset } from '../utils/assets';

const ASSET = publicAsset('assets/');
const SENIOR_ASSET = publicAsset('assets/senior-game/');
const SENIOR_ASSET_VERSION = '?v=senior-svg-6-20260522';
const LANDSCAPE_BG = `${ASSET}横屏背景图.png`;
const PORTRAIT_BG = `${ASSET}竖屏背景图.png`;

const FILTERS = [
  { id: 'all', label: '全部', icon: `${ASSET}all.png` },
  { id: 'math', label: '数学', icon: `${ASSET}math.png` },
  { id: 'english', label: '英语', icon: `${ASSET}eng.png` },
  { id: 'physics', label: '物理', icon: `${ASSET}phy.png` },
  { id: 'chemistry', label: '化学', icon: `${ASSET}chem.png` },
];

const SUBJECT_LABELS: Record<string, string> = {
  math: '数学',
  english: '英语',
  physics: '物理',
  chemistry: '化学',
};

const seniorWrongSubjectArt: Record<string, { label: string; images: string[]; bg: string; accent: string }> = {
  all: {
    label: '全部',
    images: [`${SENIOR_ASSET}math-1.svg${SENIOR_ASSET_VERSION}`],
    bg: '#3A3A3D',
    accent: '#57575B',
  },
  math: {
    label: '数学',
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
    label: '英语',
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
    label: '物理',
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
    label: '化学',
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

const seniorWrongCardPalettes = [
  { bg: '#FFAF18', accent: '#FFD986' },
  { bg: '#FF6058', accent: '#FFAAA6' },
  { bg: '#A889F3', accent: '#CBB8FF' },
  { bg: '#E8669A', accent: '#F59FC2' },
  { bg: '#87EBCF', accent: '#BDF8EA' },
  { bg: '#ED8F88', accent: '#FFC7C2' },
];

const seniorWrongColumnHeights = [
  [246, 306, 268, 342, 286],
  [322, 258, 356, 278, 330],
];

function getStableSeed(value: string) {
  return value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getWrongReward(questionId: string) {
  const seed = getStableSeed(questionId);
  return (seed % 5) + 1;
}

function getWrongCardStyle(questionId: string, index: number) {
  const seed = getStableSeed(questionId);
  const column = index % 2;
  const row = Math.floor(index / 2);
  const heights = seniorWrongColumnHeights[column];
  return {
    height: heights[(seed + row) % heights.length],
    palette: seniorWrongCardPalettes[seed % seniorWrongCardPalettes.length],
  };
}

function formatWrongTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}

export default function WrongQuestionsPage() {
  const navigate = useNavigate();
  const [wrongAnswers, setWrongAnswers] = useState<Answer[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const currentUser = storage.getCurrentUser();
  const isSeniorStudent = currentUser?.grade !== undefined && currentUser.grade >= 4;

  const questions = useMemo(() => getAllQuestions(), []);
  const questionMap = useMemo(() => new Map(questions.map(q => [q.id, q])), [questions]);

  useEffect(() => {
    loadWrongAnswers();
  }, []);

  const loadWrongAnswers = () => {
    setWrongAnswers(storage.getWrongAnswers());
  };

  const handleRetry = (questionId: string) => {
    const question = questionMap.get(questionId);
    if (!question) return;
    const query = `retryQuestionId=${encodeURIComponent(questionId)}&from=wrong-questions`;
    const currentUser = storage.getCurrentUser();
    const path = currentUser?.grade !== undefined && currentUser.grade < 4
      ? `/lesson/knowledge/${encodeURIComponent(question.knowledgePoint)}?${query}`
      : `/graded-practice/${encodeURIComponent(question.knowledgePoint)}?${query}`;
    navigate(path);
  };

  const uniqueWrongAnswers = useMemo(() => {
    const latest = new Map<string, Answer>();
    [...wrongAnswers]
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach(answer => {
        if (!latest.has(answer.questionId)) latest.set(answer.questionId, answer);
      });
    return Array.from(latest.values());
  }, [wrongAnswers]);

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: uniqueWrongAnswers.length };
    uniqueWrongAnswers.forEach(answer => {
      const subject = questionMap.get(answer.questionId)?.subject;
      if (!subject) return;
      counts[subject] = (counts[subject] || 0) + 1;
    });
    return counts;
  }, [questionMap, uniqueWrongAnswers]);

  const filteredAnswers = uniqueWrongAnswers.filter(answer => {
    const question = questionMap.get(answer.questionId);
    if (!question) return false;
    if (filter !== 'all' && question.subject !== filter) return false;
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return true;
    return [
      question.question,
      question.knowledgePoint,
      question.explanation,
      question.warning,
      answer.userAnswer,
      question.answer,
    ].some(text => text.toLowerCase().includes(keyword));
  });

  if (isSeniorStudent) {
    const seniorFilters = FILTERS.filter(item => item.id === 'all' || subjectCounts[item.id] || item.id === filter);
    const seniorWrongColumns = [0, 1].map(column =>
      filteredAnswers
        .map((answer, index) => ({ answer, index }))
        .filter(item => item.index % 2 === column)
    );

    return (
      <div className="size-full flex flex-col relative overflow-hidden [background:var(--senior-page-bg)] text-white">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#4E4248]/85 to-transparent" />

        <div className="relative z-10 flex-1 overflow-auto px-4 pt-8 pb-7">
          <div className="mx-auto w-full max-w-[640px]">
            <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '44px', fontWeight: 900, lineHeight: 1, letterSpacing: 0 }}>
              错题本
            </h1>

            <div className="relative mt-7">
              <Search size={28} className="absolute left-5 top-1/2 -translate-y-1/2 text-white" />
              <input
                value={searchText}
                onChange={event => setSearchText(event.target.value)}
                placeholder="搜索题目、知识点..."
                className="h-[64px] w-full rounded-[8px] border-0 bg-white/14 pl-16 pr-4 text-white outline-none placeholder:text-white/50 focus:bg-white/18"
                style={{ fontSize: '22px', fontWeight: 600 }}
              />
            </div>

            <div className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 sm:mt-8 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {seniorFilters.map(item => {
                const active = filter === item.id;
                const art = seniorWrongSubjectArt[item.id] || seniorWrongSubjectArt.math;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`flex h-[98px] w-[88px] flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-[8px] transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white sm:h-[132px] sm:w-[130px] sm:gap-3 ${
                      active ? 'bg-white/17' : 'bg-white/9 hover:bg-white/12'
                    }`}
                  >
                    <span className="relative flex h-11 w-11 items-center justify-center sm:h-16 sm:w-16">
                      <span className="absolute inset-1 rounded-[14px] rotate-[-9deg] sm:rounded-[18px]" style={{ background: art.bg }} />
                      <img src={art.images[0]} alt="" className="relative h-11 w-11 object-contain sm:h-16 sm:w-16" />
                    </span>
                    <span className="max-w-[74px] truncate text-white sm:max-w-[108px]" style={{ fontSize: 'clamp(13px, 3.8vw, 20px)', fontWeight: 500 }}>
                      {art.label}
                    </span>
                    <span className="text-white/48" style={{ fontSize: '11px', fontWeight: 900 }}>{subjectCounts[item.id] || 0}</span>
                  </button>
                );
              })}
            </div>

            <section className="mt-9">
              <h2 className="mb-5 text-white/86" style={{ fontSize: '17px', fontWeight: 900, letterSpacing: 0 }}>推荐重练</h2>

              {filteredAnswers.length === 0 ? (
                <div className="rounded-[8px] bg-white/10 px-6 py-12 text-center">
                  <CheckCircle size={46} className="mx-auto text-[#87EBCF]" />
                  <div className="mt-4 text-white" style={{ fontSize: '22px', fontWeight: 900 }}>暂无错题</div>
                  <div className="mt-2 text-white/55" style={{ fontSize: '14px', fontWeight: 700 }}>当前筛选下没有错题记录</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 items-start">
                  {seniorWrongColumns.map((columnItems, columnIndex) => (
                    <div key={columnIndex} className="flex min-w-0 flex-col gap-5">
                      {columnItems.map(({ answer, index }) => {
                        const question = questionMap.get(answer.questionId);
                        if (!question) return null;
                        const art = seniorWrongSubjectArt[question.subject] || seniorWrongSubjectArt.math;
                        const image = art.images[index % art.images.length];
                        const cardStyle = getWrongCardStyle(answer.questionId, index);

                        return (
                          <button
                            key={answer.questionId}
                            onClick={() => handleRetry(answer.questionId)}
                            className="relative w-full overflow-hidden rounded-[8px] p-4 text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
                            style={{ minHeight: `${cardStyle.height}px`, background: cardStyle.palette.bg }}
                          >
                            <div className="absolute right-[-50px] bottom-[-44px] h-40 w-40 rounded-full opacity-85" style={{ background: cardStyle.palette.accent }} />
                            <div className="absolute right-[-34px] bottom-[-18px] h-36 w-44">
                              <img src={image} alt="" className="h-full w-full object-contain" />
                            </div>
                            <div className="relative z-10 flex h-9 w-fit items-center gap-1.5 rounded-full bg-white/25 px-3 text-white">
                              <Gem size={18} style={{ fill: 'rgba(255,255,255,0.28)' }} />
                              <span style={{ fontSize: '16px', fontWeight: 900 }}>{getWrongReward(answer.questionId)}</span>
                            </div>
                            <div className="relative z-10 mt-5 whitespace-pre-line text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '26px', fontWeight: 900, lineHeight: 1.08 }}>
                              {question.knowledgePoint}
                            </div>
                            <div className="relative z-10 mt-3 max-w-[92%] text-white/78" style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {question.question}
                            </div>
                            <div className="absolute bottom-4 left-4 z-10 flex h-9 items-center gap-1 rounded-full bg-[#2B2B2E]/34 px-3 text-white backdrop-blur-sm">
                              <Play size={14} fill="currentColor" />
                              <span style={{ fontSize: '12px', fontWeight: 900 }}>重做</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ background: '#EEF4FF' }}
    >
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/20" />

      <div className="relative z-10 flex-1 overflow-auto px-3 md:px-8 pt-3 md:pt-5 pb-6">
        <div className="max-w-5xl mx-auto space-y-4 md:space-y-5">
          <div
            className="relative overflow-hidden rounded-[28px] px-3 py-3 md:px-5 md:py-4 border border-white/80"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.93) 52%, rgba(255,251,235,0.86) 100%)',
              boxShadow: '0 14px 34px rgba(65, 98, 165, 0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
              <div className="relative flex-1 min-w-0">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchText}
                  onChange={event => setSearchText(event.target.value)}
                  placeholder="搜索题目、知识点、解析或答案"
                  className="w-full h-11 rounded-2xl bg-white/78 border border-white pl-10 pr-4 text-slate-700 outline-none focus:border-sky-300 focus:bg-white transition-colors"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1.5 md:gap-3">
              {FILTERS.map(item => {
                const active = filter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`min-w-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2.5 rounded-2xl md:rounded-full px-1 md:px-4 py-2 md:py-2.5 transition-all active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-sky-400 ${
                      active ? 'text-white' : 'text-slate-600 hover:bg-white/70'
                    }`}
                    style={{
                      fontWeight: 800,
                      fontSize: 'clamp(11px, 3vw, 16px)',
                      background: active ? 'linear-gradient(180deg, #38BDF8 0%, #0EA5E9 100%)' : 'transparent',
                      boxShadow: active ? '0 8px 14px rgba(14, 165, 233, 0.26)' : 'none',
                    }}
                  >
                    <img src={item.icon} alt="" className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0" />
                    <span className="leading-none truncate max-w-full">{item.label}</span>
                    <span className={`leading-none ${active ? 'text-white/85' : 'text-slate-400'}`} style={{ fontSize: '10px', fontWeight: 800 }}>
                      {subjectCounts[item.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredAnswers.length === 0 ? (
            <div className="bg-white/[0.92] rounded-[28px] shadow-lg p-10 md:p-14 text-center border border-white">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={44} className="text-green-500" />
                </div>
              </div>
              <div className="text-xl md:text-2xl mb-2 text-slate-800" style={{ fontWeight: 900 }}>暂无错题</div>
              <div className="text-sm md:text-base text-slate-500">当前筛选下没有错题记录</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnswers.map((answer) => {
                const question = questionMap.get(answer.questionId);
                if (!question) return null;

                const subjectLabel = SUBJECT_LABELS[question.subject] || question.subject;

                return (
                  <article
                    key={answer.questionId}
                    className="relative bg-white/[0.96] rounded-[26px] shadow-lg border border-white overflow-hidden"
                    style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10), inset 0 1px 0 rgba(255,255,255,0.9)' }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-sky-400 via-amber-300 to-emerald-400" />

                    <div className="px-4 pl-5 md:px-6 md:pl-7 py-4 md:py-5">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100" style={{ fontWeight: 900, fontSize: '12px' }}>
                              {subjectLabel}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100" style={{ fontWeight: 800, fontSize: '12px' }}>
                              <Clock3 size={13} />
                              {formatWrongTime(answer.timestamp)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100" style={{ fontWeight: 900, fontSize: '12px' }}>
                              <Target size={14} />
                              {question.knowledgePoint}
                            </span>
                          </div>
                          <div className="mt-3 text-slate-900" style={{ fontWeight: 900, fontSize: 'clamp(18px, 4vw, 24px)', lineHeight: 1.35 }}>
                            {question.question}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRetry(answer.questionId)}
                          className="h-10 md:h-11 px-4 rounded-full text-white inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-sky-400 md:flex-shrink-0"
                          style={{
                            fontWeight: 900,
                            fontSize: '14px',
                            background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
                            boxShadow: '0 7px 13px rgba(245, 158, 11, 0.24), inset 0 1px 0 rgba(255,255,255,0.58)',
                          }}
                        >
                          <RotateCcw size={17} />
                          重做
                        </button>
                      </div>

                      <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-2 px-3 md:px-4 py-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-100 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-rose-400 text-white flex items-center justify-center flex-shrink-0">
                            <XCircle size={19} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-rose-500" style={{ fontSize: '11px', fontWeight: 900 }}>你的答案</div>
                            <div className="truncate" style={{ fontWeight: 900, fontSize: '16px', lineHeight: 1.15 }}>{answer.userAnswer}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 md:px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={19} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-emerald-600" style={{ fontSize: '11px', fontWeight: 900 }}>正确答案</div>
                            <div className="truncate" style={{ fontWeight: 900, fontSize: '16px', lineHeight: 1.15 }}>{question.answer}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid md:grid-cols-2 gap-2.5">
                        <div className="flex items-start gap-3 rounded-2xl px-4 py-3 border border-sky-100" style={{ background: 'linear-gradient(180deg, rgba(240,249,255,0.95) 0%, rgba(255,255,255,0.78) 100%)' }}>
                          <Lightbulb size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sky-700" style={{ fontWeight: 900, fontSize: '13px' }}>解题思路</div>
                            <div className="text-slate-800 mt-1" style={{ fontSize: '14px', lineHeight: 1.55 }}>{question.explanation}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl px-4 py-3 border border-amber-100" style={{ background: 'linear-gradient(180deg, rgba(255,251,235,0.96) 0%, rgba(255,255,255,0.76) 100%)' }}>
                          <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-amber-700" style={{ fontWeight: 900, fontSize: '13px' }}>下次注意</div>
                            <div className="text-slate-800 mt-1" style={{ fontSize: '14px', lineHeight: 1.55 }}>{question.warning}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
