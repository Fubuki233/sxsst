import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { BottomNav } from './BottomNav';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const [message, setMessage] = useState('');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleChangePw = () => {
    if (!oldPw || !newPw || !confirmPw) { setMessage('请填写完整'); return; }
    if (newPw !== confirmPw) { setMessage('两次新密码不一致'); return; }
    if (!user) return;
    const ok = storage.changePassword(user.username, oldPw, newPw);
    setMessage(ok ? '密码修改成功' : '原密码错误');
    if (ok) { setOldPw(''); setNewPw(''); setConfirmPw(''); }
    setTimeout(() => setMessage(''), 2000);
  };

  const toggleShowPw = () => setShowPw(prev => !prev);
  const inputType = showPw ? 'text' : 'password';
  const isSeniorStudent = user?.grade !== undefined && user.grade >= 4;

  if (isSeniorStudent) {
    return (
      <div className="size-full flex flex-col relative overflow-hidden [background:var(--senior-page-bg)] text-white">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_6%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(168,137,243,0.13),transparent_28%)]" />
        <div className="relative z-10 flex-1 overflow-auto px-4 pt-7 pb-7">
          <div className="mx-auto w-full max-w-[480px]">
            <button onClick={() => navigate(-1)} className="mb-5 flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-white/82">
              <ArrowLeft size={16} />
              <span style={{ fontSize: '13px', fontWeight: 800 }}>返回</span>
            </button>
            <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>账号安全</h1>

            <div className="mt-7 space-y-3">
              {[
                { value: oldPw, setter: setOldPw, placeholder: '原密码', withToggle: true },
                { value: newPw, setter: setNewPw, placeholder: '新密码' },
                { value: confirmPw, setter: setConfirmPw, placeholder: '确认新密码' },
              ].map(item => (
                <label key={item.placeholder} className="flex h-14 items-center gap-3 rounded-[8px] bg-white/10 px-4">
                  <Lock size={18} className="text-white/62" />
                  <input
                    value={item.value}
                    onChange={e => item.setter(e.target.value)}
                    type={inputType}
                    placeholder={item.placeholder}
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/42"
                    style={{ fontSize: '15px', fontWeight: 700 }}
                  />
                  {item.withToggle && (
                    <button type="button" onClick={toggleShowPw} className="text-white/58">
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </label>
              ))}

              <button onClick={handleChangePw} className="h-12 w-full rounded-full bg-[#A889F3] text-white" style={{ fontSize: '16px', fontWeight: 900 }}>
                确认修改
              </button>
              {message && (
                <div className={`rounded-[8px] px-4 py-3 text-center ${message.includes('成功') ? 'bg-[#87EBCF]/18 text-[#87EBCF]' : 'bg-[#ED8F88]/18 text-[#ED8F88]'}`} style={{ fontSize: '13px', fontWeight: 800 }}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">修改密码</span>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="w-full">
          {/* Old password row */}
          <div className="px-4 md:px-8 py-3.5 flex items-center gap-2.5 bg-white">
            <Lock size={18} className="text-blue-500 flex-shrink-0" />
            <input value={oldPw} onChange={e => setOldPw(e.target.value)} type={inputType}
              placeholder="原密码"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
            <button onClick={toggleShowPw} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* New password row */}
          <div className="px-4 md:px-8 py-3.5 flex items-center gap-2.5 bg-white">
            <Lock size={18} className="text-blue-500 flex-shrink-0" />
            <input value={newPw} onChange={e => setNewPw(e.target.value)} type={inputType}
              placeholder="新密码"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
          </div>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* Confirm password row */}
          <div className="px-4 md:px-8 py-3.5 flex items-center gap-2.5 bg-white">
            <Lock size={18} className="text-blue-500 flex-shrink-0" />
            <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} type={inputType}
              placeholder="确认新密码"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none" />
          </div>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* Submit button row */}
          <button onClick={handleChangePw}
            className="w-full px-4 md:px-8 py-3.5 text-center bg-white hover:bg-gray-50 transition-colors"
          >
            <span className="text-blue-500 text-sm" style={{ fontWeight: 600 }}>确认修改</span>
          </button>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* Message */}
          {message && (
            <div className={`mx-4 md:mx-8 mt-4 py-3 text-center rounded-xl text-sm ${message.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
