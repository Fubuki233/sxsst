import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, KnowledgeStats } from '../utils/storage';
import { ArrowLeft, BookCheck, ChevronRight, Flame, Gem, Play, Star, Target, Trophy } from 'lucide-react';
import { BottomNav } from './BottomNav';

const seniorWeaknessPalettes = [
  { bg: '#A889F3', accent: '#CBB8FF' },
  { bg: '#87EBCF', accent: '#BDF8EA' },
  { bg: '#ED8F88', accent: '#FFC7C2' },
  { bg: '#FFAF18', accent: '#FFD986' },
  { bg: '#E8669A', accent: '#F59FC2' },
  { bg: '#FF6058', accent: '#FFAAA6' },
];

function getWeaknessSeed(value: string) {
  return value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getSeniorWeaknessCardStyle(value: string) {
  const seed = getWeaknessSeed(value);
  return {
    palette: seniorWeaknessPalettes[seed % seniorWeaknessPalettes.length],
    reward: (seed % 5) + 1,
  };
}

export default function WeaknessPage() {
  const navigate = useNavigate();
  const [weaknesses, setWeaknesses] = useState<KnowledgeStats[]>([]);
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;

  useEffect(() => {
    const stats = storage.getKnowledgeStats();
    setWeaknesses(stats);
  }, []);

  const getStatusInfo = (accuracy: number) => {
    if (accuracy < 60) {
      return { label: '薄弱', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
    } else if (accuracy < 85) {
      return { label: '待巩固', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    } else {
      return { label: '已掌握', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
    }
  };

  if (isLowerGradeStudent) {
    return (
      <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

        <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-4 py-2 text-white ring-1 ring-white/16">
              <div style={{ fontSize: '18px', fontWeight: 900 }}>专项提升</div>
              <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 800 }}>选择一个小关卡开始挑战</div>
            </div>
            <div className="hidden sm:flex h-11 items-center gap-1 rounded-full bg-blue-900/24 px-3 text-white ring-1 ring-white/16">
              <Trophy size={18} className="text-yellow-300" />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{weaknesses.length}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {weaknesses.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-[34px] border-2 border-white/85 bg-white/92 p-6 md:p-8 text-center" style={{ boxShadow: '0 14px 0 rgba(30, 64, 175, 0.16), 0 24px 44px rgba(15, 23, 42, 0.18)' }}>
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[30px] bg-sky-100 border-4 border-white">
                  <BookCheck size={50} className="text-sky-500" />
                </div>
                <div className="text-slate-900" style={{ fontSize: 'clamp(26px, 8vw, 38px)', fontWeight: 900, lineHeight: 1.1 }}>
                  还没有关卡记录
                </div>
                <div className="mt-2 text-slate-500" style={{ fontSize: '15px', fontWeight: 800 }}>
                  先完成几道题，就会出现专属提升关卡
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-6 h-14 w-full rounded-full text-white transition-all active:translate-y-0.5"
                  style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)', boxShadow: '0 7px 0 rgba(194, 91, 0, 0.28)' }}
                >
                  回到大厅
                </button>
              </div>
            ) : (
              <div
                className="rounded-[34px] border-2 border-cyan-100/90 p-3 md:p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(72, 157, 255, 0.78) 0%, rgba(60, 186, 238, 0.58) 100%)',
                  boxShadow: '0 0 0 5px rgba(185, 244, 255, 0.26), 0 20px 44px rgba(9, 73, 142, 0.22), inset 0 2px 0 rgba(255,255,255,0.46)',
                }}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weaknesses.map((stat, index) => {
                    const status = getStatusInfo(stat.accuracy);
                    const stars = Math.ceil(stat.accuracy / 34);
                    return (
                      <article
                        key={stat.knowledgePoint}
                        className="rounded-[26px] border-2 border-white bg-white/94 p-4 min-h-[218px] flex flex-col"
                        style={{ boxShadow: '0 9px 0 rgba(14, 116, 144, 0.12), 0 16px 26px rgba(37, 99, 235, 0.14)' }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 border border-sky-100" style={{ fontSize: '12px', fontWeight: 900 }}>
                            第{index + 1}关
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 3 }).map((_, starIndex) => {
                              const filled = stars > starIndex;
                              return (
                                <Star
                                  key={starIndex}
                                  size={15}
                                  className={filled ? 'text-amber-400' : 'text-slate-300'}
                                  style={{ fill: filled ? 'currentColor' : 'none' }}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4 flex items-start gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] bg-amber-100 border-2 border-white">
                            <Flame size={30} className="text-orange-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-slate-900" style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1.2 }}>{stat.knowledgePoint}</div>
                            <div className={`mt-2 inline-flex rounded-full px-3 py-1 ${status.bg} ${status.color}`} style={{ fontSize: '12px', fontWeight: 900 }}>
                              {status.label} · {stat.accuracy}%
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 h-3 rounded-full bg-slate-100 p-0.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-emerald-300"
                            style={{ width: `${stat.accuracy}%` }}
                          />
                        </div>

                        <button
                          onClick={() => navigate(`/lesson/knowledge/${encodeURIComponent(stat.knowledgePoint)}`)}
                          className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-full text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-amber-300"
                          style={{ background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)', boxShadow: '0 6px 0 rgba(194, 91, 0, 0.28)', fontSize: '18px', fontWeight: 900 }}
                        >
                          去挑战
                          <ChevronRight size={21} strokeWidth={3} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col relative overflow-hidden [background:var(--senior-page-bg)] text-white">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#4E4248]/85 to-transparent" />

      <div className="relative z-10 flex-1 overflow-auto px-4 pt-7 pb-7">
        <div className="mx-auto w-full max-w-[480px]">
          <header className="mb-7">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-5 flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-white/82 transition-colors hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft size={16} />
              <span style={{ fontSize: '13px', fontWeight: 800 }}>返回</span>
            </button>
            <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '42px', fontWeight: 900, lineHeight: 1, letterSpacing: 0 }}>
              薄弱训练
            </h1>
            <div className="mt-4 flex items-center gap-3 text-white/62" style={{ fontSize: '14px', fontWeight: 700 }}>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3">
                <Target size={16} />
                {weaknesses.length} 个待提升点
              </span>
              <span className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3">
                <Flame size={16} />
                专项重练
              </span>
            </div>
          </header>

          {weaknesses.length === 0 ? (
            <div className="rounded-[8px] bg-white/10 px-6 py-12 text-center">
              <BookCheck size={46} className="mx-auto text-[#87EBCF]" />
              <div className="mt-4 text-white" style={{ fontSize: '22px', fontWeight: 900 }}>还没有做题记录</div>
              <div className="mt-2 text-white/55" style={{ fontSize: '14px', fontWeight: 700 }}>开始答题后，系统会自动分析你的薄弱知识点</div>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-6 h-12 rounded-full px-7 text-white transition-transform active:scale-[0.98]"
                style={{ fontWeight: 900, background: '#A889F3' }}
              >
                返回发现
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {weaknesses.map((stat, index) => {
                const status = getStatusInfo(stat.accuracy);
                const card = getSeniorWeaknessCardStyle(stat.knowledgePoint);
                return (
                  <button
                    key={stat.knowledgePoint}
                    onClick={() => navigate(`/graded-practice/${encodeURIComponent(stat.knowledgePoint)}`)}
                    className="relative block h-[188px] w-full overflow-hidden rounded-[8px] p-4 text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
                    style={{ background: card.palette.bg }}
                  >
                    <div className="absolute right-[-54px] bottom-[-48px] h-40 w-40 rounded-full opacity-85" style={{ background: card.palette.accent }} />
                    <div className="relative z-10 flex h-9 w-fit items-center gap-1.5 rounded-full bg-white/25 px-3 text-white">
                      <Gem size={18} style={{ fill: 'rgba(255,255,255,0.28)' }} />
                      <span style={{ fontSize: '16px', fontWeight: 900 }}>{card.reward}</span>
                    </div>
                    <div className="relative z-10 mt-5 text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '26px', fontWeight: 900, lineHeight: 1.08 }}>
                      {stat.knowledgePoint}
                    </div>
                    <div className="relative z-10 mt-3 inline-flex rounded-full bg-white/22 px-3 py-1 text-white" style={{ fontSize: '12px', fontWeight: 900 }}>
                      {status.label} · {stat.accuracy}%
                    </div>
                    <div className="relative z-10 mt-4 h-2 rounded-full bg-[#2B2B2E]/22">
                      <div className="h-full rounded-full bg-white/78" style={{ width: `${stat.accuracy}%` }} />
                    </div>
                    <div className="relative z-10 mt-3 text-white/72" style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.45 }}>
                      已练习 {stat.total} 题 · 答对 {stat.correct} 题
                    </div>
                    <div className="absolute bottom-4 left-4 z-10 flex h-9 items-center gap-1 rounded-full bg-[#2B2B2E]/34 px-3 text-white backdrop-blur-sm">
                      <Play size={14} fill="currentColor" />
                      <span style={{ fontSize: '12px', fontWeight: 900 }}>训练</span>
                    </div>
                    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-0.5">
                      {Array.from({ length: 3 }).map((_, starIndex) => {
                        const filled = Math.ceil(stat.accuracy / 34) > starIndex;
                        return (
                          <Star
                            key={starIndex}
                            size={14}
                            className={filled ? 'text-white' : 'text-white/34'}
                            style={{ fill: filled ? 'currentColor' : 'none' }}
                          />
                        );
                      })}
                    </div>
                  </button>
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
