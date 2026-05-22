import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, KnowledgeStats } from '../utils/storage';
import { ArrowLeft, BookCheck, ChevronRight, Flame, Star, Target, Trophy } from 'lucide-react';

const LANDSCAPE_BG = '/assets/横屏背景图.png';
const PORTRAIT_BG = '/assets/竖屏背景图.png';

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
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: '#EEF4FF' }}>
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/20" />

      <header className="relative z-10 px-4 md:px-8 pt-3 pb-2 flex-shrink-0">
        <div
          className="max-w-4xl mx-auto rounded-[24px] border border-white/85 px-3 py-3 md:px-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.94) 58%, rgba(255,251,235,0.86) 100%)',
            boxShadow: '0 12px 28px rgba(65, 98, 165, 0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/75 hover:bg-white transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 mb-2" style={{ fontSize: '12px', fontWeight: 900 }}>
                <Target size={14} />
                薄弱训练
              </div>
              <h1 className="text-slate-900" style={{ fontWeight: 900, fontSize: 'clamp(20px, 5vw, 28px)', lineHeight: 1.15 }}>优先攻克薄弱点</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {weaknesses.length === 0 ? (
            <div className="bg-white/[0.96] rounded-[28px] shadow-sm p-8 md:p-12 text-center border border-white" style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10)' }}>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-sky-100 rounded-full flex items-center justify-center">
                  <BookCheck size={40} className="text-sky-500 md:w-12 md:h-12" />
                </div>
              </div>
              <div className="text-xl md:text-2xl mb-2" style={{ fontWeight: 900 }}>还没有做题记录</div>
              <div className="text-sm md:text-base text-gray-500 mb-6">开始答题后，系统会自动分析你的薄弱知识点</div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg rounded-xl transition-all active:scale-[0.98]"
                style={{ fontWeight: 900, background: 'linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)' }}
              >
                去做题
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {weaknesses.map((stat, index) => {
                const status = getStatusInfo(stat.accuracy);
                const barColor = stat.accuracy < 60 ? '#F43F5E' : stat.accuracy < 85 ? '#F59E0B' : '#22C55E';
                return (
                  <button
                    key={stat.knowledgePoint}
                    onClick={() => navigate(`/graded-practice/${encodeURIComponent(stat.knowledgePoint)}`)}
                    className="w-full bg-white/[0.96] rounded-[24px] shadow-sm border border-white overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-sky-400"
                    style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10)' }}
                  >
                    <div className="px-4 md:px-5 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0" style={{ fontWeight: 900 }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <span className="text-base md:text-xl text-slate-900" style={{ fontWeight: 900 }}>{stat.knowledgePoint}</span>
                          <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6 text-xs md:text-base text-gray-500 flex-wrap">
                          <span>正确率 {stat.accuracy}%</span>
                          <span>已练习 {stat.total} 题</span>
                          <span>答对 {stat.correct} 题</span>
                        </div>
                        <div className="mt-2 md:mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${stat.accuracy}%`, background: barColor }}
                          />
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0 text-sky-600" style={{ fontWeight: 900 }}>
                        去训练
                        <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
