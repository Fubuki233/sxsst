export interface User {
  username: string;
  password: string;
  grade: number;
  role: 'student' | 'teacher';
}

export interface Question {
  id: string;
  subject: string;
  chapter: string;
  knowledgePoint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  warning: string;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
  knowledgePoint: string;
  difficulty: string;
}

export interface KnowledgeStats {
  knowledgePoint: string;
  subject: string;
  total: number;
  correct: number;
  accuracy: number;
}

class Storage {
  private getUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  register(username: string, password: string, grade: number, role: 'student' | 'teacher'): boolean {
    const users = this.getUsers();
    if (users.find(u => u.username === username)) {
      return false;
    }
    users.push({ username, password, grade, role });
    this.saveUsers(users);
    return true;
  }

  login(username: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  changePassword(username: string, oldPassword: string, newPassword: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === oldPassword);
    if (!user) return false;
    user.password = newPassword;
    this.saveUsers(users);
    return true;
  }

  updateGrade(username: string, grade: number) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx < 0) return false;
    users[idx].grade = grade;
    this.saveUsers(users);
    // Also update currentUser
    const cur = this.getCurrentUser();
    if (cur && cur.username === username) {
      cur.grade = grade;
      localStorage.setItem('currentUser', JSON.stringify(cur));
    }
    return true;
  }

  saveAnswer(answer: Answer) {
    const user = this.getCurrentUser();
    if (!user) return;

    const key = `answers_${user.username}`;
    const answers: Answer[] = JSON.parse(localStorage.getItem(key) || '[]');
    answers.push(answer);
    localStorage.setItem(key, JSON.stringify(answers));
  }

  getAnswers(): Answer[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const key = `answers_${user.username}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  getWrongAnswers(): Answer[] {
    return this.getAnswers().filter(a => !a.isCorrect);
  }

  getTodayAnswers(): Answer[] {
    const today = new Date().setHours(0, 0, 0, 0);
    return this.getAnswers().filter(a => new Date(a.timestamp).setHours(0, 0, 0, 0) === today);
  }

  getKnowledgeStats(): KnowledgeStats[] {
    const answers = this.getAnswers();
    const statsMap = new Map<string, KnowledgeStats>();

    answers.forEach(answer => {
      const key = answer.knowledgePoint;
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          knowledgePoint: answer.knowledgePoint,
          subject: '',
          total: 0,
          correct: 0,
          accuracy: 0
        });
      }
      const stats = statsMap.get(key)!;
      stats.total++;
      if (answer.isCorrect) stats.correct++;
      stats.accuracy = Math.round((stats.correct / stats.total) * 100);
    });

    return Array.from(statsMap.values()).sort((a, b) => a.accuracy - b.accuracy);
  }

  // ─────────────── Teacher methods ───────────────

  // All registered students
  getStudents(): User[] {
    return this.getUsers().filter(u => u.role === 'student');
  }

  // All answers across all students, keyed by username
  getAllAnswers(): Record<string, Answer[]> {
    const users = this.getUsers().filter(u => u.role === 'student');
    const result: Record<string, Answer[]> = {};
    users.forEach(u => {
      const key = `answers_${u.username}`;
      result[u.username] = JSON.parse(localStorage.getItem(key) || '[]');
    });
    return result;
  }

  // Custom questions (teacher-uploaded, stored in localStorage key 'custom_questions')
  getCustomQuestions(): Question[] {
    return JSON.parse(localStorage.getItem('custom_questions') || '[]');
  }

  saveCustomQuestions(questions: Question[]) {
    localStorage.setItem('custom_questions', JSON.stringify(questions));
  }

  addCustomQuestion(q: Question) {
    const list = this.getCustomQuestions();
    list.push(q);
    this.saveCustomQuestions(list);
  }

  deleteCustomQuestion(id: string) {
    const list = this.getCustomQuestions().filter(q => q.id !== id);
    this.saveCustomQuestions(list);
  }

  // ── Unified question store (built-in + custom, fully mutable) ──
  getAllQuestions(): Question[] {
    const stored = localStorage.getItem('all_questions');
    if (stored) return JSON.parse(stored);
    // First load: seed from built-in + custom (will be done by caller)
    return [];
  }

  saveAllQuestions(questions: Question[]) {
    localStorage.setItem('all_questions', JSON.stringify(questions));
  }

  addQuestion(q: Question) {
    const all = this.getAllQuestions();
    all.push(q);
    this.saveAllQuestions(all);
  }

  updateQuestion(q: Question) {
    const all = this.getAllQuestions();
    const idx = all.findIndex(x => x.id === q.id);
    if (idx >= 0) {
      all[idx] = q;
      this.saveAllQuestions(all);
    }
  }

  deleteQuestion(id: string) {
    const all = this.getAllQuestions().filter(q => q.id !== id);
    this.saveAllQuestions(all);
  }

  // Custom chapters & knowledge points (stored in localStorage key 'custom_chapters')
  // Structure mirrors CHAPTERS type
  getCustomChapters(): Record<string, { id: string; name: string; knowledgePoints: string[] }[]> {
    return JSON.parse(localStorage.getItem('custom_chapters') || '{}');
  }

  saveCustomChapters(data: Record<string, { id: string; name: string; knowledgePoints: string[] }[]>) {
    localStorage.setItem('custom_chapters', JSON.stringify(data));
  }

  // All knowledge points from custom sources (built-in merged by caller)
  getAllKnowledgePoints(): string[] {
    const kps = new Set<string>();
    const cc = this.getCustomChapters();
    Object.values(cc).forEach(chs =>
      chs.forEach(ch => ch.knowledgePoints.forEach(kp => kps.add(kp)))
    );
    this.getCustomQuestions().forEach(q => kps.add(q.knowledgePoint));
    return Array.from(kps);
  }

  clearAllData() {
    const user = this.getCurrentUser();
    if (!user) return;

    const key = `answers_${user.username}`;
    localStorage.removeItem(key);
  }

  removeWrongQuestion(questionId: string) {
    const user = this.getCurrentUser();
    if (!user) return;

    const key = `answers_${user.username}`;
    let answers: Answer[] = JSON.parse(localStorage.getItem(key) || '[]');
    answers = answers.filter(a => a.questionId !== questionId || a.isCorrect);
    localStorage.setItem(key, JSON.stringify(answers));
  }
}

export const storage = new Storage();
