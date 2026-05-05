import { useState } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../utils/storage';
import { ArrowLeft, Check } from 'lucide-react';

const ALL_GRADES = [
  { value: 1, label: '小学一年级' },
  { value: 2, label: '小学二年级' },
  { value: 3, label: '小学三年级' },
  { value: 4, label: '小学四年级' },
  { value: 5, label: '小学五年级' },
  { value: 6, label: '小学六年级' },
  { value: 7, label: '初中一年级' },
  { value: 8, label: '初中二年级' },
  { value: 9, label: '初中三年级' },
];

export default function SwitchGradePage() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const currentGrade = user?.grade || 1;
  const [selected, setSelected] = useState(currentGrade);

  const handleSelect = (g: number) => {
    if (g === currentGrade) return;
    if (!user) return;
    setSelected(g);
    storage.updateGrade(user.username, g);
    setTimeout(() => navigate(-1), 400);
  };

  return (
    <div className="size-full flex flex-col" style={{ background: '#EEF4FF' }}>
      <header className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 700, fontSize: '17px' }} className="text-gray-800">切换年级</span>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="w-full">
          {ALL_GRADES.map((g, idx) => {
            const isCurrent = g.value === currentGrade;
            const isSelected = g.value === selected;
            const isDivider = g.value === 7; // 初中分界线
            return (
              <div key={g.value}>
                {isDivider && (
                  <div className="mx-4 md:mx-8 my-1">
                    <div className="border-t-2 border-gray-300" />
                  </div>
                )}
                <button
                  onClick={() => handleSelect(g.value)}
                  className={`w-full px-4 md:px-8 py-3.5 flex items-center text-left bg-white hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/60' : ''}`}
                >
                  <span className={`text-sm ${isCurrent ? 'text-blue-500' : 'text-gray-800'}`} style={{ fontWeight: isCurrent ? 700 : 500 }}>
                    {g.label}{isCurrent ? '（当前）' : ''}
                  </span>
                  {isSelected && <Check size={18} className="text-blue-500 ml-auto flex-shrink-0" />}
                </button>
                {idx < ALL_GRADES.length - 1 && g.value !== 6 && (
                  <div className="mx-4 md:mx-8 border-b border-gray-200" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
