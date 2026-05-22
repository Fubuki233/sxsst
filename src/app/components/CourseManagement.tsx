import { useState } from 'react';
import { useNavigate } from 'react-router';
import { SUBJECTS, getAllChapters } from '../utils/questions';
import { ArrowLeft, Plus, Trash2, Play, ChevronRight, UploadCloud } from 'lucide-react';

// ── Demo data store (frontend only) ──
function getCourseData() {
  return JSON.parse(localStorage.getItem('demo_courses') || '{}');
}
function saveCourseData(data: any) {
  localStorage.setItem('demo_courses', JSON.stringify(data));
}

const GRADES = [
  { id: 1, label: '一年级' }, { id: 2, label: '二年级' }, { id: 3, label: '三年级' },
  { id: 4, label: '四年级' }, { id: 5, label: '五年级' }, { id: 6, label: '六年级' },
  { id: 7, label: '初一' }, { id: 8, label: '初二' }, { id: 9, label: '初三' },
];

export default function CourseManagement() {
  const navigate = useNavigate();
  const allChapters = getAllChapters();
  const [tab, setTab] = useState<'pricing' | 'videos'>('pricing');
  const [courseData, setCourseData] = useState(getCourseData());

  // ── Video: selected subject ──
  const [videoSubject, setVideoSubject] = useState('math');

  // ── Pricing ──
  const updatePrice = (gradeId: number, subjectId: string, price: string) => {
    const data = { ...courseData };
    if (!data.pricing) data.pricing = {};
    if (!data.pricing[gradeId]) data.pricing[gradeId] = {};
    data.pricing[gradeId][subjectId] = price;
    saveCourseData(data);
    setCourseData(data);
  };

  const getPrice = (gradeId: number, subjectId: string) => {
    return courseData?.pricing?.[gradeId]?.[subjectId] || '';
  };

  // ── Videos: stored per (subject, chapterId) ──
  // data.videos = { "math:add-sub": [ {id, title, url}, ... ], ... }
  const getVideoKey = (subj: string, chId: string) => `${subj}:${chId}`;

  const getVideosForChapter = (subj: string, chId: string): { id: string; title: string; url: string }[] => {
    const v = courseData?.videos || {};
    return v[getVideoKey(subj, chId)] || [];
  };

  const addVideo = (subjectId: string, chapterId: string) => {
    const data = { ...courseData };
    if (!data.videos) data.videos = {};
    const key = getVideoKey(subjectId, chapterId);
    if (!data.videos[key]) data.videos[key] = [];
    data.videos[key] = [...data.videos[key], { id: `v_${Date.now()}`, title: '', url: '' }];
    saveCourseData(data);
    setCourseData(data);
  };

  const updateVideo = (id: string, subjectId: string, chapterId: string, field: string, value: string) => {
    const data = { ...courseData };
    if (!data.videos) return;
    const key = getVideoKey(subjectId, chapterId);
    const idx = data.videos[key]?.findIndex((v: any) => v.id === id);
    if (idx >= 0) {
      data.videos[key][idx][field] = value;
      saveCourseData(data);
      setCourseData(data);
    }
  };

  const deleteVideo = (id: string, subjectId: string, chapterId: string) => {
    if (!confirm('确认删除该视频？')) return;
    const data = { ...courseData };
    if (!data.videos) return;
    const key = getVideoKey(subjectId, chapterId);
    data.videos[key] = data.videos[key].filter((v: any) => v.id !== id);
    if (data.videos[key].length === 0) delete data.videos[key];
    saveCourseData(data);
    setCourseData(data);
  };

  const chapters = allChapters[videoSubject] || [];

  return (
    <div className="size-full flex flex-col" style={{ background: '#F8FAFC' }}>
      <header className="bg-white px-4 md:px-6 py-2.5 flex items-center gap-3 flex-shrink-0 border-b border-slate-200">
        <button onClick={() => navigate('/teacher')} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span style={{ fontWeight: 800, fontSize: '17px' }} className="text-slate-900">网课管理</span>
      </header>

      <div className="flex-1 overflow-auto p-3 md:p-5">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Tabs */}
          <div className="bg-white border border-slate-200 p-1 flex gap-1">
            <button onClick={() => setTab('pricing')}
              className={`flex-1 py-2 rounded-md transition-colors ${tab === 'pricing' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontWeight: 800, fontSize: '14px' }}>
              课程定价与权限
            </button>
            <button onClick={() => setTab('videos')}
              className={`flex-1 py-2 rounded-md transition-colors ${tab === 'videos' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              style={{ fontWeight: 800, fontSize: '14px' }}>
              课程视频管理
            </button>
          </div>

          {tab === 'pricing' && (
            <div className="space-y-4">
              {/* Pricing table */}
              <div className="bg-white border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>年级</th>
                        {SUBJECTS.map(s => (
                          <th key={s.id} className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>{s.name}</th>
                        ))}
                        <th className="text-center px-4 py-3 text-gray-600" style={{ fontWeight: 600 }}>可访问</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GRADES.map(g => {
                        const accessKey = `access_${g.id}`;
                        const hasAccess = courseData?.[accessKey] !== false;
                        return (
                          <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3" style={{ fontWeight: 600 }}>{g.label}</td>
                            {SUBJECTS.map(s => (
                              <td key={s.id} className="px-2 py-3 text-center">
                                <div className="flex items-center justify-center gap-0.5">
                                  <span className="text-gray-400 text-xs">¥</span>
                                  <input
                                    value={getPrice(g.id, s.id)}
                                    onChange={e => updatePrice(g.id, s.id, e.target.value)}
                                    placeholder="0"
                                    className="w-16 text-center px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:border-blue-400 focus:outline-none"
                                  />
                                </div>
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  const data = { ...courseData };
                                  data[accessKey] = !hasAccess;
                                  saveCourseData(data);
                                  setCourseData(data);
                                }}
                                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                  hasAccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {hasAccess ? '已开放' : '已关闭'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-3 text-xs text-gray-400">
                提示：此页为前端演示。设置价格后学生端可见对应课程，关闭访问则不可见。
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <div className="space-y-4">
              {/* Subject selector */}
              <div className="bg-white border border-slate-200 p-3 flex gap-2 flex-wrap">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setVideoSubject(s.id)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
                      videoSubject === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-slate-200 hover:bg-gray-50'
                    }`}>
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Chapters with videos */}
              <div className="space-y-3">
                {chapters.map(ch => {
                  const vids = getVideosForChapter(videoSubject, ch.id);
                  return (
                    <div key={ch.id} className="bg-white border border-slate-200 overflow-hidden">
                      {/* Chapter header */}
                      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={16} className="text-gray-400" />
                          <span className="text-gray-800" style={{ fontWeight: 700, fontSize: '15px' }}>{ch.name}</span>
                          <span className="text-gray-400 text-xs">({vids.length} 个视频)</span>
                        </div>
                        <button
                          onClick={() => addVideo(videoSubject, ch.id)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs">
                          <Plus size={14} /> 添加视频
                        </button>
                      </div>

                      {/* Videos list */}
                      <div className="p-3 space-y-2">
                        {vids.map((v: any) => (
                          <div key={v.id} className="flex items-start gap-3 p-3 border border-slate-200 hover:bg-slate-50 transition-colors">
                            <div className="w-9 h-9 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                              <Play size={18} className="text-blue-500" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <input
                                value={v.title}
                                onChange={e => updateVideo(v.id, videoSubject, ch.id, 'title', e.target.value)}
                                placeholder="视频标题"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:border-blue-400 focus:outline-none"
                              />
                              {/* 视频上传（仅前端展示） */}
                              <label
                                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 border border-dashed border-slate-300 rounded-md text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30"
                              >
                                <UploadCloud size={16} />
                                <span>{v.url ? v.url : '点击上传视频文件'}</span>
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) updateVideo(v.id, videoSubject, ch.id, 'url', file.name);
                                  }}
                                />
                              </label>
                            </div>
                            <button onClick={() => deleteVideo(v.id, videoSubject, ch.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        {vids.length === 0 && (
                          <div className="text-center py-4 text-gray-400 text-sm">暂未上传视频</div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {chapters.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">该科目暂无章节，请先在科目章节设置中添加</div>
                )}
              </div>

              <div className="bg-white border border-slate-200 p-3 text-xs text-gray-400">
                提示：此页为前端演示。视频按章节组织，数据保存在本地。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
