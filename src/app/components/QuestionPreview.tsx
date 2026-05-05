import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SUBJECTS, getAllQuestions } from '../utils/questions';
import { Question } from '../utils/storage';
import { ArrowLeft, Search } from 'lucide-react';

const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };
const DIFF_COLORS: Record<string, string> = { easy: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', hard: 'text-red-600 bg-red-50' };

export default function QuestionPreview() {
  const navigate = useNavigate();
  const allQuestions = getAllQuestions();
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchText, setSearchText] = useState('');

  const filtered = allQuestions.filter(q => {
    if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
    if (searchText && !q.question.includes(searchText) && !q.knowledgePoint.includes(searchText)) return false;
    return true;
  });

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">题目预览</span>
        <span className="text-gray-400 text-sm ml-auto">{filtered.length} 题</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="搜索题目或知识点..."
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white"
              />
            </div>
            <button onClick={() => setFilterSubject('all')}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterSubject === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              全部
            </button>
            {SUBJECTS.map(s => (
              <button key={s.id} onClick={() => setFilterSubject(s.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterSubject === s.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {s.name}
              </button>
            ))}
          </div>

          {/* Question list */}
          <div className="space-y-3">
            {filtered.map(q => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-sm mb-2" style={{ fontWeight: 600 }}>{q.question}</div>
                    <div className="flex gap-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {SUBJECTS.find(s => s.id === q.subject)?.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty]}`}>
                        {DIFF_LABELS[q.difficulty]}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{q.knowledgePoint}</span>
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">答案: {q.answer}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">暂无匹配题目</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
