//صفحة تسجيل الدخول
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Cookies from 'js-cookie';

import ChangePassword from './ChangePassword';
// @mui
import '../MuiClassNameSetup';
import { Container, Typography, Divider, Box, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
// hooks
import useResponsive from '../hooks/useResponsive';
// utils
import { useApi, decodeJWT } from '../utils';
// context
import { appContext } from '../context';
// import titles
import { titles } from '../utils/title';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
import FirstEnterLogin from './FirstEnterLogin';
import { verifyJWEToken } from '../auth/jwt';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function LoginPage() {
  //  define api
  const api = useApi();
  // context data
  const { setToken, isLogin, setAppInfo, appInfo } = useContext(appContext);
  const [open, setOpen] = useState(null);
  // modal open state
  const [openModal, setOpenModal] = useState(false);

  // handle modal
  const toogleModal = () => {
    setOpenModal(!openModal);
    setOpen(null);
  };
  //  modal props
  const [modalProps, setModalProps] = useState(null);

  const mdUp = useResponsive('up', 'md');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  // body
  const [userBody, setUserBody] = useState({
    username: '',
    password: '',
  });
  // login
  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await api('POST', `login`, userBody);
      if (!response.success) {
        DangerMsg('اشعارات الدخول', 'خطأ في اسم المستخدم او كلمة المرور');
        return;
      }

      const data = await response.data;
      var expDate = new Date();
      expDate.setDate(expDate.getDate() + 1); // 24 hours

      const jwe = await verifyJWEToken(response.data);
      if (jwe.verify === true) {
        Cookies.set('isAuthenticated', true, { path: '/', expires: expDate });
        Cookies.set('token', data, { path: '/', expires: expDate });
        setToken(response.data);
        setAppInfo({ ...appInfo, isLogin: true });
        navigate('/dashboard', { replace: true });
        NotificationMsg('اشعارات الدخول', 'تم تسجيل الدخول بنجاح');
        return;
      }
      DangerMsg('اشعارات الدخول', 'حدث هنالك خطأ لايمكن الدخول');
    } catch (err) {
      console.log('Fetch error:', err);
      DangerMsg('اشعارات الدخول', 'خطأ في تسجيل الدخول');
    }
  };

  // const handleClick = () => {
  //   navigate('/dashboard', { replace: true });
  // };

  return (
    <>
      <Helmet>
        <title> تسجيل الدخول | {titles.mainTitle} </title>
      </Helmet>

      <StyledRoot>
        {mdUp && (
          <StyledSection>
            <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5, textAlign: 'center' }}>
              {titles.mainTitle}
            </Typography>
            <Logo
              sx={{
                top: { xs: 16, sm: 24, md: 40 },
                left: { xs: 16, sm: 24, md: 40 },
                height: 'auto',
              }}
            />
          </StyledSection>
        )}

        <Container maxWidth="sm">
          <StyledContent>
            {!mdUp && (
              <Stack sx={{ mt: '-45px', mb: '25px' }}>
                <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>
                  {titles.mainTitle}
                </Typography>
                <Box sx={{ display: 'inline-flex', justifyContent: 'center' }}>
                  <Logo
                    sx={{
                      // top: { xs: 16, sm: 24, md: 40 },
                      // left: { xs: 16, sm: 24, md: 40 },
                      height: '180px',
                      width: '180px',
                    }}
                  />
                </Box>
              </Stack>
            )}
            <Typography variant="h4" gutterBottom>
              تسجيل الدخول
            </Typography>

            <Divider sx={{ mt: 3, mb: 5 }}>
              {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                OR
              </Typography> */}
            </Divider>

            {/* login */}
            <form
              onSubmit={(e) => {
                login(e);
              }}
            >
              <Stack spacing={3}>
                <TextField
                  name="username"
                  label="اسم المستخدم"
                  onChange={(e) => {
                    setUserBody({ ...userBody, username: e.target.value || null });
                  }}
                  error={userBody.username === null}
                  helperText={userBody.username === null ? '* اسم المستخدم مطلوب' : ''}
                />

                <TextField
                  name="password"
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => {
                    setUserBody({ ...userBody, password: e.target.value || null });
                  }}
                  error={userBody.password === null}
                  helperText={userBody.password === null ? '* كلمة المرور مطلوبة' : ''}
                />
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 5 }}>
                {/* <Checkbox name="remember" label="Remember me" /> */}
                {/* <Link variant="subtitle2" underline="hover">
                Forgot password?
              </Link> */}
              </Stack>

              <LoadingButton
                // loading={}
                disabled={!(userBody.username && userBody.password)}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                onClick={(e) => {
                  login(e);
                }}
              >
                تسجيل الدخول
              </LoadingButton>
            </form>
            {/* <LoginForm /> */}
          </StyledContent>
          {/* <FirstEnterLogin
            modalProps={modalProps} openModal={openModal} toogleModal={toogleModal}
          /> */}
          {/* <ChangePassword modalProps={modalProps} openModal={openModal} toogleModal={toogleModal} /> */}
          <FirstEnterLogin modalProps={modalProps} openModal={openModal} toogleModal={toogleModal} />
        </Container>
      </StyledRoot>
    </>
  );
}
