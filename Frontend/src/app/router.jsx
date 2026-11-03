import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { ChooseRolePage } from '../features/landing/ChooseRolePage';
import { LoginPage } from '../features/auth/LoginPage';
import { StudentSignupPage } from '../features/auth/StudentSignupPage';
import { StudentLayout, ProfessorLayout } from '../components/layout/DashboardLayouts';
import { RequireAuth, RequireRole } from '../components/layout/RouteGuards';
import { StudentDashboardPage } from '../features/student/StudentDashboardPage';
import { StudentClassesPage } from '../features/student/StudentClassesPage';
import { CourseDetailPage } from '../features/student/CourseDetailPage';
import { StudentCalendarPage } from '../features/student/StudentCalendarPage';
import { StudentAssignmentsPage } from '../features/student/StudentAssignmentsPage';
import { QuizTakingPage } from '../features/student/QuizTakingPage';
import { ProfessorDashboardPage } from '../features/professor/ProfessorDashboardPage';
import { ProfessorCoursesPage } from '../features/professor/ProfessorCoursesPage';
import { ProfessorCourseDetailPage } from '../features/professor/ProfessorCourseDetailPage';
import { SubmissionsGradingPage } from '../features/professor/SubmissionsGradingPage';
import { ProfessorGradebookPage } from '../features/professor/ProfessorGradebookPage';
import { MessagesPage } from '../features/messages/MessagesPage';
import { NotFoundPage } from '../features/common/NotFoundPage';
import { ApiHealthPage } from '../features/common/ApiHealthPage';
import { useAuthStore } from '../store/authStore';

// Dynamic role wrapper for shared routes like /messages
function DynamicRoleLayout() {
  const role = useAuthStore((s) => s.role);
  if (role === 'PROFESSOR' || role === 'FACULTY') {
    return <ProfessorLayout />;
  }
  return <StudentLayout />;
}

export const router = createBrowserRouter([
  // Public Landing & Auth Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/choose-role',
    element: <ChooseRolePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup/student',
    element: <StudentSignupPage />,
  },
  {
    path: '/signup/professor',
    element: <StudentSignupPage />,
  },
  {
    path: '/signup/teacher',
    element: <StudentSignupPage />,
  },
  {
    path: '/health',
    element: <ApiHealthPage />,
  },
  {
    path: '/api-status',
    element: <ApiHealthPage />,
  },

  // Focus Mode Quiz (no sidebar)
  {
    path: '/student/classes/:courseId/quizzes/:quizId',
    element: (
      <RequireAuth>
        <RequireRole allowedRole="STUDENT">
          <QuizTakingPage />
        </RequireRole>
      </RequireAuth>
    ),
  },

  // Student Workspace
  {
    path: '/student',
    element: (
      <RequireAuth>
        <RequireRole allowedRole="STUDENT">
          <StudentLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/student/home" replace />,
      },
      {
        path: 'home',
        element: <StudentDashboardPage />,
      },
      {
        path: 'classes',
        element: <StudentClassesPage />,
      },
      {
        path: 'classes/:courseId',
        element: <CourseDetailPage />,
      },
      {
        path: 'calendar',
        element: <StudentCalendarPage />,
      },
      {
        path: 'assignments',
        element: <StudentAssignmentsPage />,
      },
    ],
  },

  // Professor Workspace
  {
    path: '/professor',
    element: (
      <RequireAuth>
        <RequireRole allowedRole="FACULTY">
          <ProfessorLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/professor/overview" replace />,
      },
      {
        path: 'overview',
        element: <ProfessorDashboardPage />,
      },
      {
        path: 'courses',
        element: <ProfessorCoursesPage />,
      },
      {
        path: 'courses/:courseId',
        element: <ProfessorCourseDetailPage />,
      },
      {
        path: 'submissions',
        element: <SubmissionsGradingPage />,
      },
      {
        path: 'submissions/:assignmentId/:studentId',
        element: <SubmissionsGradingPage />,
      },
      {
        path: 'gradebook',
        element: <ProfessorGradebookPage />,
      },
    ],
  },

  // Shared Routes
  {
    path: '/messages',
    element: (
      <RequireAuth>
        <DynamicRoleLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <MessagesPage />,
      },
      {
        path: ':threadId',
        element: <MessagesPage />,
      },
    ],
  },

  // Fallback 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  future: {
    v7_startTransition: true,
  },
});
