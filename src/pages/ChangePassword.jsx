//صفحة تغيير الباسوورد
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Typography, Box, Stack, IconButton, InputAdornment, TextField, Modal, Card, Grid } from '@mui/material';
//import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Close } from '@mui/icons-material';
// components
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Iconify from '../components/iconify';
import { NotificationMsg, DangerMsg } from '../components/NotificationMsg';
// utils
import { useApi } from '../utils';
// context
import { appContext } from '../context';
// import titles
//import { titles } from '../utils/title';
// ----------------------------------------------------------------------

export default function ChangePassword({ modalProps, openModal, toogleModal }) {
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
  const api = useApi();
  // context data
  const { user } = useContext(appContext);
  const user_id = user?.id;

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  // body
  const [userBody, setUserBody] = useState({
    password: '',
    newPassowrd: '',
    confirmPassword: '',
  });

  // open modal event
  const onOpenModal = () => {
    setUserBody({
      password: '',
      newPassowrd: '',
      confirmPassword: '',
    });
  };

  // close modal event
  const onCloseModal = () => {
    setUserBody({
      password: '',
      newPassowrd: '',
      confirmPassword: '',
    });
    toogleModal();
  };
  // changePwd

  const changePwd = async (e) => {
    e.preventDefault();
    try {
      if (!(userBody.confirmPassword === userBody.newPassowrd))
        return DangerMsg('اشعارات كلمة المرور', 'اعادة كلمة المرور غير مطابقة');

      if (userBody.password === userBody.newPassowrd)
        return DangerMsg('اشعارات كلمة المرور', 'يجب ادخال كلمة مرور جديدة');

      // delete userBody.newPassowrd;
      delete userBody.confirmPassword;

      const { success, err } = await api('PUT', `users/id/${user_id}/change-password`, userBody);
      if (!success) {
        if (err?.errPwd) {
          DangerMsg('اشعارات كلمة المرور', err.errMsg);
          return;
        }
        DangerMsg('اشعارات كلمة المرور', 'خطأ في تغيير كلمة المرور');
        return;
      }
      // console.log("modalProps",modalProps);
      // console.log("data",data);
      // localStorage.setItem("token", modalProps.data)
      // setToken(modalProps.data)
      navigate(process.env.PUBLIC_URL + '/dashboard', { replace: true });
      toogleModal();
      NotificationMsg('اشعارات الدخول', 'تم تسجيل الدخول بنجاح');
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
                  تغيير كلمة المرور
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
                          label=" كلمة المرور الحالية"
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
                            setUserBody({ ...userBody, password: e.target.value || null });
                          }}
                          error={userBody.password === null}
                          helperText={userBody.password === null ? '* كلمة المرور مطلوبة' : ''}
                        />
                        <TextField
                          name="newpassword"
                          label="كلمة المرور الجديدة"
                          type={showPassword1 ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword1(!showPassword1)} edge="end">
                                  <Iconify icon={showPassword1 ? Visibility : VisibilityOff} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) => {
                            setUserBody({ ...userBody, newPassowrd: e.target.value || null });
                          }}
                          error={userBody.newPassowrd === null}
                          helperText={userBody.newPassowrd === null ? '* كلمة المرور مطلوبة' : ''}
                        />

                        <TextField
                          name="confirmpassword"
                          label="تأكيد كلمة المرور"
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
                            setUserBody({ ...userBody, confirmPassword: e.target.value || null });
                          }}
                          error={userBody.confirmPassword === null}
                          helperText={userBody.confirmPassword === null ? '* اعادة كلمة المرور مطلوبة' : ''}
                        />
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 3 }} />

                      <LoadingButton
                        // loading={}
                        disabled={!(userBody.password && userBody.newPassowrd)}
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
