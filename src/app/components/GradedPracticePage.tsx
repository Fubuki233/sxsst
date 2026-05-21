import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { getAllQuestions, getRandomKnowledgeQuestion } from '../utils/questions';
import { storage, Question } from '../utils/storage';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, AlertCircle, Info, Lock, TrendingUp } from 'lucide-react';

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
  const [unlockedDifficulties, setUnlockedDifficulties] = useState<Difficulty[]>(['easy']);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [levelCompleteData, setLevelCompleteData] = useState<{difficulty: Difficulty, total: number, correct: number, accuracy: number, canUpgrade: boolean} | null>(null);

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
    if (isRetryMode) {
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
        if (correct) storage.removeWrongQuestion(currentQuestion.id);
      }
      navigate(fromWrongQuestions ? '/wrong-questions' : '/weakness');
      return;
    }

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
      newStats[currentDifficulty].total++;
      if (correct) newStats[currentDifficulty].correct++;
      setDifficultyStats(newStats);

      const accuracy = (newStats[currentDifficulty].correct / newStats[currentDifficulty].total) * 100;

      // 检查升级条件（实时反馈）
      if (currentDifficulty === 'easy' && accuracy >= 80 && newStats.easy.total >= 3) {
        setUnlockedDifficulties(prev => prev.includes('medium') ? prev : [...prev, 'medium']);
      } else if (currentDifficulty === 'medium' && accuracy >= 80 && newStats.medium.total >= 3) {
        setUnlockedDifficulties(prev => prev.includes('hard') ? prev : [...prev, 'hard']);
      }
    }

    setQuestionNumber(prev => prev + 1);
  };

  if (!currentQuestion) return null;

  // 如果显示关卡完成页面
  if (showLevelComplete && levelCompleteData) {
    const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };
    const nextDifficulty: { [key in Difficulty]: Difficulty | null } = { easy: 'medium', medium: 'hard', hard: null };
    const canUpgradeToNext = nextDifficulty[levelCompleteData.difficulty] !== null;

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

  const difficulties: { level: Difficulty; label: string; color: string }[] = [
    { level: 'easy', label: '简单', color: 'bg-green-500' },
    { level: 'medium', label: '中等', color: 'bg-yellow-500' },
    { level: 'hard', label: '困难', color: 'bg-red-500' }
  ];

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <div className="bg-white shadow-sm px-4 md:px-8 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <button onClick={() => navigate('/weakness')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
              {isRetryMode ? '重做错题' : `专项刷题：${knowledgePoint}`}
            </div>
            <div className="text-gray-400" style={{ fontSize: '12px' }}>第 {questionNumber} 题</div>
          </div>
        </div>

        {!isRetryMode && <div className="flex gap-2">
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
                  isCurrent
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : isUnlocked
                    ? 'border-gray-200 hover:border-blue-300'
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span style={{ fontWeight: isCurrent ? 700 : 400, fontSize: '14px' }}>{label}</span>
                  {isCurrent && <span style={{ fontSize: '11px' }}>训练中</span>}
                </div>
                {isUnlocked && stats.total > 0 && (
                  <div style={{ fontSize: '11px' }} className="opacity-80">
                    {accuracy}% ({stats.correct}/{stats.total})
                  </div>
                )}
                {!isUnlocked && (
                  <div className="flex items-center justify-center gap-1" style={{ fontSize: '11px' }}>
                    <Lock size={11} />未解锁
                  </div>
                )}
              </button>
            );
          })}
        </div>}

        {!isRetryMode && <div className="mt-2 text-gray-400 text-center flex items-center justify-center gap-1" style={{ fontSize: '11px' }}>
          <Info size={12} />
          <span>简单题80%解锁中等，中等80%解锁困难</span>
        </div>}
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
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

          {showResult && (
            <div className={`bg-white rounded-2xl shadow-sm p-4 md:p-8 mb-4 md:mb-6 border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              <div className={`flex items-center gap-2 md:gap-3 mb-3 md:mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}
                style={{ fontSize: '18px', fontWeight: 700 }}>
                {isCorrect ? <CheckCircle size={24} className="md:w-8 md:h-8" /> : <XCircle size={24} className="md:w-8 md:h-8" />}
                {isCorrect ? '回答正确！' : '回答错误'}
              </div>
              {!isCorrect && (
                <div className="mb-3 md:mb-4" style={{ fontSize: '16px' }}>
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
              {isRetryMode ? '返回错题本' : '下一题'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
