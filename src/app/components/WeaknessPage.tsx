import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { storage, KnowledgeStats } from '../utils/storage';
import { ArrowLeft, BookCheck } from 'lucide-react';

export default function WeaknessPage() {
  const navigate = useNavigate();
  const [weaknesses, setWeaknesses] = useState<KnowledgeStats[]>([]);

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

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">我的薄弱知识点</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {weaknesses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookCheck size={40} className="text-blue-500 md:w-12 md:h-12" />
                </div>
              </div>
              <div className="text-xl md:text-2xl mb-2" style={{ fontWeight: 700 }}>还没有做题记录</div>
              <div className="text-sm md:text-base text-gray-500 mb-6">开始答题后，系统会自动分析你的薄弱知识点</div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-500 text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg rounded-xl hover:bg-blue-600 transition-colors"
                style={{ fontWeight: 600 }}
              >
                去做题
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {weaknesses.map((stat, index) => {
                const status = getStatusInfo(stat.accuracy);
                return (
                  <div
                    key={stat.knowledgePoint}
                    className={`bg-white rounded-2xl shadow-sm border-2 ${status.border} overflow-hidden`}
                  >
                    <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-0 md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <span className="text-gray-400 text-sm md:text-lg">#{index + 1}</span>
                          <span className="text-base md:text-xl" style={{ fontWeight: 600 }}>{stat.knowledgePoint}</span>
                          <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6 text-xs md:text-base text-gray-500 flex-wrap">
                          <span>正确率 {stat.accuracy}%</span>
                          <span>已练习 {stat.total} 题</span>
                          <span>答对 {stat.correct} 题</span>
                        </div>
                        <div className="mt-2 md:mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              stat.accuracy < 60 ? 'bg-red-500' : stat.accuracy < 85 ? 'bg-yellow-500' : 'bg-green-500'
                            } rounded-full transition-all`}
                            style={{ width: `${stat.accuracy}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/graded-practice/${encodeURIComponent(stat.knowledgePoint)}`)}
                        className="md:ml-6 bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:bg-blue-600 transition-colors whitespace-nowrap w-full md:w-auto"
                        style={{ fontWeight: 600, fontSize: '15px' }}
                      >
                        去训练
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}