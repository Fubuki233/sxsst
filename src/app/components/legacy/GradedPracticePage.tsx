import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getRandomKnowledgeQuestion } from '../../utils/questions';
import { storage, Question } from '../../utils/storage';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, AlertCircle, Info, Lock } from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function GradedPracticePage() {
  const { knowledgeId } = useParams();
  const navigate = useNavigate();
  const knowledgePoint = decodeURIComponent(knowledgeId || '');

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

  useEffect(() => {
    loadNextQuestion();
  }, [currentDifficulty, questionNumber]);

  const loadNextQuestion = () => {
    const question = getRandomKnowledgeQuestion(knowledgePoint, currentDifficulty, askedQuestions);
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setSubmitted(false);
      setShowResult(false);
      setAskedQuestions([...askedQuestions, question.id]);
    } else {
      alert(`${currentDifficulty === 'easy' ? '简单' : currentDifficulty === 'medium' ? '中等' : '困难'}难度题目已做完！`);
      navigate('/legacy/weakness');
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

      if (currentDifficulty === 'easy' && accuracy >= 80 && newStats.easy.total >= 3) {
        setUnlockedDifficulties(prev => prev.includes('medium') ? prev : [...prev, 'medium']);
      } else if (currentDifficulty === 'medium' && accuracy >= 80 && newStats.medium.total >= 3) {
        setUnlockedDifficulties(prev => prev.includes('hard') ? prev : [...prev, 'hard']);
      }
    }

    setQuestionNumber(prev => prev + 1);
  };

  if (!currentQuestion) return null;

  const difficulties: { level: Difficulty; label: string; color: string }[] = [
    { level: 'easy', label: '简单', color: 'bg-green-500' },
    { level: 'medium', label: '中等', color: 'bg-yellow-500' },
    { level: 'hard', label: '困难', color: 'bg-red-500' }
  ];

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <div className="bg-white shadow-sm px-4 md:px-8 py-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <button onClick={() => navigate('/legacy/weakness')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
              专项刷题：{knowledgePoint}
            </div>
            <div className="text-gray-400" style={{ fontSize: '12px' }}>第 {questionNumber} 题</div>
          </div>
        </div>

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
        </div>

        <div className="mt-2 text-gray-400 text-center flex items-center justify-center gap-1" style={{ fontSize: '11px' }}>
          <Info size={12} />
          <span>简单题80%解锁中等，中等80%解锁困难</span>
        </div>
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
              下一题
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}