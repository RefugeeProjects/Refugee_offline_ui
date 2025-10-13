//صفحة اعادة تغيير الباسوورد يتم اعادة توجيها لاول مرة
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Typography, Box, Stack, IconButton, InputAdornment, TextField, Modal, Card, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';

// cookies
import Cookies from 'js-cookie';
// components
import Iconify from '../components/iconify';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
// utils
import { useApiToken } from '../utils';
// context
import { appContext } from '../context';
// import titles
import { titles } from '../utils/title';

// ----------------------------------------------------------------------

export default function FirstEnterPage({ modalProps, openModal, toogleModal }) {
  //  style of modal
  const style = {
    // position: 'absolute',
    // top: '50%',
    // left: '50%',
    // transform: 'translate(-50%, -50%)',
    // width: '650px',
    bgcolor: 'background.paper',
    border: '0',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
  };

  //  define api
  const api = useApiToken();
  // context data
  const { setToken, isLogin } = useContext(appContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  // body
  const [userBody, setUserBody] = useState({
    newPassword: '',
    matchPassword: '',
  });

  // open modal event
  const onOpenModal = () => {
    setUserBody({
      newPassword: '',
      matchPassword: '',
    });
  };

  // close modal event
  const onCloseModal = () => {
    setUserBody({
      newPassword: '',
      matchPassword: '',
    });
    toogleModal();
  };
  // changePwd
  const changePwd = async (e) => {
    e.preventDefault();
    try {
      if (userBody.newPassword !== userBody.matchPassword) {
        DangerMsg('اشعارات كلمة المرور', 'اعادة كلمة المرور غير مطابقة');
        return;
      }

      if (userBody.newPassword === '12345678') {
        DangerMsg('اشعارات كلمة المرور', 'يجب ادخال كلمة مرور جديدة');
        return;
      }
      delete userBody.matchPassword;
      const { success, data, err } = await api('PUT', `users/reset-password`, modalProps.data, userBody);
      if (!success) {
        if (err?.errPwd == true) {
          DangerMsg('اشعارات كلمة المرور', err?.errMsg);
          return;
        }

        DangerMsg('اشعارات كلمة المرور', 'خطأ في تغيير كلمة المرور');
        return;
      }
      toogleModal();
      NotificationMsg('اشعارات الدخول', 'تم تغيير كلمة المرور بنجاح');
    } catch (err) {
      DangerMsg('اشعارات الدخول', 'خطأ في تسجيل الدخول');
      console.error(err);
    }
  };

  // use effect on open modal to call data
  useEffect(() => {
    if (openModal === true) {
      onOpenModal();
    }
  }, [openModal, modalProps]);

  // const handleClick = () => {
  //   navigate('/dashboard', { replace: true });
  // };

  return (
    <>
      <Card sx={{ padding: '5px' }}>
        <Modal
          open={openModal}
          onClose={onCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Grid container>
            <Grid
              item
              xs={12}
              sm={8}
              lg={6}
              xl={4}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '95%',
              }}
            >
              <Box sx={style}>
                <IconButton
                  aria-label="close"
                  color="default"
                  sx={{ position: 'fixed', left: '10px', top: '10px' }}
                  onClick={() => {
                    onCloseModal();
                  }}
                >
                  <Close />
                </IconButton>
                <Typography id="modal-modal-title" variant="h4" component="h2" mb={5}>
                  يجب تغيير كلمة المرور عند الدخول لاول مرة
                </Typography>
                <Grid container columnSpacing={2} rowSpacing={2} sx={{ mb: 2 }}>
                  {/* name */}
                  <Grid item xs={12}>
                    <form
                      onSubmit={(e) => {
                        changePwd(e);
                      }}
                    >
                      <Stack spacing={3}>
                        <TextField
                          name="password"
                          label="كلمة المرور"
                          type={showPassword ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                  <Iconify icon={showPassword ? Visibility : VisibilityOff} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            setUserBody({ ...userBody, newPassword: e.target.value || null });
                          }}
                          error={userBody.newPassword === null}
                          helperText={userBody.newPassword === null ? '* كلمة المرور مطلوبة' : ''}
                        />

                        <TextField
                          name="password"
                          label="اعادة كلمة المرور"
                          type={showPassword2 ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                                  <Iconify icon={showPassword2 ? Visibility : VisibilityOff} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            setUserBody({ ...userBody, matchPassword: e.target.value || null });
                          }}
                          error={userBody.matchPassword === null}
                          helperText={userBody.matchPassword === null ? '* اعادة كلمة المرور مطلوبة' : ''}
                        />
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 3 }} />

                      <LoadingButton
                        // loading={}
                        disabled={!(userBody.newPassword && userBody.matchPassword)}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                        onClick={(e) => {
                          changePwd(e);
                        }}
                      >
                        تغيير كلمة المرور
                      </LoadingButton>
                    </form>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Modal>
      </Card>
    </>
  );
}
