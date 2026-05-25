import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { ArrowLeft, Trash2, LogOut, AlertTriangle } from 'lucide-react';
import { BottomNav } from './BottomNav';

export default function DataManagementPage() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const isSeniorStudent = user?.grade !== undefined && user.grade >= 4;

  const handleClearData = () => {
    if (window.confirm('确定要清空所有学习记录吗？此操作不可恢复！')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  const handleLogout = () => { storage.logout(); navigate('/'); };

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
            <h1 className="text-white" style={{ fontFamily: 'Georgia, "STKaiti", "KaiTi", serif', fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>数据管理</h1>

            <div className="mt-7 space-y-3">
              <div className="flex items-start gap-3 rounded-[8px] bg-white/10 p-4">
                <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-[#FFAF18]" />
                <div>
                  <div className="text-white" style={{ fontSize: '15px', fontWeight: 900 }}>注意</div>
                  <div className="mt-1 text-white/52" style={{ fontSize: '12px', fontWeight: 700 }}>清空记录后不可恢复，退出后需重新登录</div>
                </div>
              </div>
              <button onClick={handleClearData} className="flex h-14 w-full items-center gap-3 rounded-[8px] bg-white/10 px-4 text-left text-white hover:bg-white/14">
                <Trash2 size={20} className="text-[#FFAF18]" />
                <span style={{ fontSize: '15px', fontWeight: 900 }}>清空学习记录</span>
                <span className="ml-auto text-white/42" style={{ fontSize: '12px', fontWeight: 700 }}>不可恢复</span>
              </button>
              <button onClick={handleLogout} className="flex h-14 w-full items-center gap-3 rounded-[8px] bg-[#ED8F88]/18 px-4 text-left text-white hover:bg-[#ED8F88]/24">
                <LogOut size={20} className="text-[#ED8F88]" />
                <span style={{ fontSize: '15px', fontWeight: 900 }}>退出登录</span>
                <span className="ml-auto text-white/42" style={{ fontSize: '12px', fontWeight: 700 }}>返回登录页</span>
              </button>
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
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">数据管理</span>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="w-full">
          {/* Warning notice row */}
          <div className="px-4 md:px-8 py-3.5 flex items-start gap-2.5 bg-white">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>注意</p>
              <p className="text-gray-400 text-xs mt-0.5">清空记录后不可恢复，退出后需重新登录</p>
            </div>
          </div>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* Clear data row */}
          <button onClick={handleClearData}
            className="w-full px-4 md:px-8 py-3.5 flex items-center gap-2.5 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <Trash2 size={18} className="text-amber-500 flex-shrink-0" />
            <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>清空学习记录</span>
            <span className="text-gray-400 text-xs text-right ml-auto">不可恢复</span>
          </button>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />

          {/* Logout row */}
          <button onClick={handleLogout}
            className="w-full px-4 md:px-8 py-3.5 flex items-center gap-2.5 text-left bg-white hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} className="text-red-500 flex-shrink-0" />
            <span className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>退出登录</span>
            <span className="text-gray-400 text-xs text-right ml-auto">返回登录页</span>
          </button>
          <div className="mx-4 md:mx-8 border-b border-gray-200" />
        </div>
      </div>
    </div>
  );
}
