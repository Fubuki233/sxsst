import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { ArrowLeft, Trash2, LogOut, AlertTriangle } from 'lucide-react';

export default function DataManagementPage() {
  const navigate = useNavigate();

  const handleClearData = () => {
    if (window.confirm('确定要清空所有学习记录吗？此操作不可恢复！')) {
      storage.clearAllData();
      window.location.reload();
    }
  };

  const handleLogout = () => { storage.logout(); navigate('/'); };

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
