import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import { getQuestionsByChapter, SUBJECTS, CHAPTERS } from '../utils/questions';
import { storage, Question } from '../utils/storage';
import { ArrowLeft, ArrowRight, Check, CheckCircle, XCircle, Lightbulb, AlertCircle, Info, TrendingUp, Sparkles, Gem, X } from 'lucide-react';
import { AnimatedComboSvg, AnimatedRewardSvg, AnimatedSuccessSvg, CorrectCelebrationOverlay } from './animated/LearningFeedbackIcons';
import { SvgAppIcon } from './SvgAppIcon';

type Difficulty = 'easy' | 'medium' | 'hard';

const nextDifficultyMap: Record<Difficulty, Difficulty | null> = {
  easy: 'medium',
  medium: 'hard',
  hard: null
};

const seniorPracticeTheme: Record<string, { bg: string; accent: string; chip: string }> = {
  math: { bg: '#A889F3', accent: '#CBB8FF', chip: '#8F6BEB' },
  english: { bg: '#87EBCF', accent: '#BDF8EA', chip: '#52C8AF' },
  physics: { bg: '#ED8F88', accent: '#FFC7C2', chip: '#D77470' },
  chemistry: { bg: '#FFAF18', accent: '#FFD986', chip: '#E69C12' },
};

function getPracticeReward(subjectId = '', chapterId = '') {
  const seed = `${subjectId}-${chapterId}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (seed % 5) + 1;
}

export default function PracticePage() {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  // ── Difficulty progression ──
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [difficultyStats, setDifficultyStats] = useState({ easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } });
  const [, setUnlockedDifficulties] = useState<Difficulty[]>(['easy']);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [practiceRound, setPracticeRound] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showSeniorAnalysis, setShowSeniorAnalysis] = useState(false);
  const [sessionStats, setSessionStats] = useState({ total: 0, correct: 0, questions: [] as Question[], wrongs: [] as { q: Question; userAnswer: string }[] });
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCelebration, setCorrectCelebration] = useState<{ id: string; combo: number; reward: number } | null>(null);
  const seniorConfettiFiredRef = useRef(false);
  const currentUser = storage.getCurrentUser();
  const isLowerGradeStudent = currentUser?.grade !== undefined && currentUser.grade < 4;

  const subject = SUBJECTS.find(s => s.id === subjectId);
  const chapter = CHAPTERS[subjectId || '']?.find(c => c.id === chapterId);
  const totalQuestions = 10;
  const seniorTheme = seniorPracticeTheme[subjectId || 'math'] || seniorPracticeTheme.math;
  const practiceReward = getPracticeReward(subjectId, chapterId);

  useEffect(() => {
    loadNextQuestion();
  }, [currentDifficulty, questionNumber, practiceRound]);

  useEffect(() => {
    if (!correctCelebration) return;
    const timer = window.setTimeout(() => {
      setCorrectCelebration(null);
    }, 1350);

    return () => window.clearTimeout(timer);
  }, [correctCelebration]);

  useEffect(() => {
    if (!showReport || showSeniorAnalysis || isLowerGradeStudent) return;

    const target = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const start = window.performance.now();
    const duration = 850;
    let frame = 0;

    setAnimatedAccuracy(0);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedAccuracy(Math.round(target * eased));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [showReport, showSeniorAnalysis, isLowerGradeStudent, sessionStats.correct, sessionStats.total]);

  useEffect(() => {
    if (!showReport || showSeniorAnalysis || isLowerGradeStudent || seniorConfettiFiredRef.current) return;
    const target = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    if (target !== 100) return;

    seniorConfettiFiredRef.current = true;
    const defaults = {
      particleCount: 42,
      spread: 360,
      startVelocity: 34,
      ticks: 240,
      gravity: 0.86,
      decay: 0.91,
      scalar: 0.86,
      zIndex: 70,
      disableForReducedMotion: true,
      colors: ['#F87171', '#FACC15', '#34D399', '#38BDF8', '#A78BFA', '#F472B6'],
    };

    [
      { x: 0.5, y: 0.34, delay: 0, ratio: 1 },
      { x: 0.24, y: 0.28, delay: 140, ratio: 0.72 },
      { x: 0.76, y: 0.28, delay: 220, ratio: 0.72 },
      { x: 0.38, y: 0.48, delay: 320, ratio: 0.52 },
      { x: 0.62, y: 0.48, delay: 390, ratio: 0.52 },
    ].forEach(burst => {
      window.setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: Math.round(defaults.particleCount * burst.ratio),
          origin: { x: burst.x, y: burst.y },
        });
      }, burst.delay);
    });
  }, [showReport, showSeniorAnalysis, isLowerGradeStudent, sessionStats.correct, sessionStats.total]);

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
    if (correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setBestCombo(best => Math.max(best, nextCombo));
      setCorrectCelebration({ id: currentQuestion.id, combo: nextCombo, reward: practiceReward + 1 });
    } else {
      setCombo(0);
      setCorrectCelebration(null);
    }

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
    setShowSeniorAnalysis(false);
    setSessionStats({ total: 0, correct: 0, questions: [], wrongs: [] });
    setCombo(0);
    setBestCombo(0);
    setCorrectCelebration(null);
    seniorConfettiFiredRef.current = false;
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

  if (!subject || !chapter) {
    return (
      <div className="size-full flex flex-col items-center justify-center gap-4 [background:var(--senior-page-bg,#2B2B2E)] px-6 text-center text-white">
        <div className="rounded-[8px] bg-white/10 px-6 py-7">
          <div style={{ fontSize: '22px', fontWeight: 900 }}>没有找到练习内容</div>
          <div className="mt-2 text-white/58" style={{ fontSize: '14px', fontWeight: 700 }}>当前章节不存在或题库还没有配置。</div>
          <button
            onClick={() => navigate('/weakness')}
            className="mt-5 h-12 rounded-full bg-[#5964F2] px-7 text-white transition-transform active:scale-[0.98]"
            style={{ fontSize: '16px', fontWeight: 900 }}
          >
            返回练习
          </button>
        </div>
      </div>
    );
  }

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
    const earnedStars = sessionStats.total > 0 ? Math.max(1, Math.min(3, Math.ceil(accuracy / 34))) : 0;

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
                <AnimatedRewardSvg size={58} className="text-amber-500" />
              </div>
              <div className="text-slate-900" style={{ fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 900, lineHeight: 1.05 }}>
                闯关结算
              </div>
              <div className="mt-2 text-slate-500" style={{ fontSize: '15px', fontWeight: 800 }}>
                本次答对 {sessionStats.correct}/{sessionStats.total} 题
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => {
                  const filled = earnedStars > index;
                  return (
                    <div key={index} className={`h-14 rounded-2xl border-2 flex items-center justify-center ${filled ? 'bg-amber-100 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                      <SvgAppIcon name="star" size={28} filled={filled} />
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
                  <div className="text-emerald-700" style={{ fontSize: '30px', fontWeight: 900 }}>x{bestCombo}</div>
                  <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>最高连击</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 border border-violet-100">
                  <div className="flex items-center justify-center gap-1 text-violet-700" style={{ fontSize: '24px', fontWeight: 900 }}>
                    <SvgAppIcon name="star" size={22} filled />
                    {earnedStars}
                  </div>
                  <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>星星</div>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100">
                  <div className="flex items-center justify-center gap-1 text-amber-700" style={{ fontSize: '24px', fontWeight: 900 }}>
                    <SvgAppIcon name="gem" size={21} filled />
                    +{practiceReward + earnedStars}
                  </div>
                  <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 900 }}>钻石</div>
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

    if (!showSeniorAnalysis) {
      const isPerfect = accuracy === 100;
      const earnedDiamonds = Math.max(1, Math.round(accuracy / 20));
      const scoreRingCircumference = 2 * Math.PI * 86;
      const scoreRingOffset = scoreRingCircumference * (1 - Math.max(0, Math.min(100, accuracy)) / 100);

      return (
        <div className="size-full flex flex-col overflow-hidden [background:var(--senior-page-bg)] text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />

          <header className="relative z-20 mx-auto w-full max-w-[640px] px-4 pt-4 pb-1 flex-shrink-0">
            <button
              onClick={() => navigate(`/subject/${subjectId}`)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-[#5964F2] transition-colors hover:bg-white/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
              aria-label="退出练习"
            >
              <X size={39} strokeWidth={2.2} />
            </button>
          </header>

          <div className="relative z-20 flex min-h-0 flex-1 flex-col items-center px-5 pb-5 pt-1">
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
              <div className="relative flex flex-col items-center">
                <div
                  className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full sm:h-[230px] sm:w-[230px]"
                  style={{
                    boxShadow: accuracy >= 80 ? '0 0 38px rgba(22,209,197,0.22)' : 'none',
                  }}
                >
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 220 220" aria-hidden="true">
                    <circle
                      cx="110"
                      cy="110"
                      r="86"
                      fill="none"
                      stroke="var(--senior-practice-track)"
                      strokeWidth="24"
                    />
                    <circle
                      className="senior-score-ring"
                      cx="110"
                      cy="110"
                      r="86"
                      fill="none"
                      stroke="#16D1C5"
                      strokeLinecap="round"
                      strokeWidth="24"
                      pathLength={scoreRingCircumference}
                      strokeDasharray={scoreRingCircumference}
                      strokeDashoffset={scoreRingOffset}
                    />
                  </svg>
                  <div className="absolute inset-[30px] rounded-full sm:inset-[36px]" style={{ background: 'var(--senior-page-bg)' }} />
                  <div className="absolute left-1/2 top-[-4px] z-20 h-12 w-12 -translate-x-1/2 sm:h-14 sm:w-14">
                    <div className="senior-score-check flex h-full w-full items-center justify-center rounded-full bg-[#16D1C5] text-white shadow-[0_14px_24px_rgba(22,209,197,0.24)]">
                      <Check className="senior-score-check-icon" size={28} strokeWidth={4} />
                    </div>
                  </div>
                  <div className="relative z-10 flex translate-y-1 flex-col items-center justify-center text-center">
                    <div
                      className="senior-score-number"
                      style={{
                        color: 'var(--senior-practice-card-text)',
                        fontSize: 'clamp(28px, 8vw, 42px)',
                        fontWeight: 900,
                        lineHeight: 0.95,
                        ['--score-value' as string]: `"${accuracy}%"`,
                      }}
                    >
                      {animatedAccuracy}%
                    </div>
                    <div className="mt-2" style={{ color: 'var(--senior-practice-muted-text)', fontSize: 'clamp(13px, 3.5vw, 17px)', fontWeight: 500, lineHeight: 1 }}>
                      {sessionStats.correct} / {sessionStats.total}
                    </div>
                  </div>
                </div>
                <div
                  className="mt-4 flex h-12 min-w-[132px] items-center justify-center gap-2 whitespace-nowrap rounded-[20px] px-6 text-[#16D1C5] shadow-[0_14px_24px_rgba(35,43,69,0.10)] sm:mt-5 sm:h-14 sm:min-w-[146px]"
                  style={{ background: 'var(--senior-practice-card-bg)', fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 900, lineHeight: 1 }}
                >
                  <Gem size={23} className="flex-shrink-0" style={{ fill: 'rgba(22,209,197,0.18)' }} />
                  <span className="whitespace-nowrap">+{earnedDiamonds}</span>
                </div>
              </div>

              <div className="mt-7 w-full max-w-[470px] px-2 sm:mt-9">
                <h1 style={{ color: 'var(--senior-practice-card-text)', fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 900, lineHeight: 1.12 }}>
                  {isPerfect ? '你太棒了！' : accuracy >= 80 ? '表现不错！' : '别放弃！'}
                </h1>
              </div>
            </div>

            <button
              onClick={() => setShowSeniorAnalysis(true)}
              className="flex h-16 w-full max-w-[600px] flex-shrink-0 items-center justify-center rounded-[8px] bg-[#5964F2] text-white shadow-[0_16px_28px_rgba(89,100,242,0.24)] transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white sm:h-20"
              style={{ fontSize: 'clamp(20px, 5vw, 29px)', fontWeight: 900, letterSpacing: 1 }}
            >
              <span className="flex-1 text-center">下一步</span>
              <span className="mr-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#4B57DF] sm:mr-5 sm:h-12 sm:w-12">
                <ArrowRight size={27} strokeWidth={3} />
              </span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="size-full flex flex-col overflow-hidden [background:var(--senior-page-bg)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />

        <header className="relative z-10 mx-auto w-full max-w-[520px] px-4 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/subject/${subjectId}`)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/16">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-white" style={{ fontSize: '17px', fontWeight: 900 }}>练习报告</div>
              <div className="truncate text-white/58" style={{ fontSize: '12px', fontWeight: 700 }}>{subject.name} · {chapter.name}</div>
            </div>
            <div className="flex h-9 items-center gap-1.5 rounded-full bg-white/18 px-3">
              <Gem size={16} style={{ fill: 'rgba(255,255,255,0.26)' }} />
              <span style={{ fontSize: '14px', fontWeight: 900 }}>+{practiceReward}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-auto px-4 pb-6 pt-2">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] bg-white/10 p-4 text-center">
                <div className="text-white" style={{ fontSize: '32px', fontWeight: 900 }}>{accuracy}%</div>
                <div className="text-white/56" style={{ fontSize: '12px', fontWeight: 800 }}>正确率</div>
              </div>
              <div className="rounded-[8px] bg-white/10 p-4 text-center">
                <div className="text-white" style={{ fontSize: '32px', fontWeight: 900 }}>{sessionStats.correct}/{sessionStats.total}</div>
                <div className="text-white/56" style={{ fontSize: '12px', fontWeight: 800 }}>答对题数</div>
              </div>
            </div>

            {accuracy >= 80 && (
              <div className="mt-4 flex items-start gap-3 rounded-[8px] bg-white/10 px-4 py-3 text-white">
                <TrendingUp size={20} className="mt-0.5 text-[#87EBCF]" />
                <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.45 }}>掌握不错，可以继续挑战下一难度。</span>
              </div>
            )}

            {weakPointsList.length > 0 && (
              <div className="mt-4 rounded-[8px] bg-white/10 px-4 py-3 text-white">
                <div style={{ fontSize: '14px', fontWeight: 900 }}>薄弱知识点</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {weakPointsList.slice(0, 3).map(point => (
                    <span key={point.name} className="rounded-full bg-white/14 px-3 py-1 text-white/78" style={{ fontSize: '12px', fontWeight: 800 }}>
                      {point.name} · {point.accuracy}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sessionStats.wrongs.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-3 text-white/88" style={{ fontSize: '14px', fontWeight: 900 }}>错题回顾</h2>
                <div className="space-y-3">
                  {sessionStats.wrongs.map(({ q, userAnswer }, idx) => (
                    <div key={idx} className="rounded-[8px] bg-white/10 p-4 text-left">
                      <div className="text-white" style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.4 }}>{q.question}</div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-white/68" style={{ fontSize: '12px', fontWeight: 800 }}>
                        <span>你的答案：{userAnswer}</span>
                        <span>正确答案：{q.answer}</span>
                      </div>
                      <div className="mt-3 flex items-start gap-2 text-white/60" style={{ fontSize: '12px', lineHeight: 1.45 }}>
                        <Info size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-3">
              <button onClick={handleContinuePractice} className="h-12 rounded-full text-white transition-transform active:scale-[0.98]" style={{ background: seniorTheme.chip, fontSize: '16px', fontWeight: 900 }}>
                {canContinueToNextDifficulty ? '进入下一难度' : '重新做本难度'}
              </button>
              {weakPointsList.length > 0 && (
                <button onClick={() => navigate('/weakness')} className="h-12 rounded-full bg-white/14 text-white transition-colors hover:bg-white/18" style={{ fontSize: '16px', fontWeight: 900 }}>
                  去薄弱专项训练
                </button>
              )}
              <button onClick={() => navigate('/dashboard')} className="h-12 rounded-full bg-white/10 text-white/72 transition-colors hover:bg-white/14" style={{ fontSize: '16px', fontWeight: 900 }}>
                返回大厅
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="size-full flex flex-col items-center justify-center [background:var(--senior-page-bg,#2B2B2E)] px-6 text-center text-white">
        <div className="rounded-[8px] bg-white/10 px-6 py-7">
          <div style={{ fontSize: '22px', fontWeight: 900 }}>正在加载题目</div>
          <div className="mt-2 text-white/58" style={{ fontSize: '14px', fontWeight: 700 }}>如果长时间没有出现题目，请返回练习页重新选择。</div>
          <button
            onClick={() => navigate('/weakness')}
            className="mt-5 h-12 rounded-full bg-[#5964F2] px-7 text-white transition-transform active:scale-[0.98]"
            style={{ fontSize: '16px', fontWeight: 900 }}
          >
            返回练习
          </button>
        </div>
      </div>
    );
  }

  if (isLowerGradeStudent) {
    return (
      <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #4F8FF5 0%, #58B8F6 48%, #8BE2F2 100%)' }}>
        <CorrectCelebrationOverlay
          key={correctCelebration?.id || 'correct-celebration'}
          show={Boolean(correctCelebration)}
          combo={correctCelebration?.combo || 0}
          reward={correctCelebration?.reward || 0}
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />

        <header className="relative z-10 px-3 md:px-8 pt-3 pb-2 flex-shrink-0">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(`/subject/${subjectId}`)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 active:scale-95"
            >
              <ArrowLeft size={21} />
            </button>
            <div className="flex-1 min-w-0 rounded-2xl bg-blue-900/20 px-3 py-2 text-white ring-1 ring-white/16">
              <div className="truncate" style={{ fontSize: '17px', fontWeight: 900 }}>{subject.name} · {chapter.name}</div>
              <div className="text-white/80" style={{ fontSize: '12px', fontWeight: 800 }}>第 {questionNumber} 关 · {currentQuestion.knowledgePoint}</div>
            </div>
            <div className="flex h-10 items-center gap-1 rounded-full bg-blue-900/24 px-3 text-white ring-1 ring-white/16">
              <AnimatedComboSvg size={18} className={combo > 0 ? 'text-yellow-300' : 'text-white/70'} />
              <span style={{ fontSize: '16px', fontWeight: 900 }}>x{combo}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex-1 overflow-hidden p-3 md:p-5 min-h-0">
          <div className="max-w-5xl mx-auto h-full min-h-0 flex flex-col gap-3">
            <div className="rounded-[24px] border-2 border-white/80 bg-white/28 px-3 py-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalQuestions }).map((_, index) => {
                  const passed = questionNumber > index + 1;
                  const active = questionNumber === index + 1;
                  return (
                    <div
                      key={index}
                      className={`h-4 flex-1 rounded-full border border-white/55 transition-all ${active ? 'bg-yellow-300' : passed ? 'bg-emerald-300' : 'bg-white/34'}`}
                      style={{ boxShadow: active ? '0 3px 0 rgba(180,83,9,0.22)' : undefined }}
                    />
                  );
                })}
                <SvgAppIcon name="flag" size={18} className="ml-1 text-white" />
              </div>
            </div>

            <div className="rounded-[30px] border-2 border-white/85 bg-white/94 p-3 md:p-5 flex-shrink-0" style={{ boxShadow: '0 10px 0 rgba(30,64,175,0.14), 0 16px 30px rgba(15,23,42,0.16)' }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 border border-sky-100" style={{ fontSize: '13px', fontWeight: 900 }}>
                  <SvgAppIcon name="sparkles" size={16} />
                  {questionNumber === totalQuestions ? '终点挑战' : `第 ${questionNumber} 关`}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-100" style={{ fontSize: '13px', fontWeight: 900 }}>
                    <SvgAppIcon name="star" size={15} filled />
                    {sessionStats.correct}
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-violet-700 border border-violet-100" style={{ fontSize: '13px', fontWeight: 900 }}>
                    <SvgAppIcon name="gem" size={15} filled />
                    {practiceReward}
                  </div>
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
                    {isCorrect ? <AnimatedSuccessSvg key={currentQuestion.id} size={25} /> : <AlertCircle size={24} />}
                    {isCorrect ? `答对啦！连击 x${combo}` : '差一点，看看提示再来'}
                  </div>
                  {!isCorrect && (
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700" style={{ fontSize: '14px', fontWeight: 900 }}>
                      正确答案：{currentQuestion.answer}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-slate-700" style={{ fontSize: '13px', fontWeight: 800 }}>
                  {isCorrect && <span className="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700">星星 +1</span>}
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
              {!submitted ? '检查答案' : questionNumber >= totalQuestions ? '完成练习' : '下一题'}
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
    <div className="size-full flex flex-col overflow-hidden [background:var(--senior-page-bg)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />

      <header className="relative z-10 mx-auto w-full max-w-[640px] px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/subject/${subjectId}`)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-[#5964F2] transition-colors hover:bg-white/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="退出练习"
          >
            <X size={39} strokeWidth={2.2} />
          </button>
          <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--senior-practice-track)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(8, ((questionNumber - 1 + (submitted ? 1 : 0)) / totalQuestions) * 100)}%`,
                background: '#16D1C5',
              }}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-hidden px-5 pb-4 pt-2">
        <div className="mx-auto grid h-full min-h-0 w-full max-w-[640px] grid-rows-[minmax(0,1fr)_auto_auto] gap-3">
          <section
            className="relative mx-auto grid min-h-0 w-full grid-rows-[minmax(86px,0.82fr)_minmax(0,1fr)] overflow-hidden rounded-[8px] px-4 pb-4 pt-9 sm:grid-rows-[minmax(112px,0.86fr)_minmax(0,1fr)] sm:px-7 sm:pb-5 sm:pt-12"
            style={{
              background: 'var(--senior-practice-card-bg)',
              boxShadow: '0 18px 42px rgba(35,43,69,0.10)',
            }}
          >
            <div className="pointer-events-none absolute -top-5 left-14 h-10 w-24 rounded-b-full sm:-top-7 sm:h-14 sm:w-28" style={{ background: 'var(--senior-page-bg)' }} />

            <div className="mx-auto flex min-h-0 max-w-[500px] items-center text-center">
              <div
                style={{
                  color: 'var(--senior-practice-card-text)',
                  fontSize: 'clamp(21px, 5.4vw, 38px)',
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: 0,
                }}
              >
                {currentQuestion.question}
              </div>
            </div>

            <div className="mx-auto grid min-h-0 w-full max-w-[500px] content-end gap-2 sm:gap-3">
              {currentQuestion.options ? (
                currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isAnswer = option === currentQuestion.answer;
                  const isWrongSelected = submitted && isSelected && !isAnswer;
                  const isCorrectAnswer = submitted && isAnswer;
                  return (
                    <button
                      key={index}
                      onClick={() => !submitted && setSelectedAnswer(option)}
                      disabled={submitted}
                      className="flex min-h-[46px] w-full items-center rounded-[8px] border-2 px-3 text-left transition-all active:scale-[0.99] disabled:cursor-not-allowed sm:min-h-[60px] sm:border-[3px] sm:px-5"
                      style={{
                        background: isCorrectAnswer || (!submitted && isSelected)
                          ? '#11CEC2'
                          : isWrongSelected
                            ? 'rgba(237,143,136,0.18)'
                            : 'var(--senior-practice-option-bg)',
                        borderColor: isCorrectAnswer || (!submitted && isSelected)
                          ? '#11CEC2'
                          : isWrongSelected
                            ? '#ED8F88'
                            : 'var(--senior-practice-option-border)',
                        color: isCorrectAnswer || (!submitted && isSelected)
                          ? '#ffffff'
                          : 'var(--senior-practice-card-text)',
                        boxShadow: isCorrectAnswer || (!submitted && isSelected)
                          ? '0 12px 24px rgba(17,206,194,0.22)'
                          : 'none',
                        fontSize: 'clamp(14px, 3.7vw, 22px)',
                        fontWeight: isCorrectAnswer || (!submitted && isSelected) ? 900 : 500,
                      }}
                    >
                      <span className="mr-3 flex-shrink-0 sm:mr-5" style={{ fontWeight: 700 }}>
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="min-w-0 flex-1">{option}</span>
                      {submitted && isAnswer && <CheckCircle size={24} className="ml-3 flex-shrink-0" />}
                      {submitted && isSelected && !isAnswer && <XCircle size={24} className="ml-3 flex-shrink-0 text-[#ED8F88]" />}
                    </button>
                  );
                })
              ) : (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={submitted}
                className="h-12 w-full rounded-[8px] border-2 px-4 focus:outline-none sm:h-16 sm:border-[3px] sm:px-5"
                style={{
                  background: 'var(--senior-practice-option-bg)',
                  borderColor: 'var(--senior-practice-option-border)',
                  color: 'var(--senior-practice-card-text)',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
                placeholder="请输入答案"
              />
              )}
            </div>
          </section>

          {showResult && (
            <div className="max-h-[70px] overflow-hidden rounded-[8px] px-4 py-2.5" style={{ background: 'var(--senior-practice-card-bg)', color: 'var(--senior-practice-muted-text)', fontSize: '12px', lineHeight: 1.35 }}>
              <div className={`mb-2 flex items-center gap-2 ${isCorrect ? 'text-[#16D1C5]' : 'text-[#ED8F88]'}`} style={{ fontSize: '16px', fontWeight: 900 }}>
                {isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
                {isCorrect ? '回答正确' : `正确答案：${currentQuestion.answer}`}
              </div>
              <Lightbulb size={16} className="mr-1 inline-block align-[-3px]" />
              <span style={{ color: 'var(--senior-practice-card-text)', fontWeight: 900 }}>解析：</span>
              <span
                className="ml-1 inline-block align-top"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {currentQuestion.explanation}
              </span>
            </div>
          )}

          <button
            onClick={handlePrimaryAction}
            disabled={!selectedAnswer}
            className="flex h-14 min-h-14 w-full flex-shrink-0 items-center justify-center rounded-[8px] text-white transition-all disabled:cursor-not-allowed active:scale-[0.98] sm:h-16 sm:min-h-16"
            style={{
              fontSize: 'clamp(18px, 4.5vw, 25px)',
              fontWeight: 900,
              letterSpacing: 1,
              background: selectedAnswer ? '#5964F2' : 'rgba(255,255,255,0.14)',
              color: selectedAnswer ? '#ffffff' : 'var(--senior-practice-muted-text)',
              boxShadow: selectedAnswer ? '0 16px 28px rgba(89,100,242,0.24)' : 'none',
            }}
          >
            <span className="flex-1 text-center">{!submitted ? '继续' : questionNumber >= totalQuestions ? '完成练习' : '继续'}</span>
            <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#4B57DF] sm:mr-5 sm:h-11 sm:w-11">
              <ArrowRight size={24} strokeWidth={3} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
