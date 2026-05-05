import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage, Question } from '../utils/storage';
import { SUBJECTS, getAllChapters } from '../utils/questions';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';

const DIFFICULTIES: { value: Question['difficulty']; label: string; color: string }[] = [
  { value: 'easy', label: '简单', color: 'text-green-600' },
  { value: 'medium', label: '中等', color: 'text-yellow-600' },
  { value: 'hard', label: '困难', color: 'text-red-600' },
];

export default function QuestionUpload() {
  const navigate = useNavigate();
  const allChapters = getAllChapters();

  const [subject, setSubject] = useState('math');
  const [chapter, setChapter] = useState('');
  const [knowledgePoint, setKnowledgePoint] = useState('');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('easy');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [warning, setWarning] = useState('');
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [message, setMessage] = useState('');

  const chapters = allChapters[subject] || [];
  const selectedChapterData = chapters.find(c => c.id === chapter);
  const knowledgePoints = selectedChapterData?.knowledgePoints || [];

  useEffect(() => {
    setCustomQuestions(storage.getCustomQuestions());
    setChapter('');
    setKnowledgePoint('');
  }, [subject]);

  const handleUpload = () => {
    if (!questionText.trim() || !answer.trim()) {
      setMessage('请填写题目和答案');
      return;
    }

    const newQuestion: Question = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      subject,
      chapter,
      knowledgePoint,
      difficulty,
      question: questionText.trim(),
      options: options.filter(o => o.trim()).length > 0 ? options.filter(o => o.trim()) : undefined,
      answer: answer.trim(),
      explanation: explanation.trim(),
      warning: warning.trim(),
    };

    storage.addCustomQuestion(newQuestion);
    setCustomQuestions(storage.getCustomQuestions());
    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
    setExplanation('');
    setWarning('');
    setMessage('上传成功！');
    setTimeout(() => setMessage(''), 2000);
  };

  const deleteQuestion = (id: string) => {
    if (!confirm('确定删除此题？')) return;
    storage.deleteCustomQuestion(id);
    setCustomQuestions(storage.getCustomQuestions());
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">题目上传</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Upload form */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
            <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>上传新题目</h3>

            {/* Row 1: subject + chapter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>科目</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>章节</label>
                <select value={chapter} onChange={e => { setChapter(e.target.value); setKnowledgePoint(''); }} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                  <option value="">-- 选择章节 --</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: knowledge point + difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>知识点</label>
                <select value={knowledgePoint} onChange={e => setKnowledgePoint(e.target.value)} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                  <option value="">-- 选择知识点 --</option>
                  {knowledgePoints.map(kp => <option key={kp} value={kp}>{kp}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>难度</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`flex-1 py-2.5 rounded-xl border-2 transition-colors text-sm ${
                        difficulty === d.value ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question text */}
            <div>
              <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>题目内容</label>
              <textarea value={questionText} onChange={e => setQuestionText(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-20" placeholder="请输入题目..." />
            </div>

            {/* Options */}
            <div>
              <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>选项（留空则为填空题）</label>
              {options.map((opt, i) => (
                <input key={i} value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm mb-2" placeholder={`选项 ${String.fromCharCode(65 + i)}`} />
              ))}
            </div>

            {/* Answer */}
            <div>
              <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>正确答案</label>
              <input value={answer} onChange={e => setAnswer(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm" placeholder="正确答案（选择题填选项文字，填空题填数值）" />
            </div>

            {/* Explanation + Warning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>知识点解析</label>
                <textarea value={explanation} onChange={e => setExplanation(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-16" placeholder="解题思路..." />
              </div>
              <div>
                <label className="text-gray-600 text-sm mb-1 block" style={{ fontWeight: 600 }}>易错提醒</label>
                <textarea value={warning} onChange={e => setWarning(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm min-h-16" placeholder="注意事项..." />
              </div>
            </div>

            <button onClick={handleUpload}
              className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 600, fontSize: '15px' }}>
              <Upload size={18} /> 上传题目
            </button>

            {message && (
              <div className={`text-center py-2 rounded-xl text-sm ${
                message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Existing custom questions */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>
              已上传题目 ({customQuestions.length})
            </h3>
            {customQuestions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">暂无自定义题目</div>
            ) : (
              <div className="space-y-3">
                {customQuestions.map(q => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm mb-1.5" style={{ fontWeight: 600 }}>{q.question}</div>
                        <div className="flex gap-2 text-xs flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">答案: {q.answer}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{q.knowledgePoint}</span>
                          <span className={`px-2 py-0.5 rounded-full ${q.difficulty === 'easy' ? 'bg-green-50 text-green-600' : q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                            {{ easy: '简单', medium: '中等', hard: '困难' }[q.difficulty]}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => deleteQuestion(q.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
