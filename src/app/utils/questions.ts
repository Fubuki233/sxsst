import { Question } from './storage';
import { Calculator, BookOpen, Atom, Beaker } from 'lucide-react';
import { storage } from './storage';

export const SUBJECTS = [
  { id: 'math', name: '数学', icon: Calculator, color: 'bg-blue-500', minGrade: 1 },
  { id: 'english', name: '英语', icon: BookOpen, color: 'bg-green-500', minGrade: 1 },
  { id: 'physics', name: '物理', icon: Atom, color: 'bg-purple-500', minGrade: 7 },
  { id: 'chemistry', name: '化学', icon: Beaker, color: 'bg-orange-500', minGrade: 7 }
];

export function getSubjectsByGrade(grade: number) {
  return SUBJECTS.filter(subject => grade >= subject.minGrade);
}

export const CHAPTERS: Record<string, { id: string; name: string; knowledgePoints: string[] }[]> = {
  math: [
    { id: 'add-sub', name: '加减法', knowledgePoints: ['两位数加法', '两位数减法', '进位加法', '退位减法'] },
    { id: 'multiply', name: '乘法', knowledgePoints: ['乘法口诀', '两位数乘法', '三位数乘法'] },
    { id: 'divide', name: '除法', knowledgePoints: ['除法基础', '有余数除法', '两位数除法'] },
    { id: 'geometry', name: '图形', knowledgePoints: ['认识图形', '周长', '面积', '体积'] }
  ],
  english: [
    { id: 'words', name: '单词', knowledgePoints: ['动物单词', '颜色单词', '数字单词', '家庭成员'] },
    { id: 'grammar', name: '语法', knowledgePoints: ['be动词', '时态', '单复数'] },
    { id: 'reading', name: '阅读', knowledgePoints: ['短文理解', '句子排序'] }
  ],
  physics: [
    { id: 'mechanics', name: '力学', knowledgePoints: ['重力', '摩擦力', '弹力'] },
    { id: 'light', name: '光学', knowledgePoints: ['光的传播', '反射', '折射'] }
  ],
  chemistry: [
    { id: 'matter', name: '物质', knowledgePoints: ['固液气', '物质变化', '分子原子'] },
    { id: 'reaction', name: '化学反应', knowledgePoints: ['氧化反应', '化合反应'] }
  ]
};

export const QUESTIONS: Question[] = [
  // ═══════════ 数学 - 加减法 ═══════════
  {
    id: 'math-1', subject: 'math', chapter: 'add-sub', knowledgePoint: '两位数加法', difficulty: 'easy',
    question: '23 + 45 = ?', options: ['58', '68', '78', '88'], answer: '68',
    explanation: '个位：3 + 5 = 8，十位：2 + 4 = 6，答案是 68', warning: '先算个位，再算十位'
  },
  {
    id: 'math-2', subject: 'math', chapter: 'add-sub', knowledgePoint: '两位数加法', difficulty: 'medium',
    question: '37 + 28 = ?', options: ['55', '65', '75', '85'], answer: '65',
    explanation: '个位：7+8=15，写5进1；十位：3+2+1=6，答案是65', warning: '个位相加超10要向十位进1'
  },
  {
    id: 'math-3', subject: 'math', chapter: 'add-sub', knowledgePoint: '进位加法', difficulty: 'easy',
    question: '18 + 7 = ?', options: ['24', '25', '26', '27'], answer: '25',
    explanation: '8+7=15，个位写5，向十位进1，1+1=2，答案是25', warning: '进位时别忘了加上进的1'
  },
  {
    id: 'math-4', subject: 'math', chapter: 'add-sub', knowledgePoint: '进位加法', difficulty: 'medium',
    question: '59 + 68 = ?', options: ['117', '127', '137', '147'], answer: '127',
    explanation: '个位：9+8=17，写7进1；十位：5+6+1=12，答案是127', warning: '两次进位时要特别小心'
  },
  {
    id: 'math-5', subject: 'math', chapter: 'add-sub', knowledgePoint: '两位数减法', difficulty: 'easy',
    question: '56 - 23 = ?', options: ['33', '43', '53', '63'], answer: '33',
    explanation: '个位：6-3=3，十位：5-2=3，答案是33', warning: '减法从个位开始算起'
  },
  {
    id: 'math-6', subject: 'math', chapter: 'add-sub', knowledgePoint: '两位数减法', difficulty: 'medium',
    question: '78 - 35 = ?', options: ['33', '43', '53', '63'], answer: '43',
    explanation: '个位：8-5=3，十位：7-3=4，答案是43', warning: '不够减时要向十位借1'
  },
  {
    id: 'math-7', subject: 'math', chapter: 'add-sub', knowledgePoint: '退位减法', difficulty: 'easy',
    question: '43 - 8 = ?', options: ['25', '35', '45', '55'], answer: '35',
    explanation: '个位3不够减8，从十位借1变成13-8=5；十位剩3，答案是35', warning: '个位不够减从十位借1当10'
  },
  {
    id: 'math-8', subject: 'math', chapter: 'add-sub', knowledgePoint: '退位减法', difficulty: 'medium',
    question: '82 - 37 = ?', options: ['35', '45', '55', '65'], answer: '45',
    explanation: '个位不够减，从十位借1，12-7=5；十位7-3=4，答案是45', warning: '借位后十位要减1'
  },

  // ═══════════ 数学 - 乘法 ═══════════
  {
    id: 'math-9', subject: 'math', chapter: 'multiply', knowledgePoint: '乘法口诀', difficulty: 'easy',
    question: '3 × 4 = ?', options: ['7', '10', '12', '14'], answer: '12',
    explanation: '三四十二，答案是12', warning: '熟记乘法口诀表'
  },
  {
    id: 'math-10', subject: 'math', chapter: 'multiply', knowledgePoint: '乘法口诀', difficulty: 'medium',
    question: '7 × 8 = ?', options: ['54', '56', '58', '60'], answer: '56',
    explanation: '七八五十六，答案是56', warning: '7和8的口诀容易记混'
  },
  {
    id: 'math-11', subject: 'math', chapter: 'multiply', knowledgePoint: '两位数乘法', difficulty: 'easy',
    question: '12 × 3 = ?', options: ['26', '36', '46', '56'], answer: '36',
    explanation: '个位：2×3=6，十位：1×3=3，答案是36', warning: '先用个位乘，再用十位乘'
  },
  {
    id: 'math-12', subject: 'math', chapter: 'multiply', knowledgePoint: '两位数乘法', difficulty: 'medium',
    question: '23 × 4 = ?', options: ['82', '88', '92', '96'], answer: '92',
    explanation: '个位：3×4=12写2进1；十位：2×4+1=9，答案是92', warning: '别忘了加上进位的数'
  },
  {
    id: 'math-13', subject: 'math', chapter: 'multiply', knowledgePoint: '三位数乘法', difficulty: 'easy',
    question: '100 × 5 = ?', options: ['50', '500', '550', '1000'], answer: '500',
    explanation: '整百数乘法：1×5=5，后面加两个0，答案是500', warning: '整百数后面要补两个0'
  },
  {
    id: 'math-14', subject: 'math', chapter: 'multiply', knowledgePoint: '三位数乘法', difficulty: 'medium',
    question: '123 × 2 = ?', options: ['146', '246', '256', '346'], answer: '246',
    explanation: '个位：3×2=6，十位：2×2=4，百位：1×2=2，答案是246', warning: '从个位开始逐位乘'
  },

  // ═══════════ 数学 - 除法 ═══════════
  {
    id: 'math-15', subject: 'math', chapter: 'divide', knowledgePoint: '除法基础', difficulty: 'easy',
    question: '12 ÷ 3 = ?', options: ['2', '3', '4', '5'], answer: '4',
    explanation: '三四十二，所以12÷3=4', warning: '除法是乘法的逆运算'
  },
  {
    id: 'math-16', subject: 'math', chapter: 'divide', knowledgePoint: '除法基础', difficulty: 'medium',
    question: '36 ÷ 6 = ?', options: ['4', '5', '6', '7'], answer: '6',
    explanation: '六六三十六，所以36÷6=6', warning: '想乘法口诀来算除法'
  },
  {
    id: 'math-17', subject: 'math', chapter: 'divide', knowledgePoint: '有余数除法', difficulty: 'easy',
    question: '13 ÷ 4 = ?', options: ['2余1', '3余1', '3余2', '4余1'], answer: '3余1',
    explanation: '13÷4=3...1，因为3×4=12，13-12=1', warning: '余数一定比除数小'
  },
  {
    id: 'math-18', subject: 'math', chapter: 'divide', knowledgePoint: '有余数除法', difficulty: 'medium',
    question: '25 ÷ 7 = ?', options: ['2余11', '3余4', '4余3', '3余3'], answer: '3余4',
    explanation: '3×7=21，25-21=4，答案是3余4', warning: '余数4比除数7小，正确'
  },
  {
    id: 'math-19', subject: 'math', chapter: 'divide', knowledgePoint: '两位数除法', difficulty: 'easy',
    question: '48 ÷ 2 = ?', options: ['22', '24', '26', '28'], answer: '24',
    explanation: '十位：4÷2=2，个位：8÷2=4，答案是24', warning: '从高位开始除'
  },
  {
    id: 'math-20', subject: 'math', chapter: 'divide', knowledgePoint: '两位数除法', difficulty: 'medium',
    question: '96 ÷ 4 = ?', options: ['22', '24', '26', '28'], answer: '24',
    explanation: '9÷4=2余1，16÷4=4，答案是24', warning: '十位有余数时要和个位合并'
  },

  // ═══════════ 数学 - 图形 ═══════════
  {
    id: 'math-21', subject: 'math', chapter: 'geometry', knowledgePoint: '认识图形', difficulty: 'easy',
    question: '四条边都相等，四个角都是直角的图形是？', options: ['长方形', '正方形', '三角形', '圆形'], answer: '正方形',
    explanation: '正方形四条边相等且四个角都是直角', warning: '长方形对边相等，正方形四边都相等'
  },
  {
    id: 'math-22', subject: 'math', chapter: 'geometry', knowledgePoint: '认识图形', difficulty: 'medium',
    question: '有三条边和三个角的图形是？', options: ['正方形', '长方形', '三角形', '圆形'], answer: '三角形',
    explanation: '三角形由三条边和三个角组成，是最简单的多边形', warning: '注意区分不同图形的边和角数量'
  },
  {
    id: 'math-23', subject: 'math', chapter: 'geometry', knowledgePoint: '周长', difficulty: 'easy',
    question: '正方形边长5cm，周长是多少？', options: ['10cm', '15cm', '20cm', '25cm'], answer: '20cm',
    explanation: '正方形周长 = 边长×4 = 5×4 = 20cm', warning: '周长是所有边长的总和'
  },
  {
    id: 'math-24', subject: 'math', chapter: 'geometry', knowledgePoint: '周长', difficulty: 'medium',
    question: '长方形长8cm宽3cm，周长是多少？', options: ['11cm', '22cm', '24cm', '26cm'], answer: '22cm',
    explanation: '周长 = (长+宽)×2 = (8+3)×2 = 22cm', warning: '长方形有两组长和宽'
  },
  {
    id: 'math-25', subject: 'math', chapter: 'geometry', knowledgePoint: '面积', difficulty: 'easy',
    question: '正方形边长4cm，面积是多少？', options: ['8cm²', '12cm²', '16cm²', '20cm²'], answer: '16cm²',
    explanation: '正方形面积 = 边长×边长 = 4×4 = 16cm²', warning: '面积单位是平方厘米cm²'
  },
  {
    id: 'math-26', subject: 'math', chapter: 'geometry', knowledgePoint: '面积', difficulty: 'medium',
    question: '长方形长6cm宽4cm，面积是多少？', options: ['10cm²', '20cm²', '24cm²', '28cm²'], answer: '24cm²',
    explanation: '面积 = 长×宽 = 6×4 = 24cm²', warning: '面积和周长是两个不同概念'
  },
  {
    id: 'math-27', subject: 'math', chapter: 'geometry', knowledgePoint: '体积', difficulty: 'easy',
    question: '正方体棱长3cm，体积是多少？', options: ['9cm³', '18cm³', '27cm³', '36cm³'], answer: '27cm³',
    explanation: '正方体体积 = 棱长×棱长×棱长 = 3×3×3 = 27cm³', warning: '体积单位是立方厘米cm³'
  },
  {
    id: 'math-28', subject: 'math', chapter: 'geometry', knowledgePoint: '体积', difficulty: 'medium',
    question: '长方体长5cm宽3cm高2cm，体积是多少？', options: ['10cm³', '20cm³', '30cm³', '40cm³'], answer: '30cm³',
    explanation: '体积 = 长×宽×高 = 5×3×2 = 30cm³', warning: '三个维度都要乘起来'
  },

  // ═══════════ 英语 - 单词 ═══════════
  {
    id: 'eng-1', subject: 'english', chapter: 'words', knowledgePoint: '动物单词', difficulty: 'easy',
    question: 'cat 的中文意思是？', options: ['狗', '猫', '鸟', '鱼'], answer: '猫',
    explanation: 'cat 是猫，最常见的宠物之一', warning: '不要和 dog（狗）混淆'
  },
  {
    id: 'eng-2', subject: 'english', chapter: 'words', knowledgePoint: '动物单词', difficulty: 'medium',
    question: '"大象"的英文是？', options: ['dog', 'cat', 'elephant', 'tiger'], answer: 'elephant',
    explanation: 'elephant 是大象，e-l-e-p-h-a-n-t', warning: '注意 elephant 的拼写'
  },
  {
    id: 'eng-3', subject: 'english', chapter: 'words', knowledgePoint: '颜色单词', difficulty: 'easy',
    question: 'red 的中文意思是？', options: ['红色', '蓝色', '绿色', '黄色'], answer: '红色',
    explanation: 'red 是红色', warning: '颜色单词要多记多用'
  },
  {
    id: 'eng-4', subject: 'english', chapter: 'words', knowledgePoint: '颜色单词', difficulty: 'medium',
    question: '"蓝色"的英文是？', options: ['red', 'blue', 'green', 'yellow'], answer: 'blue',
    explanation: 'blue 是蓝色，天空的颜色', warning: '不要和 green（绿色）混淆'
  },
  {
    id: 'eng-5', subject: 'english', chapter: 'words', knowledgePoint: '数字单词', difficulty: 'easy',
    question: '"五"的英文是？', options: ['four', 'five', 'six', 'seven'], answer: 'five',
    explanation: '数字5是 five', warning: 'four是4，five是5'
  },
  {
    id: 'eng-6', subject: 'english', chapter: 'words', knowledgePoint: '数字单词', difficulty: 'medium',
    question: '"eleven" 是数字几？', options: ['10', '11', '12', '13'], answer: '11',
    explanation: 'eleven 是11，twelve 是12', warning: '11和12特殊记忆'
  },
  {
    id: 'eng-7', subject: 'english', chapter: 'words', knowledgePoint: '家庭成员', difficulty: 'easy',
    question: '"妈妈"的英文是？', options: ['father', 'mother', 'brother', 'sister'], answer: 'mother',
    explanation: 'mother 是妈妈，father 是爸爸', warning: '注意区分 mother 和 father'
  },
  {
    id: 'eng-8', subject: 'english', chapter: 'words', knowledgePoint: '家庭成员', difficulty: 'medium',
    question: '"sister" 的中文意思是？', options: ['哥哥', '姐姐', '妹妹', '弟弟'], answer: '妹妹',
    explanation: 'sister 是姐妹，一般指姐姐或妹妹', warning: 'brother 是兄弟'
  },

  // ═══════════ 英语 - 语法 ═══════════
  {
    id: 'eng-9', subject: 'english', chapter: 'grammar', knowledgePoint: 'be动词', difficulty: 'easy',
    question: 'She ___ a teacher. 应该填？', options: ['is', 'am', 'are', 'be'], answer: 'is',
    explanation: 'he/she/it 后面用 is', warning: 'I用am，you用are，he/she用is'
  },
  {
    id: 'eng-10', subject: 'english', chapter: 'grammar', knowledgePoint: 'be动词', difficulty: 'medium',
    question: 'We ___ students. 应该填？', options: ['is', 'am', 'are', 'be'], answer: 'are',
    explanation: '复数主语 we 后面用 are', warning: 'are 用于 you 和复数主语'
  },
  {
    id: 'eng-11', subject: 'english', chapter: 'grammar', knowledgePoint: '时态', difficulty: 'easy',
    question: 'I ___ (go) to school every day. 用正确形式填空', options: ['go', 'goes', 'went', 'going'], answer: 'go',
    explanation: '一般现在时，I 后跟动词原形 go', warning: '第三人称单数才加 s/es'
  },
  {
    id: 'eng-12', subject: 'english', chapter: 'grammar', knowledgePoint: '时态', difficulty: 'medium',
    question: 'He ___ (play) football yesterday. 用正确形式填空', options: ['play', 'plays', 'played', 'playing'], answer: 'played',
    explanation: 'yesterday 表示过去，用过去式 played', warning: '看到 yesterday 要用过去式'
  },
  {
    id: 'eng-13', subject: 'english', chapter: 'grammar', knowledgePoint: '单复数', difficulty: 'easy',
    question: '"一个苹果"的英文是？', options: ['a apple', 'an apple', 'apples', 'the apple'], answer: 'an apple',
    explanation: 'apple 以元音音素开头，用 an', warning: 'a/an 表示一个，元音前用 an'
  },
  {
    id: 'eng-14', subject: 'english', chapter: 'grammar', knowledgePoint: '单复数', difficulty: 'medium',
    question: '"two ___" 两本书，横线填？', options: ['book', 'bookes', 'books', 'bookies'], answer: 'books',
    explanation: 'book 变复数直接加 s → books', warning: '多数名词变复数加s即可'
  },

  // ═══════════ 英语 - 阅读 ═══════════
  {
    id: 'eng-15', subject: 'english', chapter: 'reading', knowledgePoint: '短文理解', difficulty: 'easy',
    question: '"Tom is a boy. He is 10 years old." Tom 几岁？', options: ['8', '9', '10', '11'], answer: '10',
    explanation: '文中说 He is 10 years old，所以10岁', warning: '注意找关键词 years old'
  },
  {
    id: 'eng-16', subject: 'english', chapter: 'reading', knowledgePoint: '短文理解', difficulty: 'medium',
    question: '"Lily has a cat. It is white." Lily有什么？', options: ['a dog', 'a cat', 'a bird', 'a fish'], answer: 'a cat',
    explanation: '文中说 Lily has a cat，她有一只猫', warning: 'has 表示拥有'
  },
  {
    id: 'eng-17', subject: 'english', chapter: 'reading', knowledgePoint: '句子排序', difficulty: 'easy',
    question: '排序：A. I B. a student C. am', options: ['A-B-C', 'A-C-B', 'B-A-C', 'C-A-B'], answer: 'A-C-B',
    explanation: 'I am a student 我是学生', warning: '英语语序：主语+动词+宾语'
  },
  {
    id: 'eng-18', subject: 'english', chapter: 'reading', knowledgePoint: '句子排序', difficulty: 'medium',
    question: '排序：A. likes B. She C. apples', options: ['A-B-C', 'B-A-C', 'B-C-A', 'C-A-B'], answer: 'B-A-C',
    explanation: 'She likes apples 她喜欢苹果', warning: '主语在前，动词在后，宾语在最后'
  },

  // ═══════════ 物理 - 力学 ═══════════
  {
    id: 'phy-1', subject: 'physics', chapter: 'mechanics', knowledgePoint: '重力', difficulty: 'easy',
    question: '重力的方向是？', options: ['向上', '向下', '向左', '向右'], answer: '向下',
    explanation: '重力的方向总是竖直向下，指向地心', warning: '重力方向始终指向地球中心'
  },
  {
    id: 'phy-2', subject: 'physics', chapter: 'mechanics', knowledgePoint: '重力', difficulty: 'medium',
    question: '一个物体质量2kg，重力约为多少？（g=10N/kg）', options: ['10N', '20N', '30N', '40N'], answer: '20N',
    explanation: '重力 G=mg=2×10=20N', warning: '重力公式 G=mg，注意单位'
  },
  {
    id: 'phy-3', subject: 'physics', chapter: 'mechanics', knowledgePoint: '摩擦力', difficulty: 'easy',
    question: '摩擦力的方向与物体运动方向？', options: ['相同', '相反', '垂直', '不确定'], answer: '相反',
    explanation: '摩擦力总是阻碍物体相对运动，方向与运动方向相反', warning: '摩擦力是阻碍运动的力'
  },
  {
    id: 'phy-4', subject: 'physics', chapter: 'mechanics', knowledgePoint: '摩擦力', difficulty: 'medium',
    question: '以下哪个可以减小摩擦力？', options: ['增大压力', '加润滑油', '使接触面粗糙', '增大接触面积'], answer: '加润滑油',
    explanation: '加润滑油可以减小接触面的摩擦系数', warning: '增大压力会增大摩擦力'
  },
  {
    id: 'phy-5', subject: 'physics', chapter: 'mechanics', knowledgePoint: '弹力', difficulty: 'easy',
    question: '弹簧被拉伸时产生的是什么力？', options: ['重力', '弹力', '摩擦力', '电力'], answer: '弹力',
    explanation: '物体发生弹性形变时产生的力叫弹力', warning: '弹力方向与形变方向相反'
  },
  {
    id: 'phy-6', subject: 'physics', chapter: 'mechanics', knowledgePoint: '弹力', difficulty: 'medium',
    question: '弹簧测力计的原理是？', options: ['重力与质量成正比', '弹力与伸长量成正比', '摩擦力与压力成正比', '浮力与体积成正比'], answer: '弹力与伸长量成正比',
    explanation: '胡克定律：在弹性限度内，弹力与弹簧伸长量成正比', warning: 'F=kx，k是劲度系数'
  },

  // ═══════════ 物理 - 光学 ═══════════
  {
    id: 'phy-7', subject: 'physics', chapter: 'light', knowledgePoint: '光的传播', difficulty: 'easy',
    question: '光在均匀介质中沿什么传播？', options: ['曲线', '直线', '折线', '任意方向'], answer: '直线',
    explanation: '光在同种均匀介质中沿直线传播', warning: '前提是"同种均匀介质"'
  },
  {
    id: 'phy-8', subject: 'physics', chapter: 'light', knowledgePoint: '光的传播', difficulty: 'medium',
    question: '光在真空中的速度约为？', options: ['3×10⁶ m/s', '3×10⁷ m/s', '3×10⁸ m/s', '3×10⁹ m/s'], answer: '3×10⁸ m/s',
    explanation: '光在真空中速度约3×10⁸ m/s，即每秒30万公里', warning: '记住3后面8个零'
  },
  {
    id: 'phy-9', subject: 'physics', chapter: 'light', knowledgePoint: '反射', difficulty: 'easy',
    question: '入射角等于什么？', options: ['折射角', '反射角', '法线角', '出射角'], answer: '反射角',
    explanation: '光的反射定律：入射角 = 反射角', warning: '入射角和反射角都是与法线的夹角'
  },
  {
    id: 'phy-10', subject: 'physics', chapter: 'light', knowledgePoint: '反射', difficulty: 'medium',
    question: '平面镜成像的特点是？', options: ['实像、等大', '虚像、等大', '实像、放大', '虚像、缩小'], answer: '虚像、等大',
    explanation: '平面镜成虚像，像与物等大，像到镜面的距离等于物到镜面的距离', warning: '虚像不能用光屏承接'
  },
  {
    id: 'phy-11', subject: 'physics', chapter: 'light', knowledgePoint: '折射', difficulty: 'easy',
    question: '光从空气斜射入水中，折射光线偏向哪里？', options: ['偏向法线', '远离法线', '方向不变', '垂直水面'], answer: '偏向法线',
    explanation: '光从空气进入水中（光疏到光密），折射光线偏向法线', warning: '空气中角大，水中角小'
  },
  {
    id: 'phy-12', subject: 'physics', chapter: 'light', knowledgePoint: '折射', difficulty: 'medium',
    question: '筷子插入水中看起来"折断"了，是什么现象？', options: ['反射', '折射', '衍射', '散射'], answer: '折射',
    explanation: '光从水中进入空气发生折射，使筷子看起来折断', warning: '这是光的折射在日常生活中的体现'
  },

  // ═══════════ 化学 - 物质 ═══════════
  {
    id: 'chem-1', subject: 'chemistry', chapter: 'matter', knowledgePoint: '固液气', difficulty: 'easy',
    question: '水在0°C以下是什么状态？', options: ['固态', '液态', '气态', '等离子态'], answer: '固态',
    explanation: '水在0°C以下结冰，变成固态', warning: '物质状态随温度变化'
  },
  {
    id: 'chem-2', subject: 'chemistry', chapter: 'matter', knowledgePoint: '固液气', difficulty: 'medium',
    question: '以下哪个不是物质的三态之一？', options: ['固态', '液态', '气态', '等离子态'], answer: '等离子态',
    explanation: '常见物质三态是固态、液态、气态，等离子态是第四态', warning: '初中阶段主要学习固液气三态'
  },
  {
    id: 'chem-3', subject: 'chemistry', chapter: 'matter', knowledgePoint: '物质变化', difficulty: 'easy',
    question: '水结成冰属于？', options: ['物理变化', '化学变化', '都不是', '都是'], answer: '物理变化',
    explanation: '水结成冰只是状态变化，没有新物质生成，是物理变化', warning: '无新物质生成的是物理变化'
  },
  {
    id: 'chem-4', subject: 'chemistry', chapter: 'matter', knowledgePoint: '物质变化', difficulty: 'medium',
    question: '铁生锈属于？', options: ['物理变化', '化学变化', '都不是', '都是'], answer: '化学变化',
    explanation: '铁生锈生成铁锈（氧化铁），有新物质生成，是化学变化', warning: '有新物质生成是化学变化的标志'
  },
  {
    id: 'chem-5', subject: 'chemistry', chapter: 'matter', knowledgePoint: '分子原子', difficulty: 'easy',
    question: '保持物质化学性质的最小微粒是？', options: ['原子', '分子', '电子', '质子'], answer: '分子',
    explanation: '分子是保持物质化学性质的最小微粒', warning: '原子是化学变化中的最小微粒'
  },
  {
    id: 'chem-6', subject: 'chemistry', chapter: 'matter', knowledgePoint: '分子原子', difficulty: 'medium',
    question: '水分子 H₂O 由什么组成？', options: ['氢原子和氧原子', '氢分子和氧分子', '氢离子和氧离子', '只有氧原子'], answer: '氢原子和氧原子',
    explanation: 'H₂O表示一个水分子由2个氢原子和1个氧原子组成', warning: '分子由原子组成'
  },

  // ═══════════ 化学 - 化学反应 ═══════════
  {
    id: 'chem-7', subject: 'chemistry', chapter: 'reaction', knowledgePoint: '氧化反应', difficulty: 'easy',
    question: '物质与氧气发生的反应叫什么？', options: ['氧化反应', '还原反应', '化合反应', '分解反应'], answer: '氧化反应',
    explanation: '物质与氧发生的反应叫氧化反应', warning: '燃烧就是剧烈的氧化反应'
  },
  {
    id: 'chem-8', subject: 'chemistry', chapter: 'reaction', knowledgePoint: '氧化反应', difficulty: 'medium',
    question: '以下哪个不是氧化反应？', options: ['铁生锈', '蜡烛燃烧', '水通电分解', '呼吸作用'], answer: '水通电分解',
    explanation: '水通电分解是分解反应2H₂O→2H₂↑+O₂↑，不是氧化反应', warning: '氧化反应必须有氧参与'
  },
  {
    id: 'chem-9', subject: 'chemistry', chapter: 'reaction', knowledgePoint: '化合反应', difficulty: 'easy',
    question: '两种或多种物质生成一种物质的反应叫？', options: ['化合反应', '分解反应', '置换反应', '复分解反应'], answer: '化合反应',
    explanation: '多变一是化合反应：A+B→AB', warning: '化合反应的特征是"多变一"'
  },
  {
    id: 'chem-10', subject: 'chemistry', chapter: 'reaction', knowledgePoint: '化合反应', difficulty: 'medium',
    question: 'C + O₂ → CO₂ 属于什么反应类型？', options: ['化合反应', '分解反应', '置换反应', '复分解反应'], answer: '化合反应',
    explanation: 'C和O₂两种物质生成CO₂一种，是化合反应也是氧化反应', warning: '一个反应可能同时属于多种类型'
  },
];

export function getQuestionsByChapter(subjectId: string, chapterId: string): Question[] {
  return getAllQuestions().filter(q => q.subject === subjectId && q.chapter === chapterId);
}

export function getQuestionsByKnowledge(knowledgePoint: string, difficulty?: string): Question[] {
  return getAllQuestions().filter(q =>
    q.knowledgePoint === knowledgePoint &&
    (!difficulty || q.difficulty === difficulty)
  );
}

export function getRandomQuestion(subjectId: string, chapterId: string, exclude: string[] = []): Question | null {
  const questions = getQuestionsByChapter(subjectId, chapterId).filter(q => !exclude.includes(q.id));
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getRandomKnowledgeQuestion(knowledgePoint: string, difficulty: string, exclude: string[] = []): Question | null {
  const questions = getQuestionsByKnowledge(knowledgePoint, difficulty).filter(q => !exclude.includes(q.id));
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

// ── Merged helpers: built-in + custom ──

export function getAllChapters(): Record<string, { id: string; name: string; knowledgePoints: string[] }[]> {
  const custom = storage.getCustomChapters();
  const merged: Record<string, { id: string; name: string; knowledgePoints: string[] }[]> = {};
  // Built-in
  for (const [subj, chs] of Object.entries(CHAPTERS)) {
    merged[subj] = [...chs];
  }
  // Custom merge: for each subject, merge chapters by id (add new, update existing knowledge points)
  for (const [subj, chs] of Object.entries(custom)) {
    if (!merged[subj]) merged[subj] = [];
    for (const ch of chs) {
      const idx = merged[subj].findIndex(b => b.id === ch.id);
      if (idx >= 0) {
        // Merge knowledge points
        const existingKps = new Set(merged[subj][idx].knowledgePoints);
        ch.knowledgePoints.forEach(kp => existingKps.add(kp));
        merged[subj][idx] = { ...merged[subj][idx], knowledgePoints: Array.from(existingKps) };
      } else {
        merged[subj].push(ch);
      }
    }
  }
  return merged;
}

export function getAllQuestions(): Question[] {
  const stored = localStorage.getItem('all_questions');
  if (stored) return JSON.parse(stored) as Question[];
  // First load: seed all_questions with built-in + custom
  const all = [...QUESTIONS, ...storage.getCustomQuestions()];
  localStorage.setItem('all_questions', JSON.stringify(all));
  return all;
}

export function getAllKnowledgePoints(): string[] {
  const kps = new Set<string>();
  // Built-in
  Object.values(CHAPTERS).forEach(chs =>
    chs.forEach(ch => ch.knowledgePoints.forEach(kp => kps.add(kp)))
  );
  QUESTIONS.forEach(q => kps.add(q.knowledgePoint));
  // Custom
  storage.getAllKnowledgePoints().forEach(kp => kps.add(kp));
  // Standalone
  const standalone = JSON.parse(localStorage.getItem('standalone_knowledge_points') || '[]') as string[];
  standalone.forEach((kp: string) => kps.add(kp));
  return Array.from(kps);
}
