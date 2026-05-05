import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import {
  Bot, BookOpen, FileUp, BarChart3,
  Settings, LogOut, User, GraduationCap
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

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();

  const handleLogout = () => {
    storage.logout();
    navigate('/');
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
            <Bot size={20} className="text-white" />
          </div>
          <span className="text-blue-600" style={{ fontSize: '15px', fontWeight: 700 }}>
            教师管理后台
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl">
            <User size={16} className="text-gray-500" />
            <span className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} />
            <span className="text-sm hidden md:inline">退出</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-gray-800" style={{ fontWeight: 800, fontSize: '22px' }}>
              欢迎回来，{user?.username}老师
            </h1>
            <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>
              管理教学内容和查看学生学习数据
            </p>
          </div>

          {/* Admin Cards */}
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

          {/* Quick stats summary */}
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 md:p-6">
            <h2 className="text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '16px' }}>快速概览</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`bg-blue-50 rounded-xl p-4 text-center`}>
                <div className="text-blue-600" style={{ fontWeight: 800, fontSize: '24px' }}>
                  {storage.getStudents().length}
                </div>
                <div className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>学生总数</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-green-600" style={{ fontWeight: 800, fontSize: '24px' }}>
                  {storage.getCustomQuestions().length}
                </div>
                <div className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>已上传题目</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-purple-600" style={{ fontWeight: 800, fontSize: '24px' }}>
                  {Object.keys(storage.getCustomChapters()).length}
                </div>
                <div className="text-gray-500 mt-1" style={{ fontSize: '13px' }}>自定义科目</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
