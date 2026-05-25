import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { getAllQuestions, getRandomKnowledgeQuestion } from '../utils/questions';
import { storage, Question } from '../utils/storage';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, AlertCircle, TrendingUp, Sparkles, Star, Trophy } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function GradedPracticePage() {
  const { knowledgeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const knowledgePoint = decodeURIComponent(knowledgeId || '');
  const retryQuestionId = searchParams.get('retryQuestionId');
  const fromWrongQuestions = searchParams.get('from') === 'wrong-questions';
  const isRetryMode = Boolean(retryQuestionId);

  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [difficultyStats, setDifficultyStats] = useState({
    easy: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    hard: { total: 0, correct: 0 }
  });
  const [, setUnlockedDifficulties] = useState<Difficulty[]>(['easy']);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelCompleteData, setLevelCompleteData] = useState<{difficulty: Difficulty, total: number, correct: number, accuracy: number, canUpgrade: boolean} | null>(null);
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;

  useEffect(() => {
    loadNextQuestion();
  }, [currentDifficulty, questionNumber, retryQuestionId]);

  const loadNextQuestion = () => {
    if (retryQuestionId && questionNumber === 1) {
      const retryQuestion = getAllQuestions().find(q => q.id === retryQuestionId);
      if (retryQuestion) {
        setCurrentQuestion(retryQuestion);
        setCurrentDifficulty(retryQuestion.difficulty as Difficulty);
        setSelectedAnswer('');
        setSubmitted(false);
        setShowResult(false);
        setAskedQuestions([retryQuestion.id]);
        return;
      }
    }

    const question = getRandomKnowledgeQuestion(knowledgePoint, currentDifficulty, askedQuestions);
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setSubmitted(false);
      setShowResult(false);
      setAskedQuestions([...askedQuestions, question.id]);
    } else {
      // 题目不足，显示关卡完成界面
      const stats = difficultyStats[currentDifficulty];
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const canUpgrade = accuracy >= 80 && stats.total >= 3;
      
      setLevelCompleteData({
        difficulty: currentDifficulty,
        total: stats.total,
        correct: stats.correct,
        accuracy,
        canUpgrade
      });
      setShowLevelComplete(true);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    setSubmitted(true);
    setShowResult(true);

    storage.saveAnswer({
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect: correct,
      timestamp: Date.now(),
      knowledgePoint: currentQuestion.knowledgePoint,
      difficulty: currentQuestion.difficulty
    });

    if (correct && retryQuestionId === currentQuestion.id) {
      storage.removeWrongQuestion(currentQuestion.id);
    }

    const newStats = { ...difficultyStats };
    newStats[currentDifficulty].total++;
    if (correct) newStats[currentDifficulty].correct++;
    setDifficultyStats(newStats);

    const accuracy = (newStats[currentDifficulty].correct / newStats[currentDifficulty].total) * 100;

    if (currentDifficulty === 'easy' && accuracy >= 80 && newStats.easy.total >= 3) {
      setUnlockedDifficulties(prev => prev.includes('medium') ? prev : [...prev, 'medium']);
    } else if (currentDifficulty === 'medium' && accuracy >= 80 && newStats.medium.total >= 3) {
      setUnlockedDifficulties(prev => prev.includes('hard') ? prev : [...prev, 'hard']);
    }
  };

  const handleNext = () => {
    if (!submitted) return;

    if (isRetryMode) {
      navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness');
      return;
    }

    setQuestionNumber(prev => prev + 1);
  };

  const handlePrimaryAction = () => {
    if (!submitted) {
      handleSubmit();
      return;
    }
    handleNext();
  };

  if (!currentQuestion) return null;

  // 如果显示关卡完成页面
  if (showLevelComplete && levelCompleteData) {
    const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };
    const nextDifficulty: { [key in Difficulty]: Difficulty | null } = { easy: 'medium', medium: 'hard', hard: null };
    const canUpgradeToNext = nextDifficulty[levelCompleteData.difficulty] !== null;

    if (isLowerGradeStudent) {
      return (
        <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

          <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button
                onClick={() => navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness')}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-4 py-2 text-white ring-1 ring-white/16">
                <div style={{ fontSize: '18px', fontWeight: 900 }}>关卡奖励</div>
                <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 800 }}>{knowledgePoint}</div>
              </div>
            </div>
          </header>

          <div className="relative z-10 flex-1 overflow-auto flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-xl rounded-[34px] border-2 border-white/85 bg-white/92 p-6 md:p-8 text-center" style={{ boxShadow: '0 14px 0 rgba(30, 64, 175, 0.16), 0 24px 44px rgba(15, 23, 42, 0.18)' }}>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[30px] bg-amber-100 border-4 border-white">
                <Trophy size={54} className="text-amber-500" />
              </div>
              <div className="text-slate-900" style={{ fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 900, lineHeight: 1.05 }}>
                关卡完成
              </div>
              <div className="mt-2 text-slate-500" style={{ fontSize: '15px', fontWeight: 800 }}>
                {difficultyLabels[levelCompleteData.difficulty]}难度 · 答对 {levelCompleteData.correct}/{levelCompleteData.total}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => {
                  const filled = levelCompleteData.accuracy >= (index + 1) * 30;
                  return (
                    <div key={index} className={`h-14 rounded-2xl border-2 flex items-center justify-center ${filled ? 'bg-amber-100 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                      <Star size={28} style={{ fill: filled ? 'currentColor' : 'none' }} />
                    </div>
                  );
                })}
              </div>

              <div className={`mt-5 rounded-2xl px-4 py-3 ${levelCompleteData.canUpgrade ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} style={{ fontWeight: 900 }}>
                {levelCompleteData.canUpgrade ? '表现很棒，可以挑战下一关' : '再练一次，把星星点亮'}
              </div>

              <div className="mt-6 space-y-3">
                {levelCompleteData.canUpgrade && canUpgradeToNext && (
                  <button
                    onClick={() => {
                      const next = nextDifficulty[levelCompleteData.difficulty];
                      if (next) {
                        setCurrentDifficulty(next);
                        setUnlockedDifficulties(prev => prev.includes(next) ? prev : [...prev, next]);
                        setShowLevelComplete(false);
                        setLevelCompleteData(null);
                        setQuestionNumber(1);
                        setAskedQuestions([]);
                      }
                    }}
                    className="w-full h-14 rounded-full text-white transition-all active:translate-y-0.5"
                    style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)', boxShadow: '0 7px 0 rgba(194, 91, 0, 0.28)' }}
                  >
                    下一关
                  </button>
                )}
                <button
                  onClick={() => {
                    const resetStats = { ...difficultyStats };
                    resetStats[levelCompleteData.difficulty] = { total: 0, correct: 0 };
                    setDifficultyStats(resetStats);
                    setShowLevelComplete(false);
                    setLevelCompleteData(null);
                    setQuestionNumber(1);
                    setAskedQuestions([]);
                  }}
                  className="w-full h-14 rounded-full bg-sky-500 text-white transition-all active:translate-y-0.5"
                  style={{ fontSize: '18px', fontWeight: 900, boxShadow: '0 6px 0 rgba(2, 132, 199, 0.28)' }}
                >
                  再玩一次
                </button>
                <button
                  onClick={() => navigate('/weakness')}
                  className="w-full h-12 rounded-full bg-slate-100 text-slate-600"
                  style={{ fontSize: '16px', fontWeight: 900 }}
                >
                  返回关卡
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
        <div className="bg-white shadow-sm px-4 md:px-8 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">关卡完成</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
              <div className="mb-6">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {difficultyLabels[levelCompleteData.difficulty]}难度已完成！
                </h2>
              </div>

              {/* 成绩统计 */}
              <div className="bg-blue-50 rounded-xl p-6 mb-8">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{levelCompleteData.accuracy}%</div>
                    <div className="text-sm text-gray-600 mt-1">正确率</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{levelCompleteData.correct}</div>
                    <div className="text-sm text-gray-600 mt-1">做对题数</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-600">{levelCompleteData.total}</div>
                    <div className="text-sm text-gray-600 mt-1">总做题数</div>
                  </div>
                </div>

                {/* 是否达到升级要求 */}
                <div className={`py-3 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 ${
                  levelCompleteData.canUpgrade 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {levelCompleteData.canUpgrade ? (
                    <>
                      <TrendingUp size={18} />
                      <span>恭喜！达到升级要求，可以进入下一难度</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} />
                      <span>需要正确率≥80%且做题数≥3题才能升级</span>
                    </>
                  )}
                </div>
              </div>

              {/* 按钮组 */}
              <div className="space-y-3">
                {levelCompleteData.canUpgrade && canUpgradeToNext && (
                  <button
                    onClick={() => {
                      const next = nextDifficulty[levelCompleteData.difficulty];
                      if (next) {
                        setCurrentDifficulty(next);
                        setUnlockedDifficulties(prev => prev.includes(next) ? prev : [...prev, next]);
                        setShowLevelComplete(false);
                        setLevelCompleteData(null);
                        setQuestionNumber(1);
                        setAskedQuestions([]);
                      }
                    }}
                    className="w-full bg-green-500 text-white py-4 rounded-2xl hover:bg-green-600 transition-colors shadow-sm font-bold text-lg"
                  >
                    进入下一难度
                  </button>
                )}

                <button
                  onClick={() => {
                    // 重新做这一难度，重置统计
                    const resetStats = { ...difficultyStats };
                    resetStats[levelCompleteData.difficulty] = { total: 0, correct: 0 };
                    setDifficultyStats(resetStats);
                    setShowLevelComplete(false);
                    setLevelCompleteData(null);
                    setQuestionNumber(1);
                    setAskedQuestions([]);
                  }}
                  className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors shadow-sm font-bold text-lg"
                >
                  重新做这一难度
                </button>

                <button
                  onClick={() => navigate('/weakness')}
                  className="w-full bg-gray-300 text-gray-700 py-4 rounded-2xl hover:bg-gray-400 transition-colors shadow-sm font-bold text-lg"
                >
                  返回薄弱知识点
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLowerGradeStudent) {
    const answeredCount = difficultyStats[currentDifficulty].total;

    return (
      <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

        <header className="relative z-10 px-3 md:px-8 pt-3 pb-2 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness')}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
            >
              <ArrowLeft size={21} />
            </button>
            <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-3 py-2 text-white ring-1 ring-white/16">
              <div className="truncate" style={{ fontSize: '17px', fontWeight: 900 }}>{isRetryMode ? '错题再挑战' : knowledgePoint}</div>
              <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 800 }}>第 {questionNumber} 题</div>
            </div>
            <div className="hidden sm:flex h-10 items-center gap-1 rounded-full bg-blue-900/24 px-3 text-white ring-1 ring-white/16">
              <Star size={18} className="text-yellow-300" style={{ fill: 'currentColor' }} />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{difficultyStats[currentDifficulty].correct}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-hidden p-3 md:p-5 min-h-0">
          <div className="max-w-5xl mx-auto h-full min-h-0 flex flex-col gap-3">
            <div className="rounded-[30px] border-2 border-white/85 bg-white/94 p-3 md:p-5 flex-shrink-0" style={{ boxShadow: '0 10px 0 rgba(30,64,175,0.14), 0 16px 30px rgba(15,23,42,0.16)' }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 border border-sky-100" style={{ fontSize: '13px', fontWeight: 900 }}>
                  <Sparkles size={16} />
                  小挑战
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Star key={index} size={17} className={answeredCount > index ? 'text-amber-400' : 'text-slate-300'} style={{ fill: answeredCount > index ? 'currentColor' : 'none' }} />
                  ))}
                </div>
              </div>

              <div className="text-slate-900 mb-3 md:mb-5" style={{ fontSize: 'clamp(22px, 5.6vw, 34px)', fontWeight: 900, lineHeight: 1.2 }}>
                {currentQuestion.question}
              </div>

              {currentQuestion.options ? (
                <div className="grid gap-2 md:gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !submitted && setSelectedAnswer(option)}
                      disabled={submitted}
                      className={`w-full text-left px-4 md:px-5 ${submitted ? 'py-2.5 md:py-3' : 'py-3 md:py-3.5'} rounded-[20px] border-2 transition-all flex items-center active:translate-y-0.5 ${
                        submitted
                          ? option === currentQuestion.answer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : selectedAnswer === option
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-white border-slate-100 text-slate-400'
                          : selectedAnswer === option
                          ? 'bg-sky-500 text-white border-sky-500'
                          : 'bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50'
                      } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ fontSize: '17px', fontWeight: 900, boxShadow: !submitted && selectedAnswer === option ? '0 6px 0 rgba(2, 132, 199, 0.22)' : undefined }}
                    >
                      <span className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-current" style={{ fontWeight: 900 }}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={submitted}
                  className="w-full px-5 py-4 border-2 border-sky-100 rounded-[22px] focus:border-sky-400 focus:outline-none"
                  style={{ fontSize: '18px', fontWeight: 800 }}
                  placeholder="把答案写在这里"
                />
              )}
            </div>

            {showResult && (
              <div className="rounded-[22px] border-2 border-white/85 bg-white/94 px-3 py-2.5 md:px-4 flex-shrink-0" style={{ boxShadow: '0 7px 0 rgba(30,64,175,0.08)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`} style={{ fontSize: '18px', fontWeight: 900 }}>
                    {isCorrect ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    {isCorrect ? '答对啦！' : '差一点'}
                  </div>
                  {!isCorrect && (
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700" style={{ fontSize: '14px', fontWeight: 900 }}>
                      正确答案：{currentQuestion.answer}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-slate-700" style={{ fontSize: '13px', fontWeight: 800 }}>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">知识点：{currentQuestion.knowledgePoint}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">提示：{currentQuestion.warning}</span>
                </div>
              </div>
            )}

            <button
              onClick={handlePrimaryAction}
              disabled={!selectedAnswer}
              className="w-full h-[52px] min-h-[52px] rounded-full text-white transition-all disabled:bg-slate-300 disabled:cursor-not-allowed active:translate-y-0.5 flex-shrink-0"
              style={{
                fontSize: '19px',
                fontWeight: 900,
                background: selectedAnswer ? 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)' : undefined,
                boxShadow: selectedAnswer ? '0 7px 0 rgba(194, 91, 0, 0.28), inset 0 2px 0 rgba(255,255,255,0.52)' : undefined,
                textShadow: selectedAnswer ? '0 1px 0 rgba(154, 52, 18, 0.22)' : undefined,
              }}
            >
              {!submitted ? '检查答案' : isRetryMode ? '完成并返回' : '下一题'}
            </button>

            {showResult && (
              <div className="rounded-[20px] border border-white/85 bg-white/88 px-4 py-2.5 text-slate-700 flex-shrink-0" style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.45 }}>
                <span className="text-sky-700" style={{ fontWeight: 900 }}>解析：</span>
                <span className="ml-1">{currentQuestion.explanation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <div className="px-4 md:px-8 pt-3 pb-2 flex-shrink-0">
        <div
          className="max-w-4xl mx-auto rounded-[22px] border border-white/85 px-3 py-2.5 md:px-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.94) 58%, rgba(255,251,235,0.86) 100%)',
            boxShadow: '0 12px 28px rgba(65, 98, 165, 0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/75 hover:bg-white transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 truncate" style={{ fontWeight: 900, fontSize: '16px' }}>
              {isRetryMode ? '重做错题' : `专项刷题：${knowledgePoint}`}
            </div>
            <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>第 {questionNumber} 题 · {currentQuestion.knowledgePoint}</div>
          </div>
        </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3 md:p-5 min-h-0">
        <div className="max-w-4xl mx-auto h-full min-h-0 flex flex-col gap-3">
          <div
            className="bg-white/[0.96] rounded-[26px] shadow-sm p-4 md:p-6 border border-white flex-shrink-0"
            style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10), inset 0 1px 0 rgba(255,255,255,0.9)' }}
          >
            <div className="text-slate-900 mb-4 md:mb-5 leading-relaxed" style={{ fontSize: 'clamp(20px, 4.4vw, 28px)', fontWeight: 900 }}>{currentQuestion.question}</div>

            {currentQuestion.options ? (
              <div className="space-y-2.5 md:space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={`w-full text-left px-4 md:px-5 ${submitted ? 'py-2.5 md:py-3' : 'py-3 md:py-3.5'} rounded-2xl border transition-all flex items-center active:scale-[0.99] ${
                      submitted
                        ? option === currentQuestion.answer
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : selectedAnswer === option
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'border-gray-200 text-gray-500'
                        : selectedAnswer === option
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                    } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ fontSize: '16px', fontWeight: 800 }}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg border border-current mr-3 text-sm font-semibold" style={{ opacity: submitted ? 0.6 : 1 }}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={submitted}
                className="w-full px-4 md:px-6 py-3 md:py-4 border border-gray-200 rounded-2xl focus:border-sky-400 focus:outline-none"
                style={{ fontSize: '16px' }}
                placeholder="请输入答案"
              />
            )}
          </div>

          {showResult && (
            <div className={`bg-white/[0.96] rounded-[20px] shadow-sm px-3 py-2.5 md:px-4 border border-white border-l-4 flex-shrink-0 ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={`flex items-center gap-2 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}
                  style={{ fontSize: '16px', fontWeight: 900 }}>
                  {isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
                  {isCorrect ? '回答正确' : '回答错误'}
                </div>
                {!isCorrect && (
                  <div className="rounded-full bg-emerald-50 px-3 py-1" style={{ fontSize: '14px' }}>
                    正确答案：<span className="text-green-600" style={{ fontWeight: 800 }}>{currentQuestion.answer}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2" style={{ fontSize: '13px', fontWeight: 700 }}>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">知识点：{currentQuestion.knowledgePoint}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">提醒：{currentQuestion.warning}</span>
              </div>
            </div>
          )}

          <button
            onClick={handlePrimaryAction}
            disabled={!selectedAnswer}
            className="w-full h-[50px] min-h-[50px] text-white rounded-2xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm active:scale-[0.99] flex-shrink-0"
            style={{
              fontSize: '16px',
              fontWeight: 900,
              background: selectedAnswer ? (submitted ? 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)' : 'linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)') : undefined,
            }}
          >
            {!submitted ? '提交答案' : isRetryMode ? '完成并返回' : '下一题'}
          </button>

          {showResult && (
            <div className="bg-white/[0.92] rounded-[18px] px-4 py-2.5 border border-white flex-shrink-0 text-slate-700" style={{ fontSize: '13px', lineHeight: 1.45 }}>
              <Lightbulb size={16} className="inline-block text-blue-500 mr-1 align-[-3px]" />
              <span className="text-blue-500" style={{ fontWeight: 800 }}>解析：</span>
              <span className="ml-1">{currentQuestion.explanation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
