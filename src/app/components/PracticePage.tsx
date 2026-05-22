import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getQuestionsByChapter, SUBJECTS, CHAPTERS } from '../utils/questions';
import { storage, Question } from '../utils/storage';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, AlertCircle, Info, Award, TrendingUp, Lock, Sparkles, Star, Trophy } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

const nextDifficultyMap: Record<Difficulty, Difficulty | null> = {
  easy: 'medium',
  medium: 'hard',
  hard: null
};

export default function PracticePage() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  // ── Difficulty progression ──
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [difficultyStats, setDifficultyStats] = useState({ easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } });
  const [unlockedDifficulties, setUnlockedDifficulties] = useState<Difficulty[]>(['easy']);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [practiceRound, setPracticeRound] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [sessionStats, setSessionStats] = useState({ total: 0, correct: 0, questions: [] as Question[], wrongs: [] as { q: Question; userAnswer: string }[] });
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;

  const subject = SUBJECTS.find(s => s.id === subjectId);
  const chapter = CHAPTERS[subjectId || '']?.find(c => c.id === chapterId);
  const totalQuestions = 10;

  useEffect(() => {
    loadNextQuestion();
  }, [currentDifficulty, questionNumber, practiceRound]);

  const loadNextQuestion = () => {
    if (!subjectId || !chapterId) return;

    if (questionNumber > totalQuestions) {
      setShowReport(true);
      return;
    }

    const chapterQuestions = getQuestionsByChapter(subjectId, chapterId);
    const filtered = chapterQuestions.filter(q => q.difficulty === currentDifficulty && !askedQuestions.includes(q.id));
    if (filtered.length === 0) {
      setShowReport(true);
      return;
    }
    const question = filtered[Math.floor(Math.random() * filtered.length)];
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setSubmitted(false);
      setShowResult(false);
      setAskedQuestions([...askedQuestions, question.id]);
      setSessionStats(prev => ({ ...prev, questions: [...prev.questions, question] }));
    } else {
      setShowReport(true);
    }
  };

  const checkUnlock = (stats: typeof difficultyStats, difficulty: Difficulty) => {
    if (difficulty === 'easy' && stats.easy.total >= 3) {
      const acc = Math.round((stats.easy.correct / stats.easy.total) * 100);
      if (acc >= 80) {
        setUnlockedDifficulties(prev => prev.includes('medium') ? prev : [...prev, 'medium']);
      }
    } else if (difficulty === 'medium' && stats.medium.total >= 3) {
      const acc = Math.round((stats.medium.correct / stats.medium.total) * 100);
      if (acc >= 80) {
        setUnlockedDifficulties(prev => prev.includes('hard') ? prev : [...prev, 'hard']);
      }
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

    const newStats = { ...difficultyStats };
    newStats[currentDifficulty] = { total: newStats[currentDifficulty].total + 1, correct: newStats[currentDifficulty].correct + (correct ? 1 : 0) };
    setDifficultyStats(newStats);

    setSessionStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      questions: prev.questions,
      wrongs: correct ? prev.wrongs : [...prev.wrongs, { q: currentQuestion, userAnswer: selectedAnswer }],
    }));

    checkUnlock(newStats, currentDifficulty);
  };

  const handleNext = () => {
    if (!submitted) return;
    setQuestionNumber(prev => prev + 1);
  };

  const handlePrimaryAction = () => {
    if (!submitted) {
      handleSubmit();
      return;
    }
    handleNext();
  };

  const handleContinuePractice = () => {
    const stats = difficultyStats[currentDifficulty];
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const nextDifficulty = nextDifficultyMap[currentDifficulty];
    const shouldUpgrade = Boolean(nextDifficulty && stats.total >= 3 && accuracy >= 80);
    const targetDifficulty = shouldUpgrade ? nextDifficulty! : currentDifficulty;

    setCurrentQuestion(null);
    setSelectedAnswer('');
    setSubmitted(false);
    setShowResult(false);
    setShowReport(false);
    setSessionStats({ total: 0, correct: 0, questions: [], wrongs: [] });
    setAskedQuestions([]);
    setQuestionNumber(1);

    if (shouldUpgrade) {
      setCurrentDifficulty(targetDifficulty);
      setUnlockedDifficulties(prev => prev.includes(targetDifficulty) ? prev : [...prev, targetDifficulty]);
    } else {
      setDifficultyStats(prev => ({
        ...prev,
        [currentDifficulty]: { total: 0, correct: 0 }
      }));
    }

    setPracticeRound(prev => prev + 1);
  };

  if (!subject || !chapter) return null;

  const difficulties: { level: Difficulty; label: string; color: string }[] = [
    { level: 'easy', label: '简单', color: 'bg-green-500' },
    { level: 'medium', label: '中等', color: 'bg-yellow-500' },
    { level: 'hard', label: '困难', color: 'bg-red-500' }
  ];

  if (showReport) {
    const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const currentLevelStats = difficultyStats[currentDifficulty];
    const currentLevelAccuracy = currentLevelStats.total > 0 ? Math.round((currentLevelStats.correct / currentLevelStats.total) * 100) : 0;
    const nextDifficulty = nextDifficultyMap[currentDifficulty];
    const canContinueToNextDifficulty = Boolean(nextDifficulty && currentLevelStats.total >= 3 && currentLevelAccuracy >= 80);
    const weakPoints = new Map<string, { total: number; correct: number }>();

    const answers = storage.getAnswers().slice(-sessionStats.total);
    answers.forEach(a => {
      if (!weakPoints.has(a.knowledgePoint)) {
        weakPoints.set(a.knowledgePoint, { total: 0, correct: 0 });
      }
      const point = weakPoints.get(a.knowledgePoint)!;
      point.total++;
      if (a.isCorrect) point.correct++;
    });

    const weakPointsList = Array.from(weakPoints.entries())
      .map(([name, stats]) => ({
        name,
        accuracy: Math.round((stats.correct / stats.total) * 100)
      }))
      .filter(p => p.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy);

    if (isLowerGradeStudent) {
      return (
        <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

          <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <button
                onClick={() => navigate(`/subject/${subjectId}`)}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-4 py-2 text-white ring-1 ring-white/16">
                <div style={{ fontSize: '18px', fontWeight: 900 }}>练习奖励</div>
                <div className="text-white/80 truncate" style={{ fontSize: '12px', fontWeight: 800 }}>{subject.name} · {chapter.name}</div>
              </div>
            </div>
          </header>

          <div className="relative z-10 flex-1 overflow-auto flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-xl rounded-[34px] border-2 border-white/85 bg-white/92 p-6 md:p-8 text-center" style={{ boxShadow: '0 14px 0 rgba(30, 64, 175, 0.16), 0 24px 44px rgba(15, 23, 42, 0.18)' }}>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[30px] bg-amber-100 border-4 border-white">
                <Trophy size={54} className="text-amber-500" />
              </div>
              <div className="text-slate-900" style={{ fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 900, lineHeight: 1.05 }}>
                通关完成
              </div>
              <div className="mt-2 text-slate-500" style={{ fontSize: '15px', fontWeight: 800 }}>
                本次答对 {sessionStats.correct}/{sessionStats.total} 题
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => {
                  const filled = accuracy >= (index + 1) * 30;
                  return (
                    <div key={index} className={`h-14 rounded-2xl border-2 flex items-center justify-center ${filled ? 'bg-amber-100 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                      <Star size={28} style={{ fill: filled ? 'currentColor' : 'none' }} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-sky-50 p-4 border border-sky-100">
                  <div className="text-sky-700" style={{ fontSize: '30px', fontWeight: 900 }}>{accuracy}%</div>
                  <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>正确率</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                  <div className="text-emerald-700" style={{ fontSize: '30px', fontWeight: 900 }}>+10</div>
                  <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>奖励</div>
                </div>
              </div>

              {weakPointsList.length > 0 && (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-left text-amber-700" style={{ fontWeight: 900 }}>
                  还有小关卡要加强：{weakPointsList.slice(0, 2).map(point => point.name).join('、')}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleContinuePractice}
                  className="w-full h-14 rounded-full text-white transition-all active:translate-y-0.5"
                  style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)', boxShadow: '0 7px 0 rgba(194, 91, 0, 0.28)' }}
                >
                  {canContinueToNextDifficulty ? '下一关' : '再玩一次'}
                </button>
                {weakPointsList.length > 0 && (
                  <button
                    onClick={() => navigate('/weakness')}
                    className="w-full h-14 rounded-full bg-sky-500 text-white transition-all active:translate-y-0.5"
                    style={{ fontSize: '18px', fontWeight: 900, boxShadow: '0 6px 0 rgba(2, 132, 199, 0.28)' }}
                  >
                    去加强关卡
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full h-12 rounded-full bg-slate-100 text-slate-600"
                  style={{ fontSize: '16px', fontWeight: 900 }}
                >
                  回到大厅
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
        <header className="px-4 md:px-8 pt-3 pb-2 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3 rounded-[22px] bg-white/90 border border-white px-3 py-3 shadow-sm">
          <button onClick={() => navigate(`/subject/${subjectId}`)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <span style={{ fontWeight: 900, fontSize: '17px' }} className="text-gray-800">练习报告</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            <div className="bg-white/[0.96] rounded-[28px] shadow-sm p-5 md:p-8 text-center border border-white" style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10)' }}>
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
                  accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Award size={40} className={`md:w-12 md:h-12 ${
                    accuracy >= 80 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
              </div>
              <div className="text-2xl md:text-3xl mb-2" style={{ fontWeight: 900 }}>练习完成</div>
              <div className="text-gray-500 mb-6">本次共完成 {sessionStats.total} 道题</div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '32px' }}>{accuracy}%</div>
                  <div className="text-sm text-gray-600 mt-1">正确率</div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="text-green-600" style={{ fontWeight: 800, fontSize: '32px' }}>{sessionStats.correct}/{sessionStats.total}</div>
                  <div className="text-sm text-gray-600 mt-1">答对题数</div>
                </div>
              </div>

              {accuracy >= 80 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4 text-left">
                  <div className="flex items-center gap-2 text-green-700">
                    <TrendingUp size={20} />
                    <span>太棒了！你已经很好地掌握了这个章节！</span>
                  </div>
                </div>
              )}

              {weakPointsList.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-4 text-left">
                  <div className="min-w-0">
                    <div className="text-orange-700 mb-2">
                      <span>发现薄弱知识点：</span>
                    </div>
                    <div className="space-y-1">
                      {weakPointsList.slice(0, 3).map(point => (
                        <div key={point.name} className="text-sm text-orange-600">
                          • {point.name} (正确率 {point.accuracy}%)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Wrong question review ── */}
              {sessionStats.wrongs.length > 0 && (
                <div className="text-left mb-4">
                  <h4 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '15px' }}>
                    错题回顾 ({sessionStats.wrongs.length} 题)
                  </h4>
                  <div className="space-y-3">
                    {sessionStats.wrongs.map(({ q, userAnswer }, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                        <div className="text-sm font-semibold mb-2">{q.question}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div>
                            <span className="text-red-500">你的答案：</span>
                            <span className="text-red-600 font-semibold ml-1">{userAnswer}</span>
                          </div>
                          <div>
                            <span className="text-green-500">正确答案：</span>
                            <span className="text-green-600 font-semibold ml-1">{q.answer}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-start gap-1.5">
                            <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-600">{q.explanation}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-600">{q.warning}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleContinuePractice}
                  className="flex-1 bg-blue-500 text-white py-3 md:py-4 rounded-xl hover:bg-blue-600 transition-colors"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  {canContinueToNextDifficulty ? '进入下一难度' : '重新做本难度'}
                </button>
                {weakPointsList.length > 0 && (
                  <button
                    onClick={() => navigate('/weakness')}
                    className="flex-1 bg-orange-500 text-white py-3 md:py-4 rounded-xl hover:bg-orange-600 transition-colors"
                    style={{ fontSize: '16px', fontWeight: 600 }}
                  >
                    去薄弱专项训练
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 md:py-4 rounded-xl hover:bg-gray-300 transition-colors"
                  style={{ fontSize: '16px', fontWeight: 600 }}
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  if (isLowerGradeStudent) {
    const difficultyLabel = currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难';
    const progress = Math.min(100, Math.round(((questionNumber - 1) / totalQuestions) * 100));

    return (
      <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

        <header className="relative z-10 px-4 md:px-8 pt-4 pb-2 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(`/subject/${subjectId}`)}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-4 py-2 text-white ring-1 ring-white/16">
              <div className="truncate" style={{ fontSize: '18px', fontWeight: 900 }}>{subject.name} · {chapter.name}</div>
              <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 800 }}>第 {questionNumber}/{totalQuestions} 题 · {difficultyLabel}关卡</div>
            </div>
            <div className="hidden sm:flex h-11 items-center gap-1 rounded-full bg-blue-900/24 px-3 text-white ring-1 ring-white/16">
              <Star size={18} className="text-yellow-300" style={{ fill: 'currentColor' }} />
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{sessionStats.correct}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="rounded-[28px] border-2 border-cyan-100/80 bg-blue-700/18 p-3">
              <div className="grid grid-cols-3 gap-2">
                {difficulties.map(({ level, label }) => {
                  const isUnlocked = unlockedDifficulties.includes(level);
                  const isCurrent = currentDifficulty === level;
                  return (
                    <button
                      key={level}
                      onClick={() => isUnlocked && setCurrentDifficulty(level)}
                      disabled={!isUnlocked}
                      className={`h-12 rounded-2xl transition-all active:scale-95 ${isCurrent ? 'bg-white text-blue-700' : isUnlocked ? 'bg-white/24 text-white hover:bg-white/32' : 'bg-blue-950/20 text-white/45 cursor-not-allowed'}`}
                      style={{ fontWeight: 900 }}
                    >
                      {isUnlocked ? label : '未解锁'}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 h-4 rounded-full bg-blue-900/20 p-1">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-emerald-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-[34px] border-2 border-white/85 bg-white/94 p-4 md:p-7" style={{ boxShadow: '0 12px 0 rgba(30,64,175,0.14), 0 18px 34px rgba(15,23,42,0.16)' }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 border border-sky-100" style={{ fontSize: '13px', fontWeight: 900 }}>
                  <Sparkles size={16} />
                  小挑战
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalQuestions }).slice(0, 5).map((_, index) => (
                    <Star key={index} size={17} className={questionNumber > index ? 'text-amber-400' : 'text-slate-300'} style={{ fill: questionNumber > index ? 'currentColor' : 'none' }} />
                  ))}
                </div>
              </div>

              <div className="text-slate-900 mb-5 md:mb-7" style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, lineHeight: 1.25 }}>
                {currentQuestion.question}
              </div>

              {currentQuestion.options ? (
                <div className="grid gap-3 md:gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !submitted && setSelectedAnswer(option)}
                      disabled={submitted}
                      className={`w-full text-left px-4 md:px-5 py-4 rounded-[22px] border-2 transition-all flex items-center active:translate-y-0.5 ${
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
                      style={{ fontSize: '18px', fontWeight: 900, boxShadow: !submitted && selectedAnswer === option ? '0 6px 0 rgba(2, 132, 199, 0.22)' : undefined }}
                    >
                      <span className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-current" style={{ fontWeight: 900 }}>
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
              <div className="rounded-[30px] border-2 border-white/85 bg-white/94 p-4 md:p-6" style={{ boxShadow: '0 10px 0 rgba(30,64,175,0.10), 0 16px 28px rgba(15,23,42,0.12)' }}>
                <div className={`flex items-center gap-3 mb-4 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`} style={{ fontSize: '22px', fontWeight: 900 }}>
                  {isCorrect ? <CheckCircle size={30} /> : <AlertCircle size={30} />}
                  {isCorrect ? '答对啦！' : '差一点，再看一步'}
                </div>
                {!isCorrect && (
                  <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700" style={{ fontSize: '17px', fontWeight: 900 }}>
                    正确答案：{currentQuestion.answer}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-sky-50 px-4 py-3 text-slate-700">
                    <div className="text-sky-700 mb-1" style={{ fontWeight: 900 }}>这题练什么</div>
                    <div style={{ lineHeight: 1.55 }}>{currentQuestion.knowledgePoint}</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-slate-700">
                    <div className="text-amber-700 mb-1" style={{ fontWeight: 900 }}>小提示</div>
                    <div style={{ lineHeight: 1.55 }}>{currentQuestion.warning}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-slate-700 border border-sky-100">
                  <div className="text-sky-700 mb-1" style={{ fontWeight: 900 }}>解题方法</div>
                  <div style={{ lineHeight: 1.65 }}>{currentQuestion.explanation}</div>
                </div>
              </div>
            )}

            <button
              onClick={handlePrimaryAction}
              disabled={!selectedAnswer}
              className="w-full h-14 rounded-full text-white transition-all disabled:bg-slate-300 disabled:cursor-not-allowed active:translate-y-0.5"
              style={{
                fontSize: '20px',
                fontWeight: 900,
                background: selectedAnswer ? 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)' : undefined,
                boxShadow: selectedAnswer ? '0 7px 0 rgba(194, 91, 0, 0.28), inset 0 2px 0 rgba(255,255,255,0.52)' : undefined,
                textShadow: selectedAnswer ? '0 1px 0 rgba(154, 52, 18, 0.22)' : undefined,
              }}
            >
              {!submitted ? '检查答案' : questionNumber >= totalQuestions ? '完成练习' : '下一题'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      {/* Header with difficulty tabs */}
      <div className="px-4 md:px-8 pt-3 pb-2 flex-shrink-0">
        <div
          className="max-w-4xl mx-auto rounded-[24px] border border-white/85 px-3 py-3 md:px-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(240,249,255,0.94) 58%, rgba(255,251,235,0.86) 100%)',
            boxShadow: '0 12px 28px rgba(65, 98, 165, 0.12), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(`/subject/${subjectId}`)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/75 hover:bg-white transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="text-slate-900" style={{ fontWeight: 900, fontSize: '16px' }}>{subject.name} · {chapter.name}</div>
            <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>第 {questionNumber} / {totalQuestions} 题 · {currentQuestion.knowledgePoint}</div>
          </div>
        </div>

        {/* Difficulty tabs */}
        <div className="flex gap-2">
          {difficulties.map(({ level, label, color }) => {
            const isUnlocked = unlockedDifficulties.includes(level);
            const isCurrent = currentDifficulty === level;
            const stats = difficultyStats[level];
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return (
              <button
                key={level}
                onClick={() => isUnlocked && setCurrentDifficulty(level)}
                disabled={!isUnlocked}
                className={`flex-1 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  isCurrent ? 'bg-sky-500 text-white border-sky-500 shadow-sm' : isUnlocked ? 'bg-white/70 border-white hover:border-sky-300' : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span style={{ fontWeight: isCurrent ? 700 : 400, fontSize: '14px' }}>{label}</span>
                  {isCurrent && <span style={{ fontSize: '11px' }}>训练中</span>}
                </div>
                {isUnlocked && stats.total > 0 && (
                  <div style={{ fontSize: '11px' }} className="opacity-80">{accuracy}% ({stats.correct}/{stats.total})</div>
                )}
                {!isUnlocked && (
                  <div className="flex items-center justify-center gap-1" style={{ fontSize: '11px' }}><Lock size={11} />未解锁</div>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 text-gray-400 text-center flex items-center justify-center gap-1" style={{ fontSize: '11px' }}>
          <Info size={12} />
          <span>简单题80%解锁中等，中等80%解锁困难</span>
        </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar mobile */}
          <div className="md:hidden w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white/[0.96] rounded-[28px] shadow-sm p-4 md:p-7 mb-4 border border-white" style={{ boxShadow: '0 12px 26px rgba(65, 98, 165, 0.10)' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 mb-4" style={{ fontSize: '12px', fontWeight: 900 }}>
              {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
            </div>
            <div className="text-slate-900 mb-5 md:mb-7 leading-relaxed" style={{ fontSize: 'clamp(20px, 4.4vw, 28px)', fontWeight: 900 }}>{currentQuestion.question}</div>

            {currentQuestion.options ? (
              <div className="space-y-3 md:space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={`w-full text-left px-4 md:px-5 py-3.5 md:py-4 rounded-2xl border transition-all flex items-center active:scale-[0.99] ${
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

          {/* Result panel */}
          {showResult && (
            <div className={`bg-white/[0.96] rounded-[24px] shadow-sm p-4 md:p-6 mb-4 border border-white border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
              <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}
                style={{ fontSize: '18px', fontWeight: 700 }}>
                {isCorrect ? <CheckCircle size={24} className="md:w-8 md:h-8" /> : <XCircle size={24} className="md:w-8 md:h-8" />}
                {isCorrect ? '回答正确！' : '回答错误'}
              </div>
              {!isCorrect && (
                <div className="mb-3 md:mb-4 text-base md:text-xl">
                  正确答案：<span className="text-green-600" style={{ fontWeight: 600 }}>{currentQuestion.answer}</span>
                </div>
              )}
              <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                <div className="flex items-start gap-2">
                  <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div><span className="text-blue-500" style={{ fontWeight: 600 }}>本题知识点：</span><span className="ml-1">{currentQuestion.knowledgePoint}</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div><span className="text-blue-500" style={{ fontWeight: 600 }}>知识点解析：</span><span className="ml-1">{currentQuestion.explanation}</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div><span className="text-blue-500" style={{ fontWeight: 600 }}>易错提醒：</span><span className="ml-1">{currentQuestion.warning}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <button
            onClick={handlePrimaryAction}
            disabled={!selectedAnswer}
            className="w-full text-white py-3.5 md:py-4 rounded-2xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm active:scale-[0.99]"
            style={{
              fontSize: '16px',
              fontWeight: 900,
              background: selectedAnswer ? (submitted ? 'linear-gradient(135deg, #22C55E 0%, #0EA5E9 100%)' : 'linear-gradient(135deg, #0EA5E9 0%, #4F46E5 100%)') : undefined,
            }}
          >
            {!submitted ? '提交答案' : questionNumber >= totalQuestions ? '完成练习' : '下一题'}
          </button>
        </div>
      </div>
    </div>
  );
}
