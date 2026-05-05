import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { ArrowLeft, Plus, Trash2, QrCode, Link, Smartphone, UserPlus, X, BookOpen, Target, TrendingUp } from 'lucide-react';

// ── Demo data ──
function getDemoStudents() {
  return JSON.parse(localStorage.getItem('demo_students') || '[]') as { id: string; name: string; phone: string; grade: number; status: string }[];
}
function saveDemoStudents(list: any[]) {
  localStorage.setItem('demo_students', JSON.stringify(list));
}

// Real registered students merged with demo
function getAllStudents() {
  const real = storage.getStudents();
  const demo = getDemoStudents();
  return { real, demo };
}

export default function ClassManagement() {
  const navigate = useNavigate();
  const { real, demo } = getAllStudents();
  const [demoList, setDemoList] = useState(demo);
  const [tab, setTab] = useState<'roster' | 'invite'>('roster');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGrade, setNewGrade] = useState(1);
  const [inviteCode, setInviteCode] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const addStudent = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const list = [...demoList];
    list.push({
      id: `stu_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      grade: newGrade,
      status: '已加入',
    });
    saveDemoStudents(list);
    setDemoList(list);
    setNewName('');
    setNewPhone('');
  };

  const deleteStudent = (id: string) => {
    if (!confirm('确认移除该学生？')) return;
    const list = demoList.filter((s: any) => s.id !== id);
    saveDemoStudents(list);
    setDemoList(list);
  };

  const genInviteCode = () => {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setInviteCode(code);
  };

  const handlePhoneImport = () => {
    const phone = prompt('输入学生手机号：');
    if (phone) {
      setNewPhone(phone);
      setNewName('待审核学生');
    }
  };

  const allStudents = [
    ...real.map(r => ({ id: r.username, name: r.username, phone: '-', grade: r.grade, status: '已注册' })),
    ...demoList,
  ];

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">班级管理</span>
        <span className="text-gray-400 text-sm ml-auto">{allStudents.length} 名学生</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-1.5 flex gap-1.5">
            <button onClick={() => setTab('roster')}
              className={`flex-1 py-2.5 rounded-xl transition-colors ${tab === 'roster' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontWeight: tab === 'roster' ? 600 : 400, fontSize: '14px' }}>
              学生名单
            </button>
            <button onClick={() => setTab('invite')}
              className={`flex-1 py-2.5 rounded-xl transition-colors ${tab === 'invite' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontWeight: tab === 'invite' ? 600 : 400, fontSize: '14px' }}>
              邀请学生
            </button>
          </div>

          {tab === 'roster' && (
            <>
              {/* Add student */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '15px' }}>添加学生</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="学生姓名" className="flex-1 min-w-0 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none" />
                  <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
                    placeholder="手机号" className="flex-1 min-w-0 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none" />
                  <select value={newGrade} onChange={e => setNewGrade(Number(e.target.value))}
                    className="px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm">
                    {Array.from({ length: 9 }, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>{g <= 6 ? `小学${g}` : `初中${g - 6}`}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={addStudent}
                    className="bg-blue-500 text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5 text-sm">
                    <Plus size={16} /> 添加
                  </button>
                  <button onClick={handlePhoneImport}
                    className="bg-green-500 text-white px-4 py-2.5 rounded-xl hover:bg-green-600 transition-colors flex items-center gap-1.5 text-sm">
                    <Smartphone size={16} /> 手机号导入
                  </button>
                </div>
              </div>

              {/* Student list */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>姓名</th>
                        <th className="text-left px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>手机号</th>
                        <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>年级</th>
                        <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>状态</th>
                        <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStudents.map((s: any, idx: number) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedStudent(s.name)}>
                          <td className="px-4 py-3" style={{ fontWeight: 600 }}>{s.name}</td>
                          <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {s.grade <= 6 ? `小学${s.grade}` : `初中${s.grade - 6}`}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              s.status === '已注册' || s.status === '已加入' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                            }`}>{s.status}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {s.status !== '已注册' && (
                              <button onClick={(e) => { e.stopPropagation(); deleteStudent(s.id); }}
                                className="text-red-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {allStudents.length === 0 && (
                  <div className="text-center py-12 text-gray-400">暂无学生，请添加或邀请</div>
                )}
              </div>
            </>
          )}

          {tab === 'invite' && (
            <div className="space-y-4">
              {/* QR Code invite */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '16px' }}>二维码邀请</h3>
                <div className="w-40 h-40 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode size={48} className="text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-400 text-xs">学生扫码加入</div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs">学生使用手机扫码后自动申请加入班级</p>
              </div>

              {/* Invite code */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '16px' }}>邀请码</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-6 py-3">
                    <span className="text-gray-800" style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '4px' }}>
                      {inviteCode || '--------'}
                    </span>
                  </div>
                </div>
                <button onClick={genInviteCode}
                  className="bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5 mx-auto text-sm"
                  style={{ fontWeight: 600 }}>
                  <Link size={16} />
                  {inviteCode ? '重新生成' : '生成邀请码'}
                </button>
                <p className="text-gray-400 text-xs mt-2">学生输入邀请码即可加入</p>
              </div>

              {/* Link share */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <h3 className="text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '16px' }}>链接邀请</h3>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500 mb-3 break-all border border-gray-200">
                  https://sxsst.example.com/join?class=teacher001
                </div>
                <button
                  onClick={() => { navigator.clipboard?.writeText('https://sxsst.example.com/join?class=teacher001'); alert('已复制链接'); }}
                  className="bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5 mx-auto text-sm"
                  style={{ fontWeight: 600 }}>
                  <Link size={16} /> 复制邀请链接
                </button>
              </div>
            </div>
          )}

          {/* ── Student Detail Modal ── */}
          {selectedStudent && (
            <>
              <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.35)' }}
                onClick={() => setSelectedStudent(null)} />
              <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto pointer-events-none">
                <div className="bg-white rounded-2xl shadow-2xl m-4 md:m-8 p-4 md:p-6 w-full max-w-md pointer-events-auto"
                  style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                      {selectedStudent} 的学情
                    </h3>
                    <button onClick={() => setSelectedStudent(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                      <X size={18} />
                    </button>
                  </div>

                  {(() => {
                    const allAnswers = storage.getAllAnswers();
                    const answers = allAnswers[selectedStudent] || [];
                    const total = answers.length;
                    const correct = answers.filter(a => a.isCorrect).length;
                    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                    // Group by knowledge point
                    const kpMap = new Map<string, { total: number; correct: number }>();
                    answers.forEach(a => {
                      if (!kpMap.has(a.knowledgePoint)) kpMap.set(a.knowledgePoint, { total: 0, correct: 0 });
                      const item = kpMap.get(a.knowledgePoint)!;
                      item.total++;
                      if (a.isCorrect) item.correct++;
                    });
                    const kpList = Array.from(kpMap.entries())
                      .map(([kp, v]) => ({ kp, accuracy: Math.round((v.correct / v.total) * 100), total: v.total, correct: v.correct }))
                      .sort((a, b) => a.accuracy - b.accuracy);

                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <BookOpen size={18} className="text-blue-500 mx-auto mb-1" />
                            <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '18px' }}>{total}</div>
                            <div className="text-gray-500 text-xs">做题数</div>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3 text-center">
                            <Target size={18} className="text-green-500 mx-auto mb-1" />
                            <div className="text-green-600" style={{ fontWeight: 800, fontSize: '18px' }}>{accuracy}%</div>
                            <div className="text-gray-500 text-xs">正确率</div>
                          </div>
                          <div className="bg-red-50 rounded-xl p-3 text-center">
                            <TrendingUp size={18} className="text-red-500 mx-auto mb-1" />
                            <div className="text-red-600" style={{ fontWeight: 800, fontSize: '18px' }}>{kpList.filter(k => k.accuracy < 60).length}</div>
                            <div className="text-gray-500 text-xs">薄弱点</div>
                          </div>
                        </div>

                        {kpList.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>知识点掌握</h4>
                            {kpList.map(({ kp, accuracy, total, correct }) => (
                              <div key={kp} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-700 truncate">{kp}</span>
                                    <span className={accuracy < 60 ? 'text-red-500' : accuracy < 85 ? 'text-yellow-600' : 'text-green-600'}>
                                      {accuracy}% ({correct}/{total})
                                    </span>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${accuracy < 60 ? 'bg-red-500' : accuracy < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                      style={{ width: `${accuracy}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm">暂无做题记录</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
