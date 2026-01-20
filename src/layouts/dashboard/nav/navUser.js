// المدخل بيانات صلاحيات
import { Stars, MenuOpen } from '@mui/icons-material';
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
  // {
  //   title: 'الترددات',
  //   path: process.env.PUBLIC_URL + '/dashboard/ApprovalsPage',
  //   icon: <MenuOpen />,
  //   page_role: { public: 1 },
  // },
  {
    title: 'طلبات اللجوء',
    path: process.env.PUBLIC_URL + '/dashboard/ApprovalsPage',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'موافقة اللجنة ',
    path: process.env.PUBLIC_URL + '/dashboard/FinalApprovalPage',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'الطلبات المرفوضة ',
    path: process.env.PUBLIC_URL + '/dashboard/ReportPageRejected',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'تقارير ',
    path: process.env.PUBLIC_URL + '/dashboard/ReportDynamic',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  {
    title: 'تتبع الطلب ',
    path: process.env.PUBLIC_URL + '/dashboard/TrackingPage',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
    {
    title: 'ترحيل إلى عشتار ',
    path: process.env.PUBLIC_URL + '/dashboard/Migrate',
    icon: <MenuOpen />,
    page_role: { public: 1 },
  },
  // {
  //   title: 'ادخال   ',
  //   path: process.env.PUBLIC_URL + '/dashboard/DepartmentFollowup',
  //   icon: <MenuOpen />,
  //   page_role: { public: 1 },
  // },
  //  {
  //   title: 'ترحيل إلى عشتار ',
  //   path: process.env.PUBLIC_URL + '/dashboard/Migrate',
  //   icon: <MenuOpen />,
  //   // page_role: { public: 1 },
  // },
];

export default navView;
