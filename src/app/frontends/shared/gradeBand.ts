import { storage, type User } from '../../utils/storage';

export type GradeBand = 'low-grade' | 'high-grade' | 'teacher' | 'guest';

export function getGradeBand(user: User | null = storage.getCurrentUser()): GradeBand {
  if (!user) return 'guest';
  if (user.role === 'teacher') return 'teacher';
  return user.grade >= 4 ? 'high-grade' : 'low-grade';
}

export function isHighGrade(user: User | null = storage.getCurrentUser()) {
  return getGradeBand(user) === 'high-grade';
}

export function isLowGrade(user: User | null = storage.getCurrentUser()) {
  return getGradeBand(user) === 'low-grade';
}
