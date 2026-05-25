import HighGradeSettingsPage from '../frontends/high-grade/pages/SettingsPage';
import LowGradeSettingsPage from '../frontends/low-grade/pages/SettingsPage';
import { isHighGrade } from '../frontends/shared/gradeBand';

export default function SettingsPage() {
  return isHighGrade() ? <HighGradeSettingsPage /> : <LowGradeSettingsPage />;
}
