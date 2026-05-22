import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import {
  Bot, BookOpen, BarChart3,
  Settings, LogOut, User, GraduationCap, AlertCircle, TrendingUp, BarChart2,
  FileText, Layout, Zap, ClipboardList, CheckCircle, Clock, Download
} from 'lucide-react';

const ADMIN_CARDS = [
  {
    title: '题目管理',
    desc: '浏览、搜索、新增、编辑和删除题目',
    icon: BarChart3,
    path: '/teacher/question-manage',
    color: 'bg-blue-500',
  },
  {
    title: '科目章节设置',
    desc: '管理年级、科目和章节结构',
    icon: BookOpen,
    path: '/teacher/subject-chapters',
    color: 'bg-green-500',
  },
  {
    title: '网课管理',
    desc: '课程定价、班级权限、视频管理',
    icon: Settings,
    path: '/teacher/course-management',
    color: 'bg-orange-500',
  },
  {
    title: '班级管理',
    desc: '学生名单、邀请码、扫码加入',
    icon: GraduationCap,
    path: '/teacher/class-management',
    color: 'bg-rose-500',
  },
];

// 模拟班级数据
const CLASSES_DATA = [
  {
    id: 'cls001',
    name: '五年级1班',
    students: 42,
    practiceCount: 389,
    avgAccuracy: 68,
    yesterdayAccuracy: 65,
    yesterdayPracticeCount: 42,
    yesterdayAtRiskCount: 3,
    weeklyTrend: [
      { day: '周一', accuracy: 62 },
      { day: '周二', accuracy: 64 },
      { day: '周三', accuracy: 65 },
      { day: '周四', accuracy: 68 },
      { day: '周五', accuracy: 70 },
    ],
    weakPoints: [
      { name: '进位加法', accuracy: 52, students: 28 },
      { name: '分数应用', accuracy: 55, students: 25 },
      { name: '应用题', accuracy: 61, students: 20 },
    ],
    atRiskStudents: [
      { name: '李明', accuracy: 48, subjects: ['进位加法', '分数应用'] },
      { name: '王红', accuracy: 52, subjects: ['应用题', '进位加法'] },
    ],
    activeTask: {
      name: '进位加法强化周练',
      subject: '数学',
      knowledgePoint: '进位加法',
      questionCount: 10,
      difficulty: '简单 → 中等',
      dueDate: '2026-05-25 23:59',
      beforeAccuracy: 52,
      afterAccuracy: 71,
      completionRate: 98,
      completedStudents: 41,
      pendingStudents: ['王芳'],
      averageTime: '17 分钟',
      topProgress: [
        { name: '李明', before: 48, after: 78, progress: 30, score: '10/10' },
        { name: '王红', before: 52, after: 71, progress: 19, score: '9/10' },
        { name: '张三', before: 80, after: 88, progress: 8, score: '10/10' },
      ],
      distribution: [
        { label: '优秀 (90%+)', count: 12, percent: 29, color: 'bg-green-500' },
        { label: '良好 (75-90%)', count: 18, percent: 44, color: 'bg-blue-500' },
        { label: '中等 (60-75%)', count: 9, percent: 22, color: 'bg-yellow-500' },
        { label: '需加强 (<60%)', count: 2, percent: 5, color: 'bg-red-500' },
      ],
    },
  },
];

// 获取准确度的颜色
const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 85) return 'text-green-600 bg-green-50';
  if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

// 获取进度条颜色
const getProgressColor = (accuracy: number) => {
  if (accuracy >= 85) return 'bg-green-500';
  if (accuracy >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

// 获取准确度标签
const getAccuracyLabel = (accuracy: number) => {
  if (accuracy >= 85) return '掌握';
  if (accuracy >= 60) return '待巩固';
  return '薄弱';
};

type TabType = 'overview' | 'report' | 'tools';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const [selectedClass, setSelectedClass] = useState('cls001');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const currentClass = CLASSES_DATA.find(c => c.id === selectedClass) || CLASSES_DATA[0];

  const handleLogout = () => {
    storage.logout();
    navigate('/');
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <header className="bg-white px-4 md:px-6 py-2.5 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <span className="text-slate-900" style={{ fontSize: '15px', fontWeight: 800 }}>
            教师管理后台
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-md">
            <User size={15} className="text-slate-500" />
            <span className="text-slate-600 text-sm" style={{ fontWeight: 700 }}>{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="text-sm hidden md:inline">退出</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white px-4 md:px-6 py-0 flex-shrink-0 border-b border-slate-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            <Layout size={18} />
            每日概览
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            <FileText size={18} />
            学情报告
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            <BarChart3 size={18} />
            教学管理工具
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 overflow-auto p-3 md:p-5">
        <div className="max-w-7xl mx-auto">
          {/* 每日概览 Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="mb-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-slate-950" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1.2 }}>每日概览</h1>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>优先处理薄弱知识点和低正确率学生</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 overflow-x-auto">
                    {CLASSES_DATA.map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls.id)}
                        className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex-shrink-0 border ${
                          selectedClass === cls.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                        style={{ fontWeight: 700, fontSize: '13px' }}
                      >
                        {cls.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('report')} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50" style={{ fontWeight: 700, fontSize: '13px' }}>
                    学情报告
                  </button>
                  <button onClick={() => setActiveTab('report')} className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700" style={{ fontWeight: 700, fontSize: '13px' }}>
                    生成建议
                  </button>
                </div>
              </div>

              <section className="bg-white border border-slate-200 mb-3">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200">
                  {[
                    { label: '昨日练习', value: currentClass.yesterdayPracticeCount, sub: `次 / ${currentClass.students} 人`, color: 'text-blue-700' },
                    { label: '平均准确率', value: `${currentClass.yesterdayAccuracy}%`, sub: '较前日 +3%', color: 'text-emerald-700' },
                    { label: '完成率', value: '88%', sub: '37 / 42 学生', color: 'text-indigo-700' },
                    { label: '需关注', value: currentClass.yesterdayAtRiskCount, sub: '低于 60%', color: 'text-red-700' },
                  ].map(item => (
                    <div key={item.label} className="px-4 py-3">
                      <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</div>
                      <div className={`${item.color} mt-1`} style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{item.value}</div>
                      <div className="text-slate-400 mt-1" style={{ fontSize: '12px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-3 mb-3">
                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={17} className="text-amber-600" />
                      <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>今日优先讲解</h2>
                    </div>
                    <span className="text-slate-400" style={{ fontSize: '12px', fontWeight: 700 }}>按掌握度排序</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-slate-500" style={{ fontSize: '12px', fontWeight: 800 }}>
                          <th className="px-4 py-2 w-14">优先级</th>
                          <th className="px-3 py-2">知识点</th>
                          <th className="px-3 py-2 w-28">掌握度</th>
                          <th className="px-3 py-2 w-32">失分学生</th>
                          <th className="px-3 py-2">教学建议</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentClass.weakPoints.map((point, idx) => (
                          <tr key={point.name} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-500" style={{ fontWeight: 800, fontSize: '13px' }}>#{idx + 1}</td>
                            <td className="px-3 py-3 text-slate-900" style={{ fontWeight: 800, fontSize: '14px' }}>{point.name}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-1 rounded text-xs ${getAccuracyColor(point.accuracy)}`} style={{ fontWeight: 800 }}>
                                {getAccuracyLabel(point.accuracy)} · {point.accuracy}%
                              </span>
                            </td>
                            <td className="px-3 py-3 text-slate-700" style={{ fontWeight: 700, fontSize: '13px' }}>{point.students} 人</td>
                            <td className="px-3 py-3 text-slate-600" style={{ fontSize: '13px' }}>
                              {point.accuracy < 60 && '全班讲解，课后补基础题'}
                              {point.accuracy >= 60 && point.accuracy < 75 && '讲评典型错题，安排巩固练习'}
                              {point.accuracy >= 75 && '课前复盘后过渡新知识点'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={17} className="text-red-600" />
                      <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>需跟进学生</h2>
                    </div>
                    <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded" style={{ fontSize: '12px', fontWeight: 800 }}>{currentClass.atRiskStudents.length} 人</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {currentClass.atRiskStudents.map(student => (
                      <div key={student.name} className="px-4 py-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-slate-900" style={{ fontWeight: 800, fontSize: '14px' }}>{student.name}</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {student.subjects.map(subject => (
                                <span key={subject} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded" style={{ fontSize: '11px', fontWeight: 700 }}>
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-red-700" style={{ fontWeight: 800, fontSize: '18px' }}>{student.accuracy}%</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="bg-slate-200 rounded-full h-1.5 overflow-hidden flex-1">
                            <div className="h-full bg-red-500" style={{ width: `${student.accuracy}%` }} />
                          </div>
                          <button onClick={() => navigate('/teacher/class-management')} className="text-blue-700 hover:text-blue-900" style={{ fontSize: '12px', fontWeight: 800 }}>跟进</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-3 mb-3">
                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                    <BarChart2 size={17} className="text-blue-600" />
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>成绩分布</h2>
                  </div>

                  <div className="p-4 space-y-3">
                    {[
                      { label: '优秀', range: '90% 以上', count: 8, percent: 19, color: 'bg-green-500' },
                      { label: '良好', range: '75-90%', count: 15, percent: 36, color: 'bg-blue-500' },
                      { label: '中等', range: '60-75%', count: 15, percent: 36, color: 'bg-yellow-500' },
                      { label: '需帮扶', range: '低于 60%', count: 4, percent: 9, color: 'bg-red-500' },
                    ].map(item => (
                      <div key={item.label} className="grid grid-cols-[92px_1fr_48px] items-center gap-3">
                        <div className="text-slate-700" style={{ fontWeight: 800, fontSize: '13px' }}>
                          {item.label}<span className="block text-slate-400" style={{ fontWeight: 600, fontSize: '11px' }}>{item.range}</span>
                        </div>
                        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                        <div className="text-right text-slate-600" style={{ fontSize: '12px', fontWeight: 800 }}>{item.count}人</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>本周准确率趋势</h2>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded" style={{ fontWeight: 800, fontSize: '12px' }}>+8%</span>
                  </div>
                  <div className="px-4 py-3 flex items-end gap-3 h-40">
                    {currentClass.weeklyTrend.map((trend, idx) => (
                      <div key={idx} className="flex-1 text-center min-w-0">
                        <div className="h-24 flex items-end bg-slate-50 border border-slate-100">
                          <div className="w-full bg-blue-600 mx-auto" style={{ height: `${Math.max(trend.accuracy, 18)}%` }} />
                        </div>
                        <div className="text-slate-700 mt-1" style={{ fontWeight: 800, fontSize: '12px' }}>{trend.accuracy}%</div>
                        <div className="text-slate-400" style={{ fontSize: '11px' }}>{trend.day}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* 学情报告 Tab */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <h1 className="text-gray-800" style={{ fontWeight: 800, fontSize: '22px' }}>
                    学情报告
                  </h1>
                  <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>
                    查看班级诊断、教学任务闭环和效果评估
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" style={{ fontWeight: 600, fontSize: '14px' }}>
                    导出报告
                  </button>
                  <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" style={{ fontWeight: 600, fontSize: '14px' }}>
                    打印
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} className="text-blue-500" />
                      <h2 className="text-gray-800" style={{ fontWeight: 800, fontSize: '20px' }}>
                        {currentClass.name} 学情分析报告
                      </h2>
                    </div>
                    <div className="text-gray-500" style={{ fontSize: '13px' }}>
                      报告周期：2026-05-18 至 2026-05-22
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg" style={{ fontWeight: 600, fontSize: '13px' }}>
                    示例报告
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>参与学生</div>
                    <div className="text-blue-600 mt-2" style={{ fontWeight: 800, fontSize: '22px' }}>{currentClass.students}</div>
                    <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>全班人数</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>平均正确率</div>
                    <div className="text-green-600 mt-2" style={{ fontWeight: 800, fontSize: '22px' }}>{currentClass.avgAccuracy}%</div>
                    <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>较上周 +4%</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>完成练习</div>
                    <div className="text-purple-600 mt-2" style={{ fontWeight: 800, fontSize: '22px' }}>{currentClass.practiceCount}</div>
                    <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>本周次数</div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>重点关注</div>
                    <div className="text-red-600 mt-2" style={{ fontWeight: 800, fontSize: '22px' }}>{currentClass.atRiskStudents.length}</div>
                    <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>低于 60%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <section className="border border-gray-100 rounded-xl p-4">
                      <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>
                        核心结论
                      </h3>
                      <div className="space-y-3 text-gray-700" style={{ fontSize: '14px', lineHeight: 1.7 }}>
                        <p>本周班级整体正确率为 {currentClass.avgAccuracy}%，基础题完成情况稳定，计算类题目表现有所提升。</p>
                        <p>主要失分集中在“{currentClass.weakPoints[0]?.name}”和“{currentClass.weakPoints[1]?.name}”，需要安排一次集中讲解和分层巩固练习。</p>
                        <p>{currentClass.atRiskStudents.length} 名学生低于 60%，建议优先进行错题复盘和一对一跟进。</p>
                      </div>
                    </section>

                    <section className="border border-gray-100 rounded-xl p-4">
                      <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>
                        薄弱知识点诊断
                      </h3>
                      <div className="space-y-3">
                        {currentClass.weakPoints.map((point, idx) => (
                          <div key={point.name} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="md:w-36 flex items-center gap-2">
                              <span className="text-gray-400" style={{ fontWeight: 700, fontSize: '13px' }}>#{idx + 1}</span>
                              <span className="text-gray-800" style={{ fontWeight: 700, fontSize: '14px' }}>{point.name}</span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className={`h-full ${getProgressColor(point.accuracy)}`} style={{ width: `${point.accuracy}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between md:w-44">
                              <span className={`px-2.5 py-1 rounded-full text-xs ${getAccuracyColor(point.accuracy)}`} style={{ fontWeight: 600 }}>
                                {getAccuracyLabel(point.accuracy)} {point.accuracy}%
                              </span>
                              <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 600 }}>
                                {point.students} 人失分
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-5">
                    <section className="border border-gray-100 rounded-xl p-4">
                      <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>
                        学生分层建议
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-green-700" style={{ fontWeight: 700, fontSize: '14px' }}>优秀层</div>
                          <div className="text-gray-600 mt-1" style={{ fontSize: '13px', lineHeight: 1.6 }}>安排拓展题，保持解题速度和表达规范。</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <div className="text-yellow-700" style={{ fontWeight: 700, fontSize: '14px' }}>巩固层</div>
                          <div className="text-gray-600 mt-1" style={{ fontSize: '13px', lineHeight: 1.6 }}>针对易错题型进行 10 分钟小测和讲评。</div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="text-red-700" style={{ fontWeight: 700, fontSize: '14px' }}>帮扶层</div>
                          <div className="text-gray-600 mt-1" style={{ fontSize: '13px', lineHeight: 1.6 }}>跟进 {currentClass.atRiskStudents.map(student => student.name).join('、')}，优先补齐基础概念。</div>
                        </div>
                      </div>
                    </section>

                    <section className="border border-gray-100 rounded-xl p-4">
                      <h3 className="text-gray-800 mb-3" style={{ fontWeight: 700, fontSize: '16px' }}>
                        下周教学安排
                      </h3>
                      <div className="space-y-2 text-gray-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                        <div>1. 复讲 {currentClass.weakPoints[0]?.name} 的典型错题。</div>
                        <div>2. 设置 {currentClass.weakPoints[1]?.name} 专项练习。</div>
                        <div>3. 周五前完成低正确率学生回访。</div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 学情报告中的教学闭环 Section */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                  <h1 className="text-gray-800" style={{ fontWeight: 800, fontSize: '22px' }}>
                    教学闭环跟踪
                  </h1>
                  <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>
                    从布置任务到效果评估，验证课堂讲解是否真正转化为学生掌握度
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2" style={{ fontWeight: 600, fontSize: '14px' }}>
                    <ClipboardList size={16} />
                    新建任务
                  </button>
                  <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2" style={{ fontWeight: 600, fontSize: '14px' }}>
                    <Download size={16} />
                    下载报告
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList size={18} className="text-blue-500" />
                    <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                      创建练习任务示例
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>任务名称</div>
                      <div className="text-gray-800" style={{ fontSize: '15px', fontWeight: 700 }}>{currentClass.activeTask.name}</div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>目标知识点</div>
                      <div className="text-gray-800" style={{ fontSize: '15px', fontWeight: 700 }}>{currentClass.activeTask.knowledgePoint}</div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>题目设置</div>
                      <div className="text-gray-800" style={{ fontSize: '15px', fontWeight: 700 }}>
                        {currentClass.activeTask.questionCount} 道，{currentClass.activeTask.difficulty}
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="text-gray-500 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>截止时间</div>
                      <div className="text-gray-800" style={{ fontSize: '15px', fontWeight: 700 }}>{currentClass.activeTask.dueDate}</div>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-blue-700 mb-2" style={{ fontSize: '14px', fontWeight: 700 }}>任务目标</div>
                    <div className="text-gray-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                      面向全班 {currentClass.students} 名学生布置进位加法强化练习，目标完成率 100%，目标掌握度 85%。任务说明会提醒学生关注个位进位和十位补进位这两个常见易错点。
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-orange-500" />
                    <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                      完成情况
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>完成率</span>
                        <span className="text-blue-600" style={{ fontSize: '14px', fontWeight: 800 }}>{currentClass.activeTask.completionRate}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${currentClass.activeTask.completionRate}%` }} />
                      </div>
                      <div className="text-gray-500 mt-2" style={{ fontSize: '12px' }}>
                        {currentClass.activeTask.completedStudents}/{currentClass.students} 人已完成
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>平均用时</div>
                        <div className="text-green-600 mt-1" style={{ fontSize: '18px', fontWeight: 800 }}>{currentClass.activeTask.averageTime}</div>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3">
                        <div className="text-gray-600" style={{ fontSize: '12px', fontWeight: 600 }}>未完成</div>
                        <div className="text-red-600 mt-1" style={{ fontSize: '18px', fontWeight: 800 }}>{currentClass.activeTask.pendingStudents.length} 人</div>
                      </div>
                    </div>

                    <div className="border border-red-100 bg-red-50 rounded-xl p-3">
                      <div className="text-red-700" style={{ fontSize: '13px', fontWeight: 700 }}>待提醒学生</div>
                      <div className="text-gray-700 mt-1" style={{ fontSize: '13px' }}>
                        {currentClass.activeTask.pendingStudents.join('、')}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-green-500" />
                  <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                    教学效果评估
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>任务前掌握度</div>
                    <div className="text-orange-600 mt-2" style={{ fontSize: '24px', fontWeight: 800 }}>{currentClass.activeTask.beforeAccuracy}%</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>任务后掌握度</div>
                    <div className="text-green-600 mt-2" style={{ fontSize: '24px', fontWeight: 800 }}>{currentClass.activeTask.afterAccuracy}%</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>提升幅度</div>
                    <div className="text-blue-600 mt-2" style={{ fontSize: '24px', fontWeight: 800 }}>
                      +{currentClass.activeTask.afterAccuracy - currentClass.activeTask.beforeAccuracy}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    {currentClass.activeTask.distribution.map(item => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</span>
                          <span className="text-gray-600" style={{ fontSize: '13px' }}>{item.count} 人 ({item.percent}%)</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-gray-100 rounded-xl p-4">
                    <h3 className="text-gray-800 mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>学生进步追踪</h3>
                    <div className="space-y-3">
                      {currentClass.activeTask.topProgress.map(student => (
                        <div key={student.name} className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-gray-800" style={{ fontSize: '14px', fontWeight: 700 }}>{student.name}</div>
                            <div className="text-gray-500" style={{ fontSize: '12px' }}>
                              {student.before}% → {student.after}%  ·  {student.score}
                            </div>
                          </div>
                          <div className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full" style={{ fontSize: '12px', fontWeight: 700 }}>
                            +{student.progress}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-green-500" />
                  <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '16px' }}>
                    周报告摘要
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-gray-50 rounded-xl p-4">
                    <div className="text-gray-800 mb-3" style={{ fontSize: '15px', fontWeight: 700 }}>家长通知示例</div>
                    <div className="space-y-2 text-gray-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                      <p>本周五年级1班重点突破进位加法，班级掌握度从 {currentClass.activeTask.beforeAccuracy}% 提升到 {currentClass.activeTask.afterAccuracy}%。</p>
                      <p>李明、王红进步明显，已经从需帮扶状态进入良好区间。王芳还未完成练习，建议周末及时补交。</p>
                      <p>下周将继续巩固进位加法，并逐步过渡到分数应用。</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" style={{ fontWeight: 600, fontSize: '14px' }}>
                      生成家长通知
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" style={{ fontWeight: 600, fontSize: '14px' }}>
                      导出成绩表
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" style={{ fontWeight: 600, fontSize: '14px' }}>
                      分析对比
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 教学管理工具 Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-gray-800" style={{ fontWeight: 800, fontSize: '22px' }}>
                  教学管理工具
                </h1>
                <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>
                  管理题库、科目、课程和班级
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ADMIN_CARDS.map(card => (
                  <button
                    key={card.path}
                    onClick={() => navigate(card.path)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-5 md:p-6 flex items-start gap-4 text-left border border-gray-100"
                  >
                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <card.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-gray-800" style={{ fontWeight: 700, fontSize: '17px' }}>{card.title}</div>
                      <div className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>{card.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
