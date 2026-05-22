import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, BookOpen, ChevronRight, ClipboardList, Crown, Gift, Lock, Play, Sparkles, Trophy, Video } from 'lucide-react';
import { CHAPTERS, SUBJECTS, getAllQuestions } from '../utils/questions';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { publicAsset } from '../utils/assets';

const ASSET = publicAsset('assets/');

const SUBJECT_ASSETS: Record<string, { banner: string; textbook: string; lesson: string }> = {
  math: {
    banner: `${ASSET}math_banner.png`,
    textbook: '苏教版',
    lesson: '整理与复习：整数除法',
  },
  english: {
    banner: `${ASSET}eng_banner.png`,
    textbook: '苏教版',
    lesson: 'Unit 1 知识综合复习',
  },
  physics: {
    banner: `${ASSET}phy_banner.png`,
    textbook: '苏教版',
    lesson: '力与运动入门',
  },
  chemistry: {
    banner: `${ASSET}chem_banner.png`,
    textbook: '苏教版',
    lesson: '物质变化入门',
  },
};

export default function LessonIntroPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [videoStarted, setVideoStarted] = useState(false);

  const isKnowledgeMode = Boolean(params.knowledgeId);
  const knowledgePoint = decodeURIComponent(params.knowledgeId || '');
  const allQuestions = useMemo(() => getAllQuestions(), []);

  const sampleQuestion = isKnowledgeMode
    ? allQuestions.find(q => q.knowledgePoint === knowledgePoint)
    : allQuestions.find(q => q.subject === params.subjectId && q.chapter === params.chapterId);

  const subjectId = isKnowledgeMode ? sampleQuestion?.subject : params.subjectId;
  const subject = SUBJECTS.find(item => item.id === subjectId);
  const chapter = subjectId && params.chapterId
    ? CHAPTERS[subjectId]?.find(item => item.id === params.chapterId)
    : subjectId && sampleQuestion
    ? CHAPTERS[subjectId]?.find(item => item.id === sampleQuestion.chapter)
    : undefined;
  const assets = SUBJECT_ASSETS[subjectId || 'math'] || SUBJECT_ASSETS.math;
  const title = isKnowledgeMode
    ? knowledgePoint || '知识点讲解'
    : chapter?.name || assets.lesson;
  const subtitle = `${subject?.name || '课程'} | ${assets.textbook}`;
  const lessonName = isKnowledgeMode ? `${title} 基础学习` : assets.lesson;
  const questionCount = isKnowledgeMode
    ? allQuestions.filter(q => q.knowledgePoint === knowledgePoint).length
    : allQuestions.filter(q => q.subject === subjectId && q.chapter === params.chapterId).length;
  const displayQuestionCount = Math.max(1, Math.min(5, questionCount || 5));
  const practiceTarget = isKnowledgeMode
    ? `/graded-practice/${encodeURIComponent(knowledgePoint)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    : `/practice/${subjectId}/${params.chapterId}`;
  const backTarget = isKnowledgeMode
    ? searchParams.get('from') === 'wrong-questions' ? '/wrong-questions' : '/weakness'
    : subjectId ? `/subject/${subjectId}` : '/dashboard';

  const explanation = sampleQuestion?.explanation || '先看一遍动画讲解，再完成练习，会更容易找到解题方法。';
  const warning = sampleQuestion?.warning || '做练习时先看清题目，再一步一步完成。';

  return (
    <div className="size-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #3F6FE9 0%, #4E94F5 46%, #7EDCF1 100%)' }}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(255,255,255,0.18),transparent_26%)]" />
      <div className="absolute right-28 top-12 hidden h-72 w-56 rotate-45 rounded-[42px] bg-white/8 md:block" />
      <div className="absolute bottom-6 right-8 h-24 w-24 rotate-45 rounded-[24px] border border-white/20" />

      <header className="relative z-10 px-4 md:px-8 pt-4 pb-3 flex-shrink-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate(backTarget)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-900/24 text-white ring-1 ring-white/20 transition-all hover:bg-blue-900/32 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft size={25} strokeWidth={3} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-white" style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 900, lineHeight: 1.05 }}>
                {lessonName}
              </div>
              <div className="mt-1 inline-flex rounded-xl bg-cyan-300/28 px-3 py-1 text-white" style={{ fontSize: '16px', fontWeight: 900 }}>
                {subtitle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {[
              { label: '学习资料', icon: BookOpen },
              { label: '课程目录', icon: ClipboardList },
              { label: '开通会员', icon: Crown },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-blue-900/20 px-4 text-white ring-1 ring-white/20 transition-all hover:bg-blue-900/30 active:scale-95"
                  style={{ fontWeight: 900 }}
                >
                  <Icon size={22} className={item.label === '开通会员' ? 'text-yellow-200' : 'text-cyan-100'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-auto px-4 md:px-8 pb-5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.62fr_0.68fr] lg:items-center">
          <section
            className="relative rounded-[34px] border-[5px] border-yellow-300 bg-yellow-100/95 p-3 md:p-4"
            style={{ boxShadow: '0 0 0 8px rgba(255, 232, 90, 0.22), 0 24px 42px rgba(30, 64, 175, 0.26)' }}
          >
            <div className="absolute -left-4 -top-4 h-20 w-20 rounded-tl-[34px] border-l-[7px] border-t-[7px] border-yellow-200" />
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-tr-[34px] border-r-[7px] border-t-[7px] border-yellow-200" />
            <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-bl-[34px] border-b-[7px] border-l-[7px] border-yellow-200" />
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-br-[34px] border-b-[7px] border-r-[7px] border-yellow-200" />

            <button
              onClick={() => setVideoStarted(true)}
              className="relative block w-full overflow-hidden rounded-[22px] bg-slate-900 text-left focus-visible:outline-2 focus-visible:outline-white"
            >
              <ImageWithFallback src={assets.banner} alt={title} className="aspect-[16/10] w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/12">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/88 text-sky-600 shadow-xl">
                  <Play size={42} fill="currentColor" className="ml-1" />
                </span>
              </div>
              {videoStarted && (
                <div className="absolute inset-0 flex flex-col justify-end bg-slate-950/68 p-5 text-white">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/18 px-3 py-1" style={{ fontWeight: 900 }}>
                    <Video size={18} />
                    讲解播放中
                  </div>
                  <div className="mt-3" style={{ fontSize: '20px', fontWeight: 900 }}>{title}</div>
                  <div className="mt-2 text-white/82" style={{ fontSize: '14px', lineHeight: 1.6 }}>{explanation}</div>
                  <div className="mt-4 h-2 rounded-full bg-white/20">
                    <div className="h-full w-2/3 rounded-full bg-yellow-300" />
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => setVideoStarted(true)}
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full text-white transition-all hover:-translate-y-0.5 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-yellow-100"
              style={{
                background: 'linear-gradient(180deg, #FFE66D 0%, #FDBA21 54%, #F97316 100%)',
                boxShadow: '0 7px 0 rgba(194, 91, 0, 0.28), inset 0 2px 0 rgba(255,255,255,0.52)',
                textShadow: '0 1px 0 rgba(154, 52, 18, 0.22)',
                fontSize: '24px',
                fontWeight: 900,
              }}
            >
              <Play size={26} fill="currentColor" />
              {videoStarted ? '继续看动画' : '看动画'}
            </button>
          </section>

          <section
            className="overflow-hidden rounded-[26px] border-2 border-cyan-100/80 bg-white/82"
            style={{ boxShadow: '0 10px 0 rgba(30, 64, 175, 0.16), 0 20px 34px rgba(30, 64, 175, 0.20)' }}
          >
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-blue-100 to-white p-8">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-[36px] bg-blue-200/70">
                <BookOpen size={86} className="text-blue-500" />
                <div className="absolute bottom-8 right-8 rounded-2xl bg-white/90 p-2 text-blue-500">
                  <Lock size={32} />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 text-center">
              <div className="text-blue-700" style={{ fontSize: '22px', fontWeight: 900 }}>{displayQuestionCount}道题</div>
            </div>
            <button
              onClick={() => navigate(practiceTarget)}
              className="flex h-16 w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white transition-all hover:brightness-105 active:translate-y-0.5"
              style={{ fontSize: '24px', fontWeight: 900 }}
            >
              做练习
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          </section>

          <section className="hidden lg:flex min-h-[320px] items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-cyan-200/28 blur-xl" />
              <div
                className="relative flex h-56 w-72 flex-col items-center justify-center rounded-[42px] border-4 border-blue-100 bg-gradient-to-br from-blue-100 to-blue-500 text-white"
                style={{ boxShadow: '0 18px 34px rgba(30, 64, 175, 0.28), inset 0 3px 0 rgba(255,255,255,0.42)' }}
              >
                <Gift size={86} className="text-white/92" />
                <div className="mt-4 flex items-center gap-1 rounded-full bg-white/18 px-4 py-1" style={{ fontWeight: 900 }}>
                  <Sparkles size={18} className="text-yellow-200" />
                  完成练习开启奖励
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto mt-5 max-w-7xl rounded-[24px] bg-blue-900/18 px-4 py-3 text-white ring-1 ring-white/16">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div style={{ fontSize: '16px', fontWeight: 900 }}>学习提示</div>
              <div className="mt-1 text-white/82" style={{ lineHeight: 1.55 }}>{warning}</div>
            </div>
            <button
              onClick={() => navigate(practiceTarget)}
              className="h-11 flex-shrink-0 rounded-full bg-white/22 px-5 text-white transition-all hover:bg-white/28 active:scale-95"
              style={{ fontWeight: 900 }}
            >
              直接做题
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
