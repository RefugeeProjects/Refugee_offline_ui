//  صلاحية تقارير فقط
import { Stars, MenuOpen } from '@mui/icons-material';
// component
import SvgColor from '../../../components/svg-color';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ----------------------------------------------------------------------
// keys:0 dashborad, 1 identity, 2 approvals, 3 minister
const icon = (name) => (
  <SvgColor src={process.env.PUBLIC_URL + `/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navView = [
  {
    title: 'الرئيسية',
    path: process.env.PUBLIC_URL + '/dashboard/app',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'طلبات اللجوء',
    path: process.env.PUBLIC_URL + '/dashboard/ApprovalsPage',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'طلبات منجزة ',
    path: process.env.PUBLIC_URL + '/dashboard/SecurityPage',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  
];

export default navView;
