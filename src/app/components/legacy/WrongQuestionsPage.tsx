import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../../utils/storage';
import { QUESTIONS } from '../../utils/questions';
import { CheckCircle, Lightbulb, AlertCircle, Info } from 'lucide-react';
import { BottomNav } from './BottomNav';

export default function WrongQuestionsPage() {
  const navigate = useNavigate();
  const [wrongAnswers, setWrongAnswers] = useState<Answer[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [retryQuestion, setRetryQuestion] = useState<string | null>(null);
  const [retryAnswer, setRetryAnswer] = useState('');

  useEffect(() => {
    loadWrongAnswers();
  }, []);

  const loadWrongAnswers = () => {
    setWrongAnswers(storage.getWrongAnswers());
  };

  const handleRetry = (questionId: string) => {
    setRetryQuestion(questionId);
    setRetryAnswer('');
  };

  const handleSubmitRetry = (questionId: string) => {
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = retryAnswer === question.answer;

    if (isCorrect) {
      storage.saveAnswer({
        questionId,
        userAnswer: retryAnswer,
        isCorrect: true,
        timestamp: Date.now(),
        knowledgePoint: question.knowledgePoint,
        difficulty: question.difficulty
      });

      storage.removeWrongQuestion(questionId);
      alert('答对了！该题已从错题本移除');
      loadWrongAnswers();
      setRetryQuestion(null);
    } else {
      alert('还是错误，再想想吧');
    }
  };

  const uniqueWrongAnswers = wrongAnswers.filter((answer, index, self) =>
    index === self.findIndex(a => a.questionId === answer.questionId)
  );

  const filteredAnswers = filter === 'all'
    ? uniqueWrongAnswers
    : uniqueWrongAnswers.filter(a => {
        const question = QUESTIONS.find(q => q.id === a.questionId);
        return question?.subject === filter;
      });

  const subjects = ['all', 'math', 'english', 'physics', 'chemistry'];
  const subjectNames: Record<string, string> = {
    all: '全部',
    math: '数学',
    english: '英语',
    physics: '物理',
    chemistry: '化学'
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <div className="flex-1 overflow-auto p-4 md:p-6 pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6 p-2 flex gap-2 overflow-x-auto">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-xl whitespace-nowrap transition-colors ${
                  filter === s ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {subjectNames[s]}
              </button>
            ))}
          </div>

          {filteredAnswers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-500 md:w-12 md:h-12" />
                </div>
              </div>
              <div className="text-xl md:text-2xl mb-2">暂无错题</div>
              <div className="text-sm md:text-base text-gray-500">继续保持，加油！</div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredAnswers.map((answer) => {
                const question = QUESTIONS.find(q => q.id === answer.questionId);
                if (!question) return null;

                const isRetrying = retryQuestion === answer.questionId;

                return (
                  <div key={answer.questionId} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 md:px-6 py-4 md:py-5">
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="flex-1">
                          <div className="text-base md:text-xl mb-2">{question.question}</div>
                          {question.options && (
                            <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
                              {question.options.map((option, index) => (
                                <div key={index} className="text-sm md:text-base text-gray-600">
                                  {String.fromCharCode(65 + index)}. {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-red-50 border-l-4 border-red-500 px-3 md:px-4 py-2.5 md:py-3 mb-2 md:mb-3 rounded-r-lg">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm md:text-base">
                          <span className="text-red-600">你的答案：{answer.userAnswer}</span>
                          <span className="text-green-600">正确答案：{question.answer}</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl px-3 md:px-4 py-2.5 md:py-3 mb-2 md:mb-3 space-y-1.5 md:space-y-2">
                        <div className="flex items-start gap-1.5 md:gap-2">
                          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0 md:w-[18px] md:h-[18px]" />
                          <div className="text-sm md:text-base">
                            <span className="text-blue-600">所属知识点：</span>
                            <span className="ml-1 md:ml-2">{question.knowledgePoint}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 md:gap-2">
                          <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0 md:w-[18px] md:h-[18px]" />
                          <div className="text-sm md:text-base">
                            <span className="text-blue-600">知识点解析：</span>
                            <span className="ml-1 md:ml-2">{question.explanation}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5 md:gap-2">
                          <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0 md:w-[18px] md:h-[18px]" />
                          <div className="text-sm md:text-base">
                            <span className="text-blue-600">易错提醒：</span>
                            <span className="ml-1 md:ml-2">{question.warning}</span>
                          </div>
                        </div>
                      </div>

                      {isRetrying ? (
                        <div className="space-y-2.5 md:space-y-3">
                          {question.options ? (
                            <div className="space-y-1.5 md:space-y-2">
                              {question.options.map((option, index) => (
                                <button
                                  key={index}
                                  onClick={() => setRetryAnswer(option)}
                                  className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border-2 transition-colors ${
                                    retryAnswer === option
                                      ? 'bg-blue-500 text-white border-blue-500'
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                >
                                  {String.fromCharCode(65 + index)}. {option}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={retryAnswer}
                              onChange={(e) => setRetryAnswer(e.target.value)}
                              className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                              placeholder="请输入答案"
                            />
                          )}
                          <div className="flex gap-2.5 md:gap-3">
                            <button
                              onClick={() => handleSubmitRetry(answer.questionId)}
                              disabled={!retryAnswer}
                              className="flex-1 bg-green-500 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl hover:bg-green-600 transition-colors disabled:bg-gray-300"
                            >
                              提交答案
                            </button>
                            <button
                              onClick={() => setRetryQuestion(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-2.5 md:py-3 text-sm md:text-base rounded-xl hover:bg-gray-300 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRetry(answer.questionId)}
                          className="w-full bg-blue-500 text-white py-2.5 md:py-3 text-sm md:text-base rounded-xl hover:bg-blue-600 transition-colors"
                        >
                          重做本题
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}