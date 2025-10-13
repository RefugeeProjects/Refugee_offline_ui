//صفحة الاعدادات
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// import DisplayCategory from './Category/DisplayCategory';
import View_Device from './devices/view_Device';
import Formation from './formations/formation';
// import Viewexception from './exception/viewexception';
import Viewfreqs from './freqs/viewfreqs';
import Viewdepts from './depts/viewdepts';
import Viewcharacterlocation from './characterlocation/viewcharacterlocation';
import Viewletter from './letter/viewletter';

import { titles } from '../../utils/title';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Helmet>
        <title> الاعدادت | {titles.mainTitle} </title>
      </Helmet>
    </>
  );
};

export default Settings;
