import { useContext, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
//
import Header from './header';
import Nav from './nav';
import { appContext } from '../../context';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

export default function IdentityLayout() {
  const [open, setOpen] = useState(true);
  const { user } = useContext(appContext);
  return (
    <StyledRoot>
      <Header openNav={open} onOpenNav={() => setOpen(true)} toogleNav={() => setOpen(!open)} />
      <Nav openNav={open} onCloseNav={() => setOpen(false)} />
      <Main>
        {user?.roles === 'data_entry' || user?.roles === 'approver' ? (
          <Outlet />
        ) : (
          <Navigate to={process.env.PUBLIC_URL + '/dashboard'} replace />
        )}
      </Main>
    </StyledRoot>
  );
}
