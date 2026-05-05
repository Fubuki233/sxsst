import { useParams, useNavigate } from 'react-router';
import { SUBJECTS, getAllChapters } from '../utils/questions';
import { storage } from '../utils/storage';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'free' | 'weak'>('free');
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const chapters = getAllChapters()[subjectId || ''] || [];
  const [knowledgeStats, setKnowledgeStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const stats = storage.getKnowledgeStats();
    const statsMap: Record<string, number> = {};
    stats.forEach(s => {
      statsMap[s.knowledgePoint] = s.accuracy;
    });
    setKnowledgeStats(statsMap);
  }, []);

  if (!subject) return null;

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">{subject.name}</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Mode toggle */}
          <div className="bg-white rounded-2xl shadow-sm mb-4 md:mb-6 p-1.5 flex gap-1.5">
            <button
              onClick={() => setMode('free')}
              className={`flex-1 py-2.5 md:py-3 rounded-xl transition-colors ${
                mode === 'free' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontWeight: mode === 'free' ? 600 : 400, fontSize: '15px' }}
            >
              自由刷题
            </button>
            <button
              onClick={() => setMode('weak')}
              className={`flex-1 py-2.5 md:py-3 rounded-xl transition-colors ${
                mode === 'weak' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ fontWeight: mode === 'weak' ? 600 : 400, fontSize: '15px' }}
            >
              AI弱项补强
            </button>
          </div>

          {/* Chapter list */}
          <div className="space-y-3 md:space-y-4">
            {chapters.map(chapter => (
              <div key={chapter.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => navigate(`/practice/${subjectId}/${chapter.id}`)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left flex-1">
                    <div className="mb-2" style={{ fontWeight: 600, fontSize: '16px' }}>{chapter.name}</div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {chapter.knowledgePoints.map(kp => {
                        const accuracy = knowledgeStats[kp];
                        let statusColor = '';
                        let status = '';
                        if (accuracy !== undefined) {
                          if (accuracy < 60) { status = '薄弱'; statusColor = 'text-red-500'; }
                          else if (accuracy < 85) { status = '待巩固'; statusColor = 'text-yellow-600'; }
                          else { status = '已掌握'; statusColor = 'text-green-500'; }
                        }
                        return (
                          <span key={kp} className={`text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 rounded-full ${statusColor}`}>
                            {kp} {status && `· ${status}`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                    <ChevronRight size={16} className="text-white" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}