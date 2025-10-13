import PropTypes from 'prop-types';
import { useContext } from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText } from '@mui/material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';
//
import { appContext } from '../../context/appContext';
// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  const { user } = useContext(appContext);
  const verifyRole = (item) => {
    try {
      if (user?.roles == 'data_entry') {
        return true;
      }
      if (item?.page_role?.public == 1) {
        return true;
      }
      let page = Object.keys(item.page_role)[0];
      let rolesPages = user?.roles;
      if (rolesPages[page] == 1) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return (
    <Box {...other}>
      <List style={{ maxHeight: '550px', overflow: 'auto' }} disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <>{verifyRole(item) == true && <NavItem key={item.title} item={item} />}</>
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
          textAlign: 'right',
        },
        textAlign: 'right',
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText
        disableTypography
        primary={title}
        // sx={{
        //     textAlign:'right'
        // }}
      />

      {info && info}
    </StyledNavItem>
  );
}
