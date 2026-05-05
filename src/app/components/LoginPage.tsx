import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { Bot, User, Lock, GraduationCap, ChevronDown } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState(1);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    if (isRegister) {
      const success = storage.register(username, password, grade, role);
      if (success) {
        const user = storage.login(username, password);
        navigate(user?.role === 'teacher' ? '/teacher' : '/dashboard');
      } else {
        setError('用户名已存在');
      }
    } else {
      const user = storage.login(username, password);
      if (user) {
        navigate(user.role === 'teacher' ? '/teacher' : '/dashboard');
      } else {
        setError('用户名或密码错误');
      }
    }
  };

  return (
    <div className="size-full flex items-center justify-center p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 50%, #EEF4FF 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-gray-800 mb-1" style={{ fontWeight: 800, fontSize: '22px' }}>小学生AI智能刷题平台</h1>
          <p className="text-gray-500" style={{ fontSize: '14px' }}>让学习变得更有趣</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${!isRegister ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              style={{ fontWeight: !isRegister ? 700 : 400, fontSize: '15px' }}
            >
              登录
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${isRegister ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              style={{ fontWeight: isRegister ? 700 : 400, fontSize: '15px' }}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block mb-1.5 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>用户名</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  style={{ fontSize: '15px' }}
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  style={{ fontSize: '15px' }}
                  placeholder="请输入密码"
                />
              </div>
            </div>

            {isRegister && (
              <>
                {/* Grade */}
                <div>
                  <label className="block mb-1.5 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>选择年级</label>
                  <div className="relative">
                    <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white appearance-none"
                      style={{ fontSize: '15px' }}
                    >
                      <optgroup label="小学">
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>小学{g}年级</option>
                        ))}
                      </optgroup>
                      <optgroup label="初中">
                        {[7, 8, 9].map(g => (
                          <option key={g} value={g}>初中{g - 6}年级</option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block mb-1.5 text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>身份</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                        role === 'student' ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'border-gray-200 text-gray-600'
                      }`}
                      style={{ fontSize: '15px', fontWeight: role === 'student' ? 700 : 400 }}
                    >
                      学生
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`flex-1 py-3 rounded-xl border-2 transition-colors ${
                        role === 'teacher' ? 'bg-blue-500 text-white border-blue-500 shadow-sm' : 'border-gray-200 text-gray-600'
                      }`}
                      style={{ fontSize: '15px', fontWeight: role === 'teacher' ? 700 : 400 }}
                    >
                      老师
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200" style={{ fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3.5 rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-md mt-2"
              style={{ fontSize: '16px', fontWeight: 700 }}
            >
              {isRegister ? '立即注册' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}