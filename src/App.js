import React, { useState, useCallback, useEffect } from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { BrowserRouter, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { StyledEngineProvider } from '@mui/material/styles';
import './App.css';
import Cookies from 'js-cookie';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// context
import { appContext, initState } from './context';
// components
import { decodeJWT } from './utils';
import Loader from './components/Loader';
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';
import SystemWatermark from './components/SystemWatermark';
import 'react-notifications-component/dist/theme.css';
// ----------------------------------------------------------------------

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appInfo, setAppInfo] = useState(initState);
  const [load, setLoading] = useState(false);
  // check JSON string
  // const isJsonStringRoles = (str) => {
  //   try {
  //     return JSON.parse(str);
  //   } catch (e) {
  //     return {
  //       user_type: '',
  //       pages: {
  //         DashboardAppPage: 1,
  //         freqsHome: 0,
  //         FinalApprovalPage: 0,
  //         reportPage: 0,
  //         reports: 0,
  //       },
  //     };
  //   }
  //   // return true;
  // };

  const setToken = useCallback(
    async (token) => {
      try {
        const payload = await decodeJWT(token);
        // payload.roles = isJsonStringRoles(payload.roles);
        if (!payload) {
          // localStorage.removeItem("token")
          Cookies.remove('isAuthenticated');
          Cookies.remove('token');
          setAppInfo({ ...appInfo, isLogin: false });
          // navigate(process.env.PUBLIC_URL + '/login')
          return;
        }

        setAppInfo({ ...appInfo, token, user: { ...payload }, isLogin: true });
      } catch (err) {
        console.log(err);
        Cookies.remove('isAuthenticated');
        Cookies.remove('token');
        setAppInfo({ ...appInfo, isLogin: false });
        // localStorage.removeItem("token")
        // navigate(process.env.PUBLIC_URL + '/login', { replace: true });
        return;
      }
    },
    [navigate, appInfo]
  );

  useEffect(() => {
    // console.log("cookies",Cookies.get('token') + ", " +Cookies.get('isAuthenticated'));
    // if (!Cookies.get('token') || !Cookies.get('isAuthenticated')) {
    //   setAppInfo({ ...appInfo, isLogin: false })
    //   return navigate(process.env.PUBLIC_URL + '/login', { replace: true })
    // }

    if (!appInfo.isLogin) {
      setToken(Cookies.get('token'));
      setAppInfo({ ...appInfo, isLogin: true });
      return;
    }
  }, [navigate, setToken, appInfo]);

  return (
    <>
      {/* <BrowserRouter> */}
      <ReactNotifications />
      <HelmetProvider>
        <Loader loading={load} />
        {/* <StyledEngineProvider injectFirst> */}
        <ThemeProvider>
          <appContext.Provider value={{ ...appInfo, setAppInfo, load, setLoading, setToken }}>
            <ScrollToTop />
            <StyledChart />
            <SystemWatermark />
            <Router user_roles={appInfo?.user?.roles} />
          </appContext.Provider>
        </ThemeProvider>
        {/* </StyledEngineProvider> */}
      </HelmetProvider>
      {/* </BrowserRouter> */}
    </>
  );
}
