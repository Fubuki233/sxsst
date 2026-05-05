import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { SUBJECTS } from '../utils/questions';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function ManageContent() {
  const navigate = useNavigate();
  const [subjects] = useState(SUBJECTS);
  const [chapters, setChapters] = useState<Record<string, { id: string; name: string; knowledgePoints: string[] }[]>>({});
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [newChapterName, setNewChapterName] = useState('');
  // Map of chapterId → current KP input value
  const [kpInputs, setKpInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setChapters(storage.getCustomChapters());
  }, []);

  const saveChapters = (data: Record<string, { id: string; name: string; knowledgePoints: string[] }[]>) => {
    storage.saveCustomChapters(data);
    setChapters(data);
  };

  const addChapter = () => {
    if (!newChapterName.trim()) return;
    const data = { ...chapters };
    if (!data[selectedSubject]) data[selectedSubject] = [];
    const id = `ch_${Date.now()}`;
    data[selectedSubject] = [...data[selectedSubject], { id, name: newChapterName.trim(), knowledgePoints: [] }];
    saveChapters(data);
    setNewChapterName('');
  };

  const deleteChapter = (subjectId: string, chapterId: string) => {
    const data = { ...chapters };
    data[subjectId] = data[subjectId].filter(c => c.id !== chapterId);
    if (data[subjectId].length === 0) delete data[subjectId];
    saveChapters(data);
  };

  const addKnowledgePoint = (subjectId: string, chapterId: string) => {
    const input = (kpInputs[chapterId] || '').trim();
    if (!input) return;
    const data = { ...chapters };
    const chapterIdx = data[subjectId].findIndex(c => c.id === chapterId);
    if (chapterIdx >= 0) {
      const kps = data[subjectId][chapterIdx].knowledgePoints;
      if (!kps.includes(input)) {
        data[subjectId][chapterIdx] = {
          ...data[subjectId][chapterIdx],
          knowledgePoints: [...kps, input]
        };
        saveChapters(data);
      }
    }
    setKpInputs(prev => ({ ...prev, [chapterId]: '' }));
  };

  const deleteKnowledgePoint = (subjectId: string, chapterId: string, kp: string) => {
    const data = { ...chapters };
    const chapterIdx = data[subjectId].findIndex(c => c.id === chapterId);
    if (chapterIdx >= 0) {
      data[subjectId][chapterIdx] = {
        ...data[subjectId][chapterIdx],
        knowledgePoints: data[subjectId][chapterIdx].knowledgePoints.filter(k => k !== kp)
      };
      saveChapters(data);
    }
  };

  const subjectChapters = chapters[selectedSubject] || [];

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">内容管理</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* Subject selector */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <label className="text-gray-700 mb-2 block" style={{ fontWeight: 600, fontSize: '14px' }}>选择科目</label>
            <div className="flex gap-2 flex-wrap">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    selectedSubject === s.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{ fontSize: '14px', fontWeight: selectedSubject === s.id ? 600 : 400 }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Add chapter */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '15px' }}>添加章节</h3>
            <div className="flex gap-2">
              <input
                value={newChapterName}
                onChange={e => setNewChapterName(e.target.value)}
                placeholder="输入章节名称"
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                style={{ fontSize: '14px' }}
                onKeyDown={e => e.key === 'Enter' && addChapter()}
              />
              <button onClick={addChapter} className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                <Plus size={16} /> 添加
              </button>
            </div>
          </div>

          {/* Chapter list */}
          <div className="space-y-3">
            {subjectChapters.map(ch => (
              <div key={ch.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>{ch.name}</span>
                  <button
                    onClick={() => { if (confirm('确定删除此章节？')) deleteChapter(selectedSubject, ch.id); }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Knowledge points */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {ch.knowledgePoints.map(kp => (
                    <span key={kp} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                      {kp}
                      <button onClick={() => deleteKnowledgePoint(selectedSubject, ch.id, kp)} className="hover:text-red-500">
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add KP */}
                <div className="flex gap-2">
                  <input
                    value={kpInputs[ch.id] || ''}
                    onChange={e => setKpInputs(prev => ({ ...prev, [ch.id]: e.target.value }))}
                    placeholder="输入知识点名称"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none text-sm"
                    onKeyDown={e => e.key === 'Enter' && addKnowledgePoint(selectedSubject, ch.id)}
                  />
                  <button
                    onClick={() => addKnowledgePoint(selectedSubject, ch.id)}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus size={14} /> 添加
                  </button>
                </div>
              </div>
            ))}

            {subjectChapters.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无自定义章节，请添加</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
