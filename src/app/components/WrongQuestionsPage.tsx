import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../utils/storage';
import { getAllQuestions } from '../utils/questions';
import { AlertCircle, CheckCircle, Info, Lightbulb, RotateCcw, XCircle } from 'lucide-react';
import { BottomNav } from './BottomNav';

const ASSET = '/assets/';
const BOT_ICON = `${ASSET}bot.png`;
const LANDSCAPE_BG = `${ASSET}横屏背景图.png`;
const PORTRAIT_BG = `${ASSET}竖屏背景图.png`;

const FILTERS = [
  { id: 'all', label: '全部', icon: `${ASSET}all.png` },
  { id: 'math', label: '数学', icon: `${ASSET}math.png` },
  { id: 'english', label: '英语', icon: `${ASSET}eng.png` },
  { id: 'physics', label: '物理', icon: `${ASSET}phy.png` },
  { id: 'chemistry', label: '化学', icon: `${ASSET}chem.png` },
];

export default function WrongQuestionsPage() {
  const navigate = useNavigate();
  const [wrongAnswers, setWrongAnswers] = useState<Answer[]>([]);
  const [filter, setFilter] = useState<string>('all');

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
    navigate(`/graded-practice/${encodeURIComponent(question.knowledgePoint)}?retryQuestionId=${encodeURIComponent(questionId)}&from=wrong-questions`);
  };

  const uniqueWrongAnswers = wrongAnswers.filter((answer, index, self) =>
    index === self.findIndex(a => a.questionId === answer.questionId)
  );

  const filteredAnswers = filter === 'all'
    ? uniqueWrongAnswers
    : uniqueWrongAnswers.filter(answer => questionMap.get(answer.questionId)?.subject === filter);

  return (
    <div
      className="size-full flex flex-col relative overflow-hidden"
      style={{ background: '#EEF4FF' }}
    >
      <picture className="absolute inset-0 block pointer-events-none">
        <source media="(orientation: landscape)" srcSet={LANDSCAPE_BG} />
        <img src={PORTRAIT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-white/10" />

      <div className="relative z-10 flex-1 overflow-auto px-3 md:px-8 pt-4 md:pt-5 pb-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-white/90 rounded-[28px] md:rounded-full shadow-lg px-2 py-2.5 md:px-3 md:py-3 grid grid-cols-5 gap-1.5 md:gap-4 border border-white">
            {FILTERS.map(item => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`min-w-0 flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2.5 rounded-2xl md:rounded-full px-1 md:px-4 py-2 md:py-2.5 transition-all ${
                    active ? 'text-white' : 'text-slate-700 hover:bg-blue-50'
                  }`}
                  style={{
                    fontWeight: 800,
                    fontSize: 'clamp(11px, 3vw, 17px)',
                    background: active ? 'linear-gradient(180deg, #6897FF 0%, #3E6DF3 100%)' : 'transparent',
                    boxShadow: active ? '0 8px 14px rgba(54, 100, 229, 0.28)' : 'none',
                  }}
                >
                  <img src={item.icon} alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0" />
                  <span className="leading-none truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
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
            <div className="space-y-5">
              {filteredAnswers.map((answer, cardIndex) => {
                const question = questionMap.get(answer.questionId);
                if (!question) return null;

                const showBot = cardIndex === 0;

                return (
                  <div key={answer.questionId} className="relative bg-white/[0.94] rounded-[28px] shadow-lg border border-white overflow-hidden">
                    {showBot && (
                      <img
                        src={BOT_ICON}
                        alt=""
                        className="absolute right-2 top-3 w-24 sm:right-8 sm:top-0 sm:w-32 md:w-40 object-contain pointer-events-none"
                      />
                    )}

                    <div className="px-4 md:px-8 py-6 md:py-8">
                      <div className={`relative ${showBot ? 'pr-24 sm:pr-40 min-h-[92px] sm:min-h-[120px] md:min-h-[132px]' : ''}`}>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-500" style={{ fontWeight: 800, fontSize: 'clamp(12px, 3.2vw, 14px)' }}>
                          单选题
                        </span>
                        <div className="mt-5 text-slate-800" style={{ fontWeight: 900, fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: 1.2 }}>
                          {question.question}
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-green-100 bg-white">
                        <div className="flex items-center gap-2 px-3 md:px-4 py-3 md:py-4 bg-gradient-to-r from-red-50 to-white text-red-600 border-l-4 border-red-500 min-w-0">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-400 text-white flex items-center justify-center flex-shrink-0">
                            <XCircle size={20} className="md:w-[22px] md:h-[22px]" />
                          </div>
                          <span className="min-w-0 truncate" style={{ fontWeight: 900, fontSize: 'clamp(13px, 3.5vw, 18px)' }}>你的答案：{answer.userAnswer}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 md:px-4 py-3 md:py-4 bg-gradient-to-r from-green-50 to-white text-green-600 min-w-0">
                          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-400 text-white flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={20} className="md:w-[22px] md:h-[22px]" />
                          </div>
                          <span className="min-w-0 truncate" style={{ fontWeight: 900, fontSize: 'clamp(13px, 3.5vw, 18px)' }}>正确答案：{question.answer}</span>
                        </div>
                      </div>

                      <div className="mt-5 bg-slate-50/[0.95] rounded-[24px] px-5 py-5 space-y-4 border border-blue-50">
                        <div className="flex items-start gap-3">
                          <Info size={22} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-blue-500" style={{ fontWeight: 800 }}>所属知识点：</span>
                            <span className="ml-3 text-slate-800">{question.knowledgePoint}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Lightbulb size={22} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-blue-500" style={{ fontWeight: 800 }}>知识点解析：</span>
                            <span className="ml-3 text-slate-800">{question.explanation}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <AlertCircle size={22} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-blue-500" style={{ fontWeight: 800 }}>易错提醒：</span>
                            <span className="ml-3 text-slate-800">{question.warning}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => handleRetry(answer.questionId)}
                          className="h-11 px-5 rounded-full text-white inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                          style={{
                            fontWeight: 900,
                            fontSize: '15px',
                            background: 'linear-gradient(180deg, #7EA7FF 0%, #4E7DF5 100%)',
                            boxShadow: '0 6px 12px rgba(70, 115, 238, 0.22), inset 0 1px 0 rgba(255,255,255,0.5)',
                          }}
                        >
                          <RotateCcw size={18} />
                          重做本题
                        </button>
                      </div>
                    </div>
                  </div>
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
