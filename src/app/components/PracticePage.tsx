import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getQuestionsByChapter, SUBJECTS, CHAPTERS } from '../utils/questions';
import { storage, Question } from '../utils/storage';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, AlertCircle, Info, Award, TrendingUp, Lock } from 'lucide-react';

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
    if (!submitted && selectedAnswer && currentQuestion) {
      const correct = selectedAnswer === currentQuestion.answer;
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
    }

    setQuestionNumber(prev => prev + 1);
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

    return (
      <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
        <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => navigate(`/subject/${subjectId}`)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">练习报告</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center ${
                  accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Award size={40} className={`md:w-12 md:h-12 ${
                    accuracy >= 80 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
              </div>
              <div className="text-2xl md:text-3xl mb-2" style={{ fontWeight: 700 }}>练习完成！</div>
              <div className="text-gray-500 mb-6">本次共完成 {sessionStats.total} 道题</div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '32px' }}>{accuracy}%</div>
                  <div className="text-sm text-gray-600 mt-1">正确率</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
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

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      {/* Header with difficulty tabs */}
      <div className="bg-white shadow-sm px-4 md:px-8 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(`/subject/${subjectId}`)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>{subject.name} · {chapter.name}</div>
            <div className="text-gray-400" style={{ fontSize: '12px' }}>第 {questionNumber} / {totalQuestions} 题</div>
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
                  isCurrent ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : isUnlocked ? 'border-gray-200 hover:border-blue-300' : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
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

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar mobile */}
          <div className="md:hidden w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6">
            <div className="text-lg md:text-2xl mb-6 md:mb-8 leading-relaxed text-gray-800">{currentQuestion.question}</div>

            {currentQuestion.options ? (
              <div className="space-y-3 md:space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={`w-full text-left px-4 md:px-6 py-3 md:py-4 rounded-2xl border-2 transition-all flex items-center ${
                      submitted
                        ? option === currentQuestion.answer
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : selectedAnswer === option
                          ? 'bg-red-50 border-red-400 text-red-600'
                          : 'border-gray-200 text-gray-500'
                        : selectedAnswer === option
                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ fontSize: '16px' }}
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
                className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none"
                style={{ fontSize: '16px' }}
                placeholder="请输入答案"
              />
            )}
          </div>

          {/* Result panel */}
          {showResult && (
            <div className={`bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
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
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer || submitted}
              className="flex-1 bg-blue-500 text-white py-3 md:py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              提交答案
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex-1 bg-green-500 text-white py-3 md:py-4 rounded-2xl hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
              style={{ fontSize: '16px', fontWeight: 600 }}
            >
              {questionNumber >= totalQuestions ? '完成' : '下一题'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
