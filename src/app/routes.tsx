import { createHashRouter } from "react-router";
import Root from "./components/Root";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import SubjectPage from "./components/SubjectPage";
import PracticePage from "./components/PracticePage";
import WeaknessPage from "./components/WeaknessPage";
import GradedPracticePage from "./components/GradedPracticePage";
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

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginPage },
      { path: "dashboard", Component: Dashboard },
      { path: "subject/:subjectId", Component: SubjectPage },
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
