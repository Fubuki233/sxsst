import { createHashRouter } from "react-router";
import Root from "./components/Root";
import UiIndexPage from "./components/UiIndexPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import SubjectPage from "./components/SubjectPage";
import PracticePage from "./components/PracticePage";
import WeaknessPage from "./components/WeaknessPage";
import GradedPracticePage from "./components/GradedPracticePage";
import LessonIntroPage from "./components/LessonIntroPage";
import KnowledgeMapPage from "./components/KnowledgeMapPage";
import WrongQuestionsPage from "./components/WrongQuestionsPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import SwitchGradePage from "./components/SwitchGradePage";
import DataManagementPage from "./components/DataManagementPage";
import TeacherDashboard from "./components/TeacherDashboard";
import QuestionManage from "./components/QuestionManage";
import ManageContent from "./components/ManageContent";
import CourseManagement from "./components/CourseManagement";
import ClassManagement from "./components/ClassManagement";
import LegacyDashboard from "./components/legacy/Dashboard";
import LegacySubjectPage from "./components/legacy/SubjectPage";
import LegacyPracticePage from "./components/legacy/PracticePage";
import LegacyWeaknessPage from "./components/legacy/WeaknessPage";
import LegacyGradedPracticePage from "./components/legacy/GradedPracticePage";
import LegacyKnowledgeMapPage from "./components/legacy/KnowledgeMapPage";
import LegacyWrongQuestionsPage from "./components/legacy/WrongQuestionsPage";
import LegacyProfilePage from "./components/legacy/ProfilePage";
import LegacySettingsPage from "./components/legacy/SettingsPage";
import LegacyChangePasswordPage from "./components/legacy/ChangePasswordPage";
import LegacySwitchGradePage from "./components/legacy/SwitchGradePage";
import LegacyDataManagementPage from "./components/legacy/DataManagementPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: UiIndexPage },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: Dashboard },
      { path: "github-legacy", Component: LegacyDashboard },
      { path: "legacy", Component: LegacyDashboard },
      { path: "legacy/subject/:subjectId", Component: LegacySubjectPage },
      { path: "legacy/practice/:subjectId/:chapterId", Component: LegacyPracticePage },
      { path: "legacy/weakness", Component: LegacyWeaknessPage },
      { path: "legacy/graded-practice/:knowledgeId", Component: LegacyGradedPracticePage },
      { path: "legacy/knowledge-map", Component: LegacyKnowledgeMapPage },
      { path: "legacy/wrong-questions", Component: LegacyWrongQuestionsPage },
      { path: "legacy/profile", Component: LegacyProfilePage },
      { path: "legacy/settings", Component: LegacySettingsPage },
      { path: "legacy/settings/change-password", Component: LegacyChangePasswordPage },
      { path: "legacy/settings/switch-grade", Component: LegacySwitchGradePage },
      { path: "legacy/settings/data-management", Component: LegacyDataManagementPage },
      { path: "subject/:subjectId", Component: SubjectPage },
      { path: "lesson/chapter/:subjectId/:chapterId", Component: LessonIntroPage },
      { path: "lesson/knowledge/:knowledgeId", Component: LessonIntroPage },
      { path: "practice/:subjectId/:chapterId", Component: PracticePage },
      { path: "weakness", Component: WeaknessPage },
      { path: "graded-practice/:knowledgeId", Component: GradedPracticePage },
      { path: "knowledge-map", Component: KnowledgeMapPage },
      { path: "wrong-questions", Component: WrongQuestionsPage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", Component: SettingsPage },
      { path: "settings/change-password", Component: ChangePasswordPage },
      { path: "settings/switch-grade", Component: SwitchGradePage },
      { path: "settings/data-management", Component: DataManagementPage },
      // Teacher routes
      { path: "teacher", Component: TeacherDashboard },
      { path: "teacher/question-manage", Component: QuestionManage },
      { path: "teacher/subject-chapters", Component: ManageContent },
      { path: "teacher/course-management", Component: CourseManagement },
      { path: "teacher/class-management", Component: ClassManagement },
    ],
  },
]);
