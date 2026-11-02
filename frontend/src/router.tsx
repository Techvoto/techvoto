import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { PageSkeleton } from '@/components/Skeletons';
import { Providers } from './Providers';
import { AppLayout, AuthLayout, RoleGate, SiteLayout } from './layouts/layouts';
import ErrorPage from './pages/ErrorPage';
import NotFound from './pages/NotFound';

// Every page is its own chunk, so the first load only downloads what the visited route needs.
const Home = lazy(() => import('./pages/site/Home'));
const Catalog = lazy(() => import('./pages/site/Catalog'));
const CourseDetail = lazy(() => import('./pages/site/CourseDetail'));
const Contact = lazy(() => import('./pages/site/Contact'));
const Privacy = lazy(() => import('./pages/site/Privacy'));
const Terms = lazy(() => import('./pages/site/Terms'));
const VerifyIndex = lazy(() => import('./pages/site/VerifyIndex'));
const VerifyCertificate = lazy(() => import('./pages/site/VerifyCertificate'));
const VerifyEmail = lazy(() => import('./pages/site/VerifyEmail'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const MyLearning = lazy(() => import('./pages/app/MyLearning'));
const Player = lazy(() => import('./pages/app/Player'));
const QuizPage = lazy(() => import('./pages/app/QuizPage'));
const LivePage = lazy(() => import('./pages/app/LivePage'));
const LiveRoom = lazy(() => import('./pages/app/LiveRoom'));
const Certificates = lazy(() => import('./pages/app/Certificates'));
const Notifications = lazy(() => import('./pages/app/Notifications'));
const Profile = lazy(() => import('./pages/app/Profile'));
const Billing = lazy(() => import('./pages/app/Billing'));
const CheckoutVerify = lazy(() => import('./pages/app/CheckoutVerify'));

const InstructorHome = lazy(() => import('./pages/instructor/InstructorHome'));
const MyCourses = lazy(() => import('./pages/instructor/MyCourses'));
const NewCourse = lazy(() => import('./pages/instructor/NewCourse'));
const CourseEditor = lazy(() => import('./pages/instructor/CourseEditor'));

const AdminHome = lazy(() => import('./pages/admin/AdminHome'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));

export const router = createBrowserRouter([
  {
    element: <Providers />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <div className="mx-auto max-w-page p-6"><PageSkeleton /></div>,
    children: [
      {
        element: <SiteLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/courses', element: <Catalog /> },
          { path: '/courses/:slug', element: <CourseDetail /> },
          { path: '/contact', element: <Contact /> },
          { path: '/privacy', element: <Privacy /> },
          { path: '/terms', element: <Terms /> },
          { path: '/verify', element: <VerifyIndex /> },
          { path: '/verify/:token', element: <VerifyCertificate /> },
          { path: '/verify-email', element: <VerifyEmail /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
          { path: '/forgot-password', element: <ForgotPassword /> },
          { path: '/reset-password', element: <ResetPassword /> },
        ],
      },
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/my-learning', element: <MyLearning /> },
          { path: '/learn/:slug', element: <Player /> },
          { path: '/quizzes/:id', element: <QuizPage /> },
          { path: '/live', element: <LivePage /> },
          { path: '/live/:id', element: <LiveRoom /> },
          { path: '/certificates', element: <Certificates /> },
          { path: '/notifications', element: <Notifications /> },
          { path: '/profile', element: <Profile /> },
          { path: '/billing', element: <Billing /> },
          { path: '/checkout/verify', element: <CheckoutVerify /> },
          {
            path: '/instructor',
            element: <RoleGate roles={['instructor', 'admin']} />,
            children: [
              { index: true, element: <InstructorHome /> },
              { path: 'courses', element: <MyCourses /> },
              { path: 'courses/new', element: <NewCourse /> },
              { path: 'courses/:slug', element: <CourseEditor /> },
            ],
          },
          {
            path: '/admin',
            element: <RoleGate roles={['admin']} />,
            children: [
              { index: true, element: <AdminHome /> },
              { path: 'users', element: <AdminUsers /> },
              { path: 'courses', element: <AdminCourses /> },
              { path: 'categories', element: <AdminCategories /> },
              { path: 'payments', element: <AdminPayments /> },
              { path: 'refunds', element: <AdminRefunds /> },
              { path: 'messages', element: <AdminMessages /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
