import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { storage } from '../../../utils/storage';

export type SeniorThemeMode = 'dark' | 'light';

export const SENIOR_THEME_KEY = 'seniorThemeMode';
export const SENIOR_THEME_EVENT = 'senior-theme-changed';

export function getStoredSeniorTheme(): SeniorThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.localStorage.getItem(SENIOR_THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function applySeniorTheme(mode: SeniorThemeMode, enabled: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('senior-theme-enabled', enabled);
  document.documentElement.classList.toggle('senior-theme-light', enabled && mode === 'light');
  document.documentElement.classList.toggle('senior-theme-dark', enabled && mode === 'dark');
}

export function setStoredSeniorTheme(mode: SeniorThemeMode) {
  window.localStorage.setItem(SENIOR_THEME_KEY, mode);
  window.dispatchEvent(new CustomEvent<SeniorThemeMode>(SENIOR_THEME_EVENT, { detail: mode }));
}

export function SeniorThemeProvider() {
  const location = useLocation();
  const [mode, setMode] = useState<SeniorThemeMode>(() => getStoredSeniorTheme());
  const [isSeniorStudent, setIsSeniorStudent] = useState(() => {
    const user = storage.getCurrentUser();
    return user?.role !== 'teacher' && user?.grade !== undefined && user.grade >= 4;
  });

  useEffect(() => {
    const user = storage.getCurrentUser();
    setIsSeniorStudent(user?.role !== 'teacher' && user?.grade !== undefined && user.grade >= 4);
  }, [location.pathname]);

  useEffect(() => {
    const refreshUser = () => {
      const user = storage.getCurrentUser();
      setIsSeniorStudent(user?.role !== 'teacher' && user?.grade !== undefined && user.grade >= 4);
    };
    const refreshTheme = () => setMode(getStoredSeniorTheme());
    const handleThemeChanged = (event: Event) => {
      setMode((event as CustomEvent<SeniorThemeMode>).detail || getStoredSeniorTheme());
    };

    window.addEventListener('focus', refreshUser);
    window.addEventListener('profile-updated', refreshUser);
    window.addEventListener('storage', refreshTheme);
    window.addEventListener(SENIOR_THEME_EVENT, handleThemeChanged);
    return () => {
      window.removeEventListener('focus', refreshUser);
      window.removeEventListener('profile-updated', refreshUser);
      window.removeEventListener('storage', refreshTheme);
      window.removeEventListener(SENIOR_THEME_EVENT, handleThemeChanged);
    };
  }, []);

  useEffect(() => {
    applySeniorTheme(mode, isSeniorStudent);
    return () => applySeniorTheme(mode, false);
  }, [isSeniorStudent, mode]);

  return null;
}
