import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import { DashboardLayout, DashboardLayout1 } from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
// import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
// import DashboardAppPage from './pages/DashboardAppPage';
import SignUpForm from './pages/SignUpForm';
import SignUpForm2 from './pages/SignUpForm2';
import HomePage from './pages/HomePage';
import UserLogin from './pages/UserLogin';
import ProductsPage1 from './pages/ProductsPage1';
import DashboardAppPage1 from './pages/DashboardAppPage1'; 

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    { 
      path: '/admin/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/admin/dashboard/candidates" />, index: true },
        // { path: 'app', element: <DashboardAppPage /> },
        { path: 'candidates', element: <ProductsPage /> },
      ],
    },
    {
      path: '/admin', 
      element: <LoginPage />,
    },
    { 
      path: '/user/dashboard',
      element: <DashboardLayout1 />,
      children: [
        { element: <Navigate to="/user/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage1 /> },
        { path: 'vote', element: <ProductsPage1 /> },
      ],
    }, 

    {
      path: '/user',
      element: <UserLogin />,
    },
    {
      path: '/user/signup',
      element: <SignUpForm />,
    },
    {
      path: '/user/signupdoc',
      element: <SignUpForm2 />,
    },
    {
      path: '/',
      element: <HomePage />,
    },
  ]);

  return routes;
}
