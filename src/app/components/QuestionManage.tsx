import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage, Question } from '../utils/storage';
import { SUBJECTS, getAllChapters, getAllQuestions } from '../utils/questions';
import { ArrowLeft, Plus, Trash2, Upload, Search, Edit3, X, Save, Sparkles } from 'lucide-react';

const DIFFICULTIES: { value: Question['difficulty']; label: string; color: string }[] = [
  { value: 'easy', label: '简单', color: 'text-green-600' },
  { value: 'medium', label: '中等', color: 'text-yellow-600' },
  { value: 'hard', label: '困难', color: 'text-red-600' },
];
const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };
const DIFF_COLORS: Record<string, string> = { easy: 'text-green-600 bg-green-50', medium: 'text-yellow-600 bg-yellow-50', hard: 'text-red-600 bg-red-50' };

export default function QuestionManage() {
  const navigate = useNavigate();
  const allChapters = getAllChapters();

  // ── List state ──
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // ── Upload / Edit state ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<'choice' | 'fill'>('choice');
  const [subject, setSubject] = useState('math');
  const [chapter, setChapter] = useState('');
  const [knowledgePoint, setKnowledgePoint] = useState('');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('easy');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [warning, setWarning] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { refresh(); }, []);
  const refresh = () => setAllQuestions(getAllQuestions());

  const chapters = allChapters[subject] || [];
  const selectedChapterData = chapters.find(c => c.id === chapter);
  const knowledgePoints = selectedChapterData?.knowledgePoints || [];

  const resetForm = () => {
    setEditingId(null);
    setQuestionType('choice');
    setSubject('math');
    setChapter('');
    setKnowledgePoint('');
    setDifficulty('easy');
    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setExplanation('');
    setWarning('');
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setQuestionType(q.options && q.options.length > 0 ? 'choice' : 'fill');
    setSubject(q.subject);
    setChapter(q.chapter);
    setKnowledgePoint(q.knowledgePoint);
    setDifficulty(q.difficulty);
    setQuestionText(q.question);
    setOptions(q.options ? [...q.options, ...Array(4 - q.options.length).fill('')] : ['', '', '', '']);
    setAnswer(q.answer);
    setExplanation(q.explanation);
    setWarning(q.warning);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!questionText.trim() || !answer.trim()) {
      setMessage('请填写题目和答案');
      return;
    }
    const nonEmptyOptions = options.filter(o => o.trim());
    const q: Question = {
      id: editingId || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subject,
      chapter,
      knowledgePoint,
      difficulty,
      question: questionText.trim(),
      options: questionType === 'choice' && nonEmptyOptions.length > 0 ? nonEmptyOptions : undefined,
      answer: answer.trim(),
      explanation: explanation.trim(),
      warning: warning.trim(),
    };

    if (editingId) {
      storage.updateQuestion(q);
      setMessage('修改成功！');
    } else {
      storage.addQuestion(q);
      setMessage('上传成功！');
    }
    refresh();
    resetForm();
    setTimeout(() => setMessage(''), 2000);
  };

  const deleteQuestion = (id: string) => {
    if (!confirm('确定删除此题？')) return;
    storage.deleteQuestion(id);
    refresh();
  };

  // ── Filter ──
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
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">题目管理</span>
        <span className="text-gray-400 text-sm ml-auto">{filtered.length} 题</span>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-500 text-white px-4 py-1.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm">
          <Plus size={16} /> 新增
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* ── Upload / Edit Modal ── */}
          {showForm && (
            <>
              {/* Overlay */}
              <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.35)' }}
                onClick={() => { resetForm(); setShowForm(false); }} />
              {/* Modal panel */}
              <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pointer-events-none">
                <div className="bg-white rounded-2xl shadow-2xl m-4 md:m-8 p-4 md:p-6 w-full max-w-2xl pointer-events-auto"
                  style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                      {editingId ? '编辑题目' : '新增题目'}
                    </h3>
                    <button onClick={() => { resetForm(); setShowForm(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                      <X size={18} />
                    </button>
                  </div>

                  {/* Form body */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>科目</label>
                        <select value={subject} onChange={e => { setSubject(e.target.value); setChapter(''); setKnowledgePoint(''); }}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                          {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>章节</label>
                        <select value={chapter} onChange={e => { setChapter(e.target.value); setKnowledgePoint(''); }}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                          <option value="">-- 选择章节 --</option>
                          {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>知识点</label>
                        <select value={knowledgePoint} onChange={e => setKnowledgePoint(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                          <option value="">-- 选择知识点 --</option>
                          {knowledgePoints.map(kp => <option key={kp} value={kp}>{kp}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>难度</label>
                        <div className="flex gap-2">
                          {DIFFICULTIES.map(d => (
                            <button key={d.value} onClick={() => setDifficulty(d.value)}
                              className={`flex-1 py-2.5 rounded-xl border-2 transition-colors text-sm ${difficulty === d.value ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Question type toggle */}
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>题目类型</label>
                      <div className="bg-gray-100 rounded-xl p-1.5 flex gap-1.5">
                        <button onClick={() => setQuestionType('choice')}
                          className={`flex-1 py-2.5 rounded-xl transition-colors text-sm ${
                            questionType === 'choice' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                          }`} style={{ fontWeight: questionType === 'choice' ? 600 : 400 }}>
                          选择题
                        </button>
                        <button onClick={() => setQuestionType('fill')}
                          className={`flex-1 py-2.5 rounded-xl transition-colors text-sm ${
                            questionType === 'fill' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                          }`} style={{ fontWeight: questionType === 'fill' ? 600 : 400 }}>
                          填空题
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>题目内容</label>
                      <textarea value={questionText} onChange={e => setQuestionText(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-20" placeholder="请输入题目..." />
                    </div>

                    {/* Options: choice → A/B/C/D, fill → possible answer list */}
                    {questionType === 'choice' ? (
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>选项</label>
                        {options.map((opt, i) => (
                          <input key={i} value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm mb-2" placeholder={`选项 ${String.fromCharCode(65 + i)}`} />
                        ))}
                      </div>
                    ) : (
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>候选答案（选填，用于下拉选择）</label>
                        {options.map((opt, i) => (
                          <input key={i} value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm mb-2" placeholder={`候选答案 ${i + 1}`} />
                        ))}
                      </div>
                    )}

                    {/* Answer: dropdown for choice, text for fill */}
                    <div>
                      <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>正确答案</label>
                      {questionType === 'choice' ? (
                        <>
                          <select value={answer} onChange={e => setAnswer(e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                            <option value="">-- 选择一个选项 --</option>
                            {options.filter(o => o.trim()).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {options.filter(o => o.trim()).length === 0 && (
                            <p className="text-gray-400 text-xs mt-1">请先填写上方选项内容</p>
                          )}
                        </>
                      ) : (
                        <input value={answer} onChange={e => setAnswer(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm" placeholder="正确答案（填入文本）" />
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>知识点解析</label>
                          <button
                            onClick={() => setExplanation('（AI 生成内容将在此显示）')}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs hover:from-purple-600 hover:to-blue-600 transition-all shadow-sm"
                            style={{ fontWeight: 600 }}
                          >
                            <Sparkles size={12} /> AI 一键生成
                          </button>
                        </div>
                        <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-16" placeholder="解题思路..." />
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>易错提醒</label>
                        <textarea value={warning} onChange={e => setWarning(e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-16" placeholder="注意事项..." />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={handleSubmit}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        style={{ fontWeight: 600, fontSize: '15px' }}>
                        {editingId ? <><Save size={18} /> 保存修改</> : <><Upload size={18} /> 上传题目</>}
                      </button>
                      <button onClick={() => { resetForm(); setShowForm(false); }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors text-sm"
                        style={{ fontWeight: 600 }}>取消</button>
                    </div>

                    {message && (
                      <div className={`text-center py-2 rounded-xl text-sm ${message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Filters ── */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-0 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchText} onChange={e => setSearchText(e.target.value)}
                placeholder="搜索题目或知识点..."
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none bg-white" />
            </div>
            <button onClick={() => setFilterSubject('all')}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterSubject === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>全部</button>
            {SUBJECTS.map(s => (
              <button key={s.id} onClick={() => setFilterSubject(s.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterSubject === s.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{s.name}</button>
            ))}
          </div>

          {/* ── Question list ── */}
          <div className="space-y-3">
            {filtered.map(q => (
                <div key={q.id} className="bg-white rounded-2xl shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm mb-2" style={{ fontWeight: 600 }}>{q.question}</div>
                      <div className="flex gap-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {SUBJECTS.find(s => s.id === q.subject)?.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty]}`}>
                          {DIFF_LABELS[q.difficulty]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${q.options && q.options.length > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                          {q.options && q.options.length > 0 ? '选择题' : '填空题'}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{q.knowledgePoint}</span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">答案: {q.answer}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(q)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="编辑">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteQuestion(q.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="删除">
                        <Trash2 size={16} />
                      </button>
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
