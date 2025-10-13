import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
import { appContext, initState } from '../../../context'
import ChangePassword from 'src/pages/ChangePassword';
import Cookies from 'js-cookie';

// mocks_
import account from '../../../_mock/account';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'الملف الشخصي',
    icon: 'eva:person-fill',
  },
  {
    label: 'تغيير كلمة المرور',
    icon: 'eva:home-fill',
  },
  // {
  //   label: 'Settings',
  //   icon: 'eva:settings-2-fill',
  // },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [appInfo, setAppInfo] = useState(initState)
  const { user } = useContext(appContext)
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  //  modal props
  const [modalProps, setModalProps] = useState(null)

  // modal open state 
  const [openModal, setOpenModal] = useState(false)

  // handle modal
  const toogleModal = () => {
    setOpenModal(!openModal)
    setOpen(null);
  }


  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
    // localStorage.removeItem('token')
    Cookies.remove('token')
    Cookies.remove('isAuthenticated')
    setAppInfo({
      ...appInfo, token: '', user: {
        id: '', approval_det_id: '', name: '', username: '', activation: '', user_type: '',
        roles: '', created_at: '', first_enter: '', destination: '', role_type: ''
      }, isLogin: false
    })
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={process.env.PUBLIC_URL + '/assets/images/avatars/user_avatar.png'} alt="photoURL" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {/* {account.displayName} */}
            {user?.name}
          </Typography>
          {/* <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {account.email}
          </Typography> */}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          <MenuItem
            key={0}
            onClick={() => {
              setOpen(null);
              navigate(process.env.PUBLIC_URL +'/dashboard/profile');
            }}
          >
            الملف الشخصي
          </MenuItem>
          <MenuItem
            key={0}
            // onClick={() => {setOpen(null);navigate('/dashboard/ChangePassword');}}
            onClick={(e) => { toogleModal() }}
          >

            تغيير كلمة المرور
          </MenuItem>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem sx={{ m: 1, p: 0 }}>
          <a style={{ width: '100%', padding: '0 15px' }} onClick={handleClose} className='logout-style' href={process.env.PUBLIC_URL + '/login'}>تسجيل خروج</a>
        </MenuItem>
      </Popover>
      <ChangePassword
        modalProps={modalProps} openModal={openModal} toogleModal={toogleModal}
      />
    </>
  );
}
