import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage, Answer } from '../utils/storage';
import { ArrowLeft, Users, Target, TrendingUp, BookOpen } from 'lucide-react';

interface StudentSummary {
  username: string;
  grade: number;
  totalAnswers: number;
  correct: number;
  accuracy: number;
  weakPoints: number;
  lastActive: number;
}

export default function StudentStats() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    const allUsers = storage.getStudents();
    const allAnswers = storage.getAllAnswers();

    const summaries: StudentSummary[] = allUsers.map(u => {
      const answers = allAnswers[u.username] || [];
      const correct = answers.filter(a => a.isCorrect).length;
      const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;

      // Count weak knowledge points
      const kpMap = new Map<string, { total: number; correct: number }>();
      answers.forEach(a => {
        if (!kpMap.has(a.knowledgePoint)) kpMap.set(a.knowledgePoint, { total: 0, correct: 0 });
        const item = kpMap.get(a.knowledgePoint)!;
        item.total++;
        if (a.isCorrect) item.correct++;
      });
      const weakCount = Array.from(kpMap.values()).filter(
        v => v.total >= 2 && (v.correct / v.total) < 0.6
      ).length;

      return {
        username: u.username,
        grade: u.grade,
        totalAnswers: answers.length,
        correct,
        accuracy,
        weakPoints: weakCount,
        lastActive: answers.length > 0 ? Math.max(...answers.map(a => a.timestamp)) : 0,
      };
    });

    summaries.sort((a, b) => b.totalAnswers - a.totalAnswers);
    setStudents(summaries);
  }, []);

  const viewStudentDetail = (username: string) => {
    setSelectedStudent(username);
    const allAnswers = storage.getAllAnswers();
    setStudentAnswers(allAnswers[username] || []);
  };

  const getGradeLabel = (grade: number) => {
    if (grade <= 6) return `小学${grade}年级`;
    return `初中${grade - 6}年级`;
  };

  if (selectedStudent) {
    const student = students.find(s => s.username === selectedStudent);
    const correct = studentAnswers.filter(a => a.isCorrect).length;
    const accuracy = studentAnswers.length > 0 ? Math.round((correct / studentAnswers.length) * 100) : 0;

    // Group by knowledge point
    const kpMap = new Map<string, { total: number; correct: number }>();
    studentAnswers.forEach(a => {
      if (!kpMap.has(a.knowledgePoint)) kpMap.set(a.knowledgePoint, { total: 0, correct: 0 });
      const item = kpMap.get(a.knowledgePoint)!;
      item.total++;
      if (a.isCorrect) item.correct++;
    });
    const kpList = Array.from(kpMap.entries()).map(([kp, v]) => ({
      kp,
      accuracy: Math.round((v.correct / v.total) * 100),
      total: v.total,
      correct: v.correct
    })).sort((a, b) => a.accuracy - b.accuracy);

    return (
      <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
        <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSelectedStudent(null)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">
            {selectedStudent} 的学习详情
          </span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '24px' }}>{studentAnswers.length}</div>
                <div className="text-gray-500 text-sm">总做题数</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="text-green-600" style={{ fontWeight: 800, fontSize: '24px' }}>{accuracy}%</div>
                <div className="text-gray-500 text-sm">正确率</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <div className="text-purple-600" style={{ fontWeight: 800, fontSize: '24px' }}>{student?.weakPoints}</div>
                <div className="text-gray-500 text-sm">薄弱知识点</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>知识点掌握情况</h3>
              {kpList.length === 0 ? (
                <div className="text-center py-6 text-gray-400">暂无数据</div>
              ) : (
                <div className="space-y-2">
                  {kpList.map(({ kp, accuracy, total, correct }) => (
                    <div key={kp} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{kp}</span>
                          <span className={accuracy < 60 ? 'text-red-500' : accuracy < 85 ? 'text-yellow-600' : 'text-green-600'}>
                            {accuracy}% ({correct}/{total})
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${accuracy < 60 ? 'bg-red-500' : accuracy < 85 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${accuracy}%` }} />
                        </div>
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

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/teacher')} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">学情统计</span>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Overall summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users size={20} className="text-blue-500" />
              </div>
              <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '22px' }}>{students.length}</div>
              <div className="text-gray-500 text-xs mt-0.5">学生总数</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen size={20} className="text-green-500" />
              </div>
              <div className="text-green-600" style={{ fontWeight: 800, fontSize: '22px' }}>
                {students.reduce((sum, s) => sum + s.totalAnswers, 0)}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">总做题量</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target size={20} className="text-yellow-500" />
              </div>
              <div className="text-yellow-600" style={{ fontWeight: 800, fontSize: '22px' }}>
                {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.accuracy, 0) / students.length) : 0}%
              </div>
              <div className="text-gray-500 text-xs mt-0.5">平均正确率</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={20} className="text-red-500" />
              </div>
              <div className="text-red-600" style={{ fontWeight: 800, fontSize: '22px' }}>
                {students.reduce((sum, s) => sum + s.weakPoints, 0)}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">薄弱知识点总数</div>
            </div>
          </div>

          {/* Student list */}
          {students.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">暂无学生数据</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>学生</th>
                      <th className="text-left px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>年级</th>
                      <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>做题数</th>
                      <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>正确率</th>
                      <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>薄弱点</th>
                      <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.username} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3" style={{ fontWeight: 600 }}>{s.username}</td>
                        <td className="px-4 py-3 text-gray-600">{getGradeLabel(s.grade)}</td>
                        <td className="px-4 py-3 text-center">{s.totalAnswers}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={s.accuracy >= 80 ? 'text-green-600' : s.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                            {s.accuracy}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={s.weakPoints > 0 ? 'text-red-500' : 'text-gray-400'}>{s.weakPoints}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => viewStudentDetail(s.username)}
                            className="text-blue-500 hover:underline text-xs"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
