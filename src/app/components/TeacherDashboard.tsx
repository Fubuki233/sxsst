import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import {
  Bot, BookOpen, BarChart3,
  Settings, LogOut, User, GraduationCap, AlertCircle, TrendingUp, BarChart2,
  FileText, Layout, ClipboardList, CheckCircle, Clock, Download
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
    studentReports: [
      {
        name: '李明',
        level: '帮扶层',
        accuracy: 78,
        previousAccuracy: 48,
        completedTasks: 6,
        totalTasks: 6,
        practiceMinutes: 94,
        questions: 86,
        trend: [
          { day: '周一', accuracy: 48 },
          { day: '周二', accuracy: 55 },
          { day: '周三', accuracy: 62 },
          { day: '周四', accuracy: 70 },
          { day: '周五', accuracy: 78 },
        ],
        mastery: [
          { name: '进位加法', accuracy: 78 },
          { name: '分数应用', accuracy: 56 },
          { name: '应用题', accuracy: 64 },
        ],
        strengths: ['进位加法专项练习完成稳定', '错题二刷正确率明显提升'],
        risks: ['分数应用概念仍不稳', '应用题读题速度偏慢'],
        nextSteps: ['本周继续完成 8 道分数应用基础题', '课堂提问时重点检查单位量识别', '周五复测进位加法保持情况'],
        parentNote: '李明本周练习完成度高，进位加法进步明显。建议周末用 15 分钟复盘分数应用概念，先保证基础题准确率。',
      },
      {
        name: '王红',
        level: '巩固层',
        accuracy: 71,
        previousAccuracy: 52,
        completedTasks: 5,
        totalTasks: 6,
        practiceMinutes: 81,
        questions: 74,
        trend: [
          { day: '周一', accuracy: 52 },
          { day: '周二', accuracy: 58 },
          { day: '周三', accuracy: 63 },
          { day: '周四', accuracy: 67 },
          { day: '周五', accuracy: 71 },
        ],
        mastery: [
          { name: '进位加法', accuracy: 71 },
          { name: '分数应用', accuracy: 68 },
          { name: '应用题', accuracy: 54 },
        ],
        strengths: ['计算题正确率持续上升', '订正后能复述解题步骤'],
        risks: ['应用题审题丢条件', '任务完成时间略晚'],
        nextSteps: ['每天 2 道应用题圈关键词', '补交未完成专项题', '课后 5 分钟讲解错因'],
        parentNote: '王红本周整体有进步，计算类题目更稳定。应用题还需要训练读题和圈条件，建议家长关注作业完成时间。',
      },
      {
        name: '张三',
        level: '优秀层',
        accuracy: 88,
        previousAccuracy: 80,
        completedTasks: 6,
        totalTasks: 6,
        practiceMinutes: 67,
        questions: 72,
        trend: [
          { day: '周一', accuracy: 80 },
          { day: '周二', accuracy: 82 },
          { day: '周三', accuracy: 83 },
          { day: '周四', accuracy: 86 },
          { day: '周五', accuracy: 88 },
        ],
        mastery: [
          { name: '进位加法', accuracy: 88 },
          { name: '分数应用', accuracy: 82 },
          { name: '应用题', accuracy: 79 },
        ],
        strengths: ['基础计算稳定', '完成速度快且订正质量高'],
        risks: ['复杂应用题表达不够完整'],
        nextSteps: ['增加 3 道拓展应用题', '要求完整书写数量关系', '保持错题本每周复盘'],
        parentNote: '张三本周表现稳定，可以适当增加拓展题，重点不是加题量，而是训练完整表达和多步分析。',
      },
    ],
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

type TabType = 'overview' | 'report' | 'studentReport' | 'tools';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const [selectedClass, setSelectedClass] = useState('cls001');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedStudentName, setSelectedStudentName] = useState('李明');

  const currentClass = CLASSES_DATA.find(c => c.id === selectedClass) || CLASSES_DATA[0];
  const selectedStudent = currentClass.studentReports.find(student => student.name === selectedStudentName) || currentClass.studentReports[0];

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
            onClick={() => setActiveTab('studentReport')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'studentReport'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
            }`}
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            <User size={18} />
            个人报告
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
                          <button
                            onClick={() => {
                              setSelectedStudentName(student.name);
                              setActiveTab('studentReport');
                            }}
                            className="text-blue-700 hover:text-blue-900"
                            style={{ fontSize: '12px', fontWeight: 800 }}
                          >
                            查看报告
                          </button>
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
            <div className="space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-slate-950" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1.2 }}>学情报告</h1>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>查看班级诊断、分层建议、教学任务闭环和周报摘要</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2" style={{ fontWeight: 700, fontSize: '13px' }}>
                    <Download size={16} />
                    导出报告
                  </button>
                  <button className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors" style={{ fontWeight: 700, fontSize: '13px' }}>
                    打印
                  </button>
                </div>
              </div>

              <section className="bg-white border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '16px' }}>{currentClass.name} 周学情分析</h2>
                    </div>
                    <div className="text-slate-500 mt-1" style={{ fontSize: '12px' }}>报告周期：2026-05-18 至 2026-05-22</div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto">
                    {CLASSES_DATA.map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls.id)}
                        className={`px-3 py-1.5 rounded-md whitespace-nowrap border transition-colors ${
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
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200">
                  {[
                    { label: '参与学生', value: currentClass.students, sub: '全班人数', color: 'text-blue-700' },
                    { label: '平均正确率', value: `${currentClass.avgAccuracy}%`, sub: '较上周 +4%', color: 'text-emerald-700' },
                    { label: '完成练习', value: currentClass.practiceCount, sub: '本周次数', color: 'text-indigo-700' },
                    { label: '重点关注', value: currentClass.atRiskStudents.length, sub: '低于 60%', color: 'text-red-700' },
                  ].map(item => (
                    <div key={item.label} className="px-4 py-3">
                      <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</div>
                      <div className={`${item.color} mt-1`} style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1 }}>{item.value}</div>
                      <div className="text-slate-400 mt-1" style={{ fontSize: '12px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4">
                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>班级诊断</h2>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '12px' }}>报告优先回答教师下一节课该处理什么</p>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="bg-slate-50 border border-slate-100 p-4">
                      <h3 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: '14px' }}>核心结论</h3>
                      <div className="space-y-2 text-slate-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                        <p>本周班级平均正确率为 {currentClass.avgAccuracy}%，较上周提升 4 个百分点，基础计算有所改善。</p>
                        <p>主要失分集中在“{currentClass.weakPoints[0]?.name}”和“{currentClass.weakPoints[1]?.name}”，建议先全班复讲，再按学生层级布置巩固任务。</p>
                        <p>{currentClass.atRiskStudents.length} 名学生低于 60%，需要在下次课后做短时一对一跟进。</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-slate-900 mb-3" style={{ fontWeight: 800, fontSize: '14px' }}>薄弱知识点</h3>
                      <div className="space-y-3">
                        {currentClass.weakPoints.map((point, idx) => (
                          <div key={point.name} className="grid grid-cols-1 md:grid-cols-[120px_1fr_118px] gap-2 md:items-center">
                            <div className="text-slate-800" style={{ fontWeight: 800, fontSize: '13px' }}>#{idx + 1} {point.name}</div>
                            <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className={`h-full ${getProgressColor(point.accuracy)}`} style={{ width: `${point.accuracy}%` }} />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${getAccuracyColor(point.accuracy)}`} style={{ fontWeight: 800 }}>{point.accuracy}%</span>
                              <span className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{point.students} 人失分</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { title: '优秀层', text: '安排拓展题，保持解题速度和表达规范。', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                        { title: '巩固层', text: '针对易错题型进行 10 分钟小测和讲评。', tone: 'bg-amber-50 text-amber-700 border-amber-100' },
                        { title: '帮扶层', text: `跟进 ${currentClass.atRiskStudents.map(student => student.name).join('、')}，优先补齐基础概念。`, tone: 'bg-red-50 text-red-700 border-red-100' },
                      ].map(item => (
                        <div key={item.title} className={`border p-3 ${item.tone}`}>
                          <div style={{ fontWeight: 800, fontSize: '13px' }}>{item.title}</div>
                          <div className="text-slate-700 mt-1" style={{ fontSize: '12px', lineHeight: 1.6 }}>{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

              </div>

              <section className="bg-white border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={17} className="text-blue-600" />
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>教学闭环跟踪</h2>
                  </div>
                  <button className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-2" style={{ fontWeight: 700, fontSize: '13px' }}>
                    <Clock size={15} />
                    新建任务
                  </button>
                </div>

                <div className="p-4 grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
                  <div className="space-y-3">
                    <div className="border border-slate-200 p-4">
                      <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>当前任务</div>
                      <div className="text-slate-900 mt-1" style={{ fontSize: '16px', fontWeight: 900 }}>{currentClass.activeTask.name}</div>
                      <div className="text-slate-600 mt-2" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                        面向全班 {currentClass.students} 名学生布置 {currentClass.activeTask.questionCount} 道题，目标知识点为 {currentClass.activeTask.knowledgePoint}，截止 {currentClass.activeTask.dueDate}。
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border border-slate-200 p-3">
                        <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>完成率</div>
                        <div className="text-blue-700 mt-1" style={{ fontSize: '22px', fontWeight: 900 }}>{currentClass.activeTask.completionRate}%</div>
                        <div className="text-slate-400" style={{ fontSize: '12px' }}>{currentClass.activeTask.completedStudents}/{currentClass.students} 人</div>
                      </div>
                      <div className="border border-slate-200 p-3">
                        <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>平均用时</div>
                        <div className="text-emerald-700 mt-1" style={{ fontSize: '22px', fontWeight: 900 }}>{currentClass.activeTask.averageTime}</div>
                        <div className="text-red-600" style={{ fontSize: '12px', fontWeight: 700 }}>未完成：{currentClass.activeTask.pendingStudents.join('、')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: '任务前', value: `${currentClass.activeTask.beforeAccuracy}%`, color: 'text-amber-700' },
                        { label: '任务后', value: `${currentClass.activeTask.afterAccuracy}%`, color: 'text-emerald-700' },
                        { label: '提升', value: `+${currentClass.activeTask.afterAccuracy - currentClass.activeTask.beforeAccuracy}%`, color: 'text-blue-700' },
                      ].map(item => (
                        <div key={item.label} className="border border-slate-200 p-3">
                          <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</div>
                          <div className={`${item.color} mt-1`} style={{ fontSize: '22px', fontWeight: 900 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {currentClass.activeTask.distribution.map(item => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-700" style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</span>
                              <span className="text-slate-500" style={{ fontSize: '12px' }}>{item.count} 人</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border border-slate-200 p-3">
                        <h3 className="text-slate-900 mb-2" style={{ fontSize: '13px', fontWeight: 800 }}>学生进步追踪</h3>
                        <div className="space-y-2">
                          {currentClass.activeTask.topProgress.map(student => (
                            <div key={student.name} className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-slate-800" style={{ fontSize: '13px', fontWeight: 800 }}>{student.name}</div>
                                <div className="text-slate-500" style={{ fontSize: '11px' }}>{student.before}% → {student.after}% · {student.score}</div>
                              </div>
                              <div className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded" style={{ fontSize: '12px', fontWeight: 800 }}>+{student.progress}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <CheckCircle size={17} className="text-emerald-600" />
                  <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>周报告与家长通知</h2>
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4">
                    <div className="text-slate-900 mb-2" style={{ fontSize: '14px', fontWeight: 800 }}>班级周报摘要</div>
                    <div className="space-y-2 text-slate-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>
                      <p>本周 {currentClass.name} 重点突破 {currentClass.activeTask.knowledgePoint}，班级掌握度从 {currentClass.activeTask.beforeAccuracy}% 提升到 {currentClass.activeTask.afterAccuracy}%。</p>
                      <p>李明、王红进步明显，王芳还未完成练习，建议周末补交并完成错题订正。</p>
                      <p>下周建议继续巩固 {currentClass.weakPoints[0]?.name}，并过渡到 {currentClass.weakPoints[1]?.name}。</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4">
                    <div className="text-blue-800 mb-2" style={{ fontSize: '14px', fontWeight: 800 }}>报告操作</div>
                    <p className="text-slate-700" style={{ fontSize: '13px', lineHeight: 1.7 }}>班级周报用于课堂复盘和家校沟通；学生个人通知请到“个人报告”中生成。</p>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" style={{ fontWeight: 700, fontSize: '13px' }}>
                        生成班级周报
                      </button>
                      <button
                        onClick={() => setActiveTab('studentReport')}
                        className="w-full px-3 py-2 bg-white text-slate-700 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                        style={{ fontWeight: 700, fontSize: '13px' }}
                      >
                        查看个人报告
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 个人报告 Tab */}
          {activeTab === 'studentReport' && (
            <div className="space-y-4">
              <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-slate-950" style={{ fontWeight: 800, fontSize: '22px', lineHeight: 1.2 }}>个人报告</h1>
                  <p className="text-slate-500 mt-1" style={{ fontSize: '13px' }}>从学生列表选择学生，查看个人掌握度、薄弱点和家长通知</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1 overflow-x-auto">
                    {CLASSES_DATA.map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls.id)}
                        className={`px-3 py-1.5 rounded-md whitespace-nowrap border transition-colors ${
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
                  <button className="px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2" style={{ fontWeight: 700, fontSize: '13px' }}>
                    <Download size={16} />
                    导出学生报告
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4">
                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: '15px' }}>学生列表</h2>
                    <p className="text-slate-500 mt-1" style={{ fontSize: '12px' }}>点击姓名切换个人报告</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {currentClass.studentReports.map(student => (
                      <button
                        key={student.name}
                        onClick={() => setSelectedStudentName(student.name)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          selectedStudent.name === student.name ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-slate-900" style={{ fontWeight: 900, fontSize: '14px' }}>{student.name}</div>
                            <div className="text-slate-500 mt-1" style={{ fontSize: '12px', fontWeight: 700 }}>{student.level} · {student.completedTasks}/{student.totalTasks} 任务</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${getAccuracyColor(student.accuracy)}`} style={{ fontWeight: 800 }}>
                            {student.accuracy}%
                          </div>
                        </div>
                        <div className="mt-2 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className={getProgressColor(student.accuracy)} style={{ width: `${student.accuracy}%`, height: '100%' }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white border border-slate-200">
                  <div className="px-4 py-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        <h2 className="text-slate-900" style={{ fontWeight: 900, fontSize: '18px' }}>{selectedStudent.name} 个人学习报告</h2>
                      </div>
                      <div className="text-slate-500 mt-1" style={{ fontSize: '12px', fontWeight: 700 }}>
                        {selectedStudent.level} · 报告周期：2026-05-18 至 2026-05-22
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded text-xs ${getAccuracyColor(selectedStudent.accuracy)}`} style={{ fontWeight: 800 }}>
                      {getAccuracyLabel(selectedStudent.accuracy)} {selectedStudent.accuracy}%
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200 border border-slate-200">
                      {[
                        { label: '本周提升', value: `+${selectedStudent.accuracy - selectedStudent.previousAccuracy}%`, color: 'text-emerald-700' },
                        { label: '完成任务', value: `${selectedStudent.completedTasks}/${selectedStudent.totalTasks}`, color: 'text-blue-700' },
                        { label: '练习用时', value: `${selectedStudent.practiceMinutes} 分`, color: 'text-indigo-700' },
                        { label: '完成题量', value: `${selectedStudent.questions} 道`, color: 'text-amber-700' },
                      ].map(item => (
                        <div key={item.label} className="px-4 py-3">
                          <div className="text-slate-500" style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</div>
                          <div className={`${item.color} mt-1`} style={{ fontSize: '22px', fontWeight: 900 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
                      <div className="space-y-4">
                        <div className="border border-slate-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-slate-900" style={{ fontWeight: 800, fontSize: '14px' }}>本周正确率趋势</h3>
                            <span className="text-slate-400" style={{ fontSize: '12px' }}>{selectedStudent.questions} 道题</span>
                          </div>
                          <div className="h-40 flex items-end gap-3">
                            {selectedStudent.trend.map(item => (
                              <div key={item.day} className="flex-1 text-center min-w-0">
                                <div className="h-28 bg-slate-100 border border-slate-200 flex items-end">
                                  <div className="w-full bg-blue-600" style={{ height: `${Math.max(item.accuracy, 18)}%` }} />
                                </div>
                                <div className="text-slate-700 mt-1" style={{ fontSize: '12px', fontWeight: 800 }}>{item.accuracy}%</div>
                                <div className="text-slate-400" style={{ fontSize: '11px' }}>{item.day}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border border-slate-200 p-4">
                          <h3 className="text-slate-900 mb-3" style={{ fontWeight: 800, fontSize: '14px' }}>知识点掌握</h3>
                          <div className="space-y-3">
                            {selectedStudent.mastery.map(point => (
                              <div key={point.name} className="grid grid-cols-[92px_1fr_48px] items-center gap-3">
                                <div className="text-slate-700" style={{ fontSize: '13px', fontWeight: 800 }}>{point.name}</div>
                                <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div className={`h-full ${getProgressColor(point.accuracy)}`} style={{ width: `${point.accuracy}%` }} />
                                </div>
                                <div className="text-right text-slate-600" style={{ fontSize: '13px', fontWeight: 800 }}>{point.accuracy}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-emerald-50 border border-emerald-100 p-3">
                          <div className="text-emerald-700" style={{ fontSize: '13px', fontWeight: 800 }}>优势表现</div>
                          <div className="mt-2 space-y-1 text-slate-700" style={{ fontSize: '12px', lineHeight: 1.6 }}>
                            {selectedStudent.strengths.map(item => <div key={item}>· {item}</div>)}
                          </div>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-3">
                          <div className="text-red-700" style={{ fontSize: '13px', fontWeight: 800 }}>风险提醒</div>
                          <div className="mt-2 space-y-1 text-slate-700" style={{ fontSize: '12px', lineHeight: 1.6 }}>
                            {selectedStudent.risks.map(item => <div key={item}>· {item}</div>)}
                          </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-3">
                          <div className="text-amber-700" style={{ fontSize: '13px', fontWeight: 800 }}>下一步建议</div>
                          <div className="mt-2 space-y-1 text-slate-700" style={{ fontSize: '12px', lineHeight: 1.7 }}>
                            {selectedStudent.nextSteps.map((item, idx) => <div key={item}>{idx + 1}. {item}</div>)}
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-3">
                          <div className="text-blue-800" style={{ fontSize: '13px', fontWeight: 800 }}>家长通知</div>
                          <p className="text-slate-700 mt-2" style={{ fontSize: '12px', lineHeight: 1.7 }}>{selectedStudent.parentNote}</p>
                          <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" style={{ fontWeight: 700, fontSize: '13px' }}>
                            生成个人通知
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
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
