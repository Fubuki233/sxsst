import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { getAllKnowledgePoints, getAllChapters } from '../utils/questions';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';

// Helper: standalone KPs stored in localStorage
function getStandaloneKps(): string[] {
  return JSON.parse(localStorage.getItem('standalone_knowledge_points') || '[]');
}
function saveStandaloneKps(kps: string[]) {
  localStorage.setItem('standalone_knowledge_points', JSON.stringify(kps));
}

export default function KnowledgeEdit() {
  const navigate = useNavigate();
  const allKps = getAllKnowledgePoints();
  const allChapters = getAllChapters();

  const [knowledgePoints, setKnowledgePoints] = useState<string[]>([]);
  const [newKpName, setNewKpName] = useState('');
  const [editingKp, setEditingKp] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    refreshKps();
  }, []);

  const refreshKps = () => {
    // Merge: built-in (from questions.ts) + custom chapters + standalone
    const builtin = getAllKnowledgePoints();
    const standalone = getStandaloneKps();
    const merged = [...new Set([...builtin, ...standalone])];
    setKnowledgePoints(merged);
  };

  // ── Add new standalone KP ──
  const addKp = () => {
    const trimmed = newKpName.trim();
    if (!trimmed) return;
    if (knowledgePoints.includes(trimmed)) {
      alert('该知识点已存在');
      return;
    }
    const standalone = getStandaloneKps();
    standalone.push(trimmed);
    saveStandaloneKps(standalone);
    setNewKpName('');
    refreshKps();
  };

  // ── Delete standalone KP ──
  const deleteKp = (kp: string) => {
    if (!confirm(`确定删除知识点「${kp}」？将从自定义章节中移除。`)) return;

    // Remove from standalone list
    const standalone = getStandaloneKps().filter(k => k !== kp);
    saveStandaloneKps(standalone);

    // Remove from custom chapters
    const customChapters = storage.getCustomChapters();
    for (const [subj, chs] of Object.entries(customChapters)) {
      for (let i = 0; i < chs.length; i++) {
        chs[i] = { ...chs[i], knowledgePoints: chs[i].knowledgePoints.filter(k => k !== kp) };
      }
    }
    storage.saveCustomChapters(customChapters);

    refreshKps();
  };

  // Find which chapter(s) a KP belongs to
  const findSources = (kp: string): string[] => {
    const sources: string[] = [];
    for (const [subj, chs] of Object.entries(allChapters)) {
      for (const ch of chs) {
        if (ch.knowledgePoints.includes(kp)) {
          sources.push(`${subj} > ${ch.name}`);
        }
      }
    }
    return sources;
  };

  const startEdit = (kp: string) => {
    setEditingKp(kp);
    setEditValue(kp);
  };

  const saveEdit = (oldKp: string) => {
    if (!editValue.trim() || editValue.trim() === oldKp) {
      setEditingKp(null);
      return;
    }

    // Update standalone KPs
    const standalone = getStandaloneKps();
    const idx = standalone.indexOf(oldKp);
    if (idx >= 0) {
      standalone[idx] = editValue.trim();
      saveStandaloneKps(standalone);
    }

    // Update in custom chapters
    const customChapters = storage.getCustomChapters();
    let changed = false;
    for (const [subj, chs] of Object.entries(customChapters)) {
      for (let i = 0; i < chs.length; i++) {
        const kpIdx = chs[i].knowledgePoints.indexOf(oldKp);
        if (kpIdx >= 0) {
          chs[i] = {
            ...chs[i],
            knowledgePoints: chs[i].knowledgePoints.map(k => k === oldKp ? editValue.trim() : k)
          };
          changed = true;
        }
      }
    }
    if (changed) {
      storage.saveCustomChapters(customChapters);
    }

    // Update in custom questions
    const customQuestions = storage.getCustomQuestions();
    let qChanged = false;
    const updatedQuestions = customQuestions.map(q => {
      if (q.knowledgePoint === oldKp) {
        qChanged = true;
        return { ...q, knowledgePoint: editValue.trim() };
      }
      return q;
    });
    if (qChanged) {
      storage.saveCustomQuestions(updatedQuestions);
    }

    setEditingKp(null);
    refreshKps();
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">知识点编辑</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Add new KP */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '15px' }}>添加知识点</h3>
            <div className="flex gap-2">
              <input
                value={newKpName}
                onChange={e => setNewKpName(e.target.value)}
                placeholder="输入新知识点名称"
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-sm"
                onKeyDown={e => e.key === 'Enter' && addKp()}
              />
              <button onClick={addKp} className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5">
                <Plus size={16} /> 添加
              </button>
            </div>
          </div>

          {/* All KPs */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '15px' }}>所有知识点</h3>
            <p className="text-xs text-gray-400 mb-3">
              提示：内置知识点不可直接修改。紫色为自定义知识点，可直接编辑或删除。
            </p>
          </div>

          {/* Knowledge point list */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              {knowledgePoints.sort().map(kp => {
                const sources = findSources(kp);
                const isStandalone = getStandaloneKps().includes(kp);
                const isCustom = sources.length === 0 || isStandalone;
                const isEditing = editingKp === kp;

                return (
                  <div key={kp} className="group relative">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="px-3 py-1.5 border-2 border-blue-400 rounded-lg text-sm w-40"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveEdit(kp)}
                        />
                        <button onClick={() => saveEdit(kp)} className="p-1 bg-green-500 text-white rounded-lg">
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                        isCustom ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span>{kp}</span>
                        <button onClick={() => startEdit(kp)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity">
                          ✎
                        </button>
                        {isCustom && (
                          <button onClick={() => deleteKp(kp)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
