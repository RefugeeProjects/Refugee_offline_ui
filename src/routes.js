import React, { useCallback } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import IdentityLayout from './layouts/dashboard/IdentityLayout';
import ViewLayout from './layouts/dashboard/ViewLayout';
import UserLayout from './layouts/dashboard/UserLayout';
import IqamaLayouts from './layouts/dashboard/IqamaLayouts';
import MokLayouts from './layouts/dashboard/MokLayouts';
import SimpleLayout from './layouts/simple';
import PrivateRoute from './auth/PrivateRoutes';

// dashboard pages
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import DashboardAppPage from './pages/DashboardAppPage';
import FinalApprovalPage from './pages/FinalApprovalPage';
import AttachmentsPage from './pages/AttachmentsPage';
// import DepartmentFollowup from './pages/DepartmentFollowup';
import UserManagment from './pages/Users/UserManagment';
import UserManagmentAddEdit from './pages/Users/UserManagmentAddEdit';
import Settings from './pages/Setting/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ApprovalsPage from './pages/ApprovalsPage';
import SecurityPage from './pages/SecurityPage';
import ReportDynamic from './pages/reportDynamic';
import Migrate from './pages/Migrate_To_Ishtar';
import TrackingPage from './pages/track';
import ReportPageRejected from './pages/rejectedRequests';

// ----------------------------------------------------------------------

export default function Router({ user_roles }) {
  // user role
  const RolePage = useCallback(
    ({ element, page_role }) => {
      if (user_roles?.user_type) {
        try {
          if (user_roles?.user_type == 'approver') {
            return element;
          }

          let rolesPages = user_roles?.pages;
          if (rolesPages[page_role] == 1) {
            return element;
          }
          return <Navigate to={process.env.PUBLIC_URL + '/dashboard/app'} />;
        } catch (error) {
          return <Navigate to={process.env.PUBLIC_URL + '/dashboard/app'} />;
        }
      }
    },
    [user_roles]
  );

  const routes = useRoutes([
    {
      path: process.env.PUBLIC_URL + '/dashboard',
      element: <PrivateRoute element={<DashboardLayout />} />,
      children: [
        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/app'} />, index: true },
        // main dashboard **************************************************
        { path: 'app', element: <DashboardAppPage /> },
        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/Orderadd'} />, index: true },
        // main order **************************************************
        { path: 'FinalApprovalPage', element: <FinalApprovalPage /> },
        // { path: 'DepartmentFollowup', element: <DepartmentFollowup /> },

        { path: 'profile', element: <Profile /> },
        { path: 'ChangePassword', element: <ChangePassword /> },
        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/FinalApprovalPage'} />, index: true },
        { path: 'FinalApprovalPage', element: <FinalApprovalPage /> },
        { path: 'attachments/:id', element: <AttachmentsPage /> },

        // { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/DepartmentFollowup'} />, index: true },
        // { path: 'DepartmentFollowup', element: <DepartmentFollowup /> },

        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/ApprovalsPage'} />, index: true },
        { path: 'ApprovalsPage', element: <ApprovalsPage /> },


        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/SecurityPage'} />, index: true },
        { path: 'SecurityPage', element: <SecurityPage /> },

        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/ReportDynamic'} />, index: true },
        { path: 'ReportDynamic', element: <ReportDynamic /> },

        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/TrackingPage'} />, index: true },
        { path: 'TrackingPage', element: <TrackingPage /> },       

        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/ReportPageRejected'} />, index: true },
        { path: 'ReportPageRejected', element: <ReportPageRejected /> },
        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/Migrate'} />, index: true },
        { path: 'Migrate', element: <Migrate /> },

      ],
    },
    {
      path: process.env.PUBLIC_URL + '/approver',
      element: <PrivateRoute element={<IdentityLayout />} />,
      children: [
        { element: <Navigate to="/approver" />, index: true },
        { path: 'AddEditUser', element: <UserManagmentAddEdit /> },
        { path: 'UserManagment', element: <UserManagment /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
    {
      path: process.env.PUBLIC_URL + '/reviewer',
      element: <PrivateRoute element={<ViewLayout />} />,
      children: [
        { element: <Navigate to="/reviewer" />, index: true },
        { path: 'ReportPageRejected', element: <ReportPageRejected /> },
        // { path: 'ApproximateSearch', element: <ApproximateSearch /> },
        // { path: 'settings', element: <Settings /> },
      ],
    },
    // الصلاحيات الاقامة
    {
      path: process.env.PUBLIC_URL + '/iqama',
      element: <PrivateRoute element={<IqamaLayouts />} />,
      children: [
        { element: <Navigate to="/iqama" />, index: true },
        { path: 'ReportPageRejected', element: <ReportPageRejected /> },
      ],
    },
    // الصلاحيات المخابرات
    {
      path: process.env.PUBLIC_URL + '/mokhabarat',
      element: <PrivateRoute element={<MokLayouts />} />,
      children: [
        { element: <Navigate to="/mokhabarat" />, index: true },
        { path: 'ReportPageRejected', element: <ReportPageRejected /> },
        // { path: 'ApproximateSearch', element: <ApproximateSearch /> },
        // { path: 'settings', element: <Settings /> },
      ],
    },
    {
      path: process.env.PUBLIC_URL + '/approver',
      element: <PrivateRoute element={<UserLayout />} />,
      children: [
        { element: <Navigate to="/approver" />, index: true },
        { path: 'FinalApprovalPage', element: <FinalApprovalPage /> },

        { element: <Navigate to="/approver" />, index: true },
        // { path: 'DepartmentFollowup', element: <DepartmentFollowup /> },
        // { path: 'ReportPageRejected', element: <ReportPageRejected /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
    {
      path: process.env.PUBLIC_URL + '/login',
      element: <LoginPage />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/app'} />, index: true },
        { path: process.env.PUBLIC_URL + '/404', element: <Page404 /> },
        { path: process.env.PUBLIC_URL + '/', element: <Navigate to={process.env.PUBLIC_URL + '/dashboard/app'} /> },
        // { path: process.env.PUBLIC_URL + '*', element: <Navigate to={process.env.PUBLIC_URL +"/404"} /> },
      ],
    },
    {
      path: process.env.PUBLIC_URL + '*',
      element: <Navigate to={process.env.PUBLIC_URL + '/404'} replace />,
    },
  ]);

  return routes;
}
