import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navMain from './main';
// import navSysAdmin from './sys_admin';
import navView1 from './navView';
import navUser from './navUser';
import navIqama from './navIqama';
// import navSuper from './super';
// import navEntry from './entry';
import { titles } from '../../../utils/title';
import { appContext } from '../../../context';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};
const allowedRoles = ['iqama', 'mokhabarat', 'amn_watani', 'istikhbarat_defense'];

export default function Nav({ openNav, onCloseNav }) {
  const { user } = useContext(appContext);
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');
  const editNav = () => {};

  // handle modal
  const toogleModal = () => {
    setOpenNavSide(!openNavSide);
  };

  const [openNavSide, setOpenNavSide] = useState(true);

  useEffect(() => {
    if (openNav && !isDesktop) {
      onCloseNav();
    }
  }, [pathname]);

  useEffect(() => {
    user && editNav();
  }, [user, editNav]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex', justifyContent: 'center' }}>
        <Logo
          sx={{
            height: '120px',
            width: '120px',
          }}
        />
      </Box>

      <Box sx={{ mb: 1, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            {/* <Avatar src={account.photoURL} alt="photoURL" /> */}

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {titles.mainTitle}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: 'text.primary', mt: 1 }}>
                {user?.name}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navMain} />

      {user?.roles == 'reviewer' && <NavSection data={navView1} />}
      {user?.roles == 'approver' && <NavSection data={navUser} />}
      {allowedRoles.includes(user?.roles) && <NavSection data={navIqama} />}

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
        // display:'none'
        display: openNav ? 'block' : 'none',
      }}
    >
      {isDesktop ? (
        <>
          <Drawer
            open={openNav}
            onClose={toogleModal}
            // open
            variant="permanent"
            PaperProps={{
              sx: {
                width: NAV_WIDTH,
                bgcolor: 'background.default',
                // borderRightStyle: 'dashed',
                borderLeftStyle: 'dashed',
                borderLeft: '1px solid rgba(145, 158, 171, 0.24)',
                // transform: openNav ? 'none' : 'translateX(1089px) !important',
                // display:openNav ? 'contents':'none',
                right: '0 !important',
              },
            }}
          >
            {renderContent}
          </Drawer>
        </>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              transform: openNav ? 'none' : 'translateX(1089px) !important',
              right: '0 !important',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
