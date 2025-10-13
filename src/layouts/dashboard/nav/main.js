import { Stars, MenuOpen } from '@mui/icons-material';
// component
import SvgColor from '../../../components/svg-color';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ----------------------------------------------------------------------
// keys:0 dashborad, 1 identity, 2 approvals, 3 minister
const icon = (name) => (
  <SvgColor src={process.env.PUBLIC_URL + `/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'الرئيسية',
    path: process.env.PUBLIC_URL + '/dashboard/app',
    icon: <MenuOpen />,
    // page_role: { public: 1 },
  },
  {
    title: 'طلبات اللجوء',
    path: process.env.PUBLIC_URL + '/dashboard/FreqsHome',
    icon: <MenuOpen />,
    // page_role: { public: 1 },
  },

  // {
  //   title: 'ادخال بيانات ',
  //   path: process.env.PUBLIC_URL + '/dashboard/DataEntry',
  //   icon: <MenuOpen />,
  //   page_role: { public: 1 },
  // },
  {
    title: 'موافقة اللجنة',
    path: process.env.PUBLIC_URL + '/dashboard/EntryPage',
    icon: <MenuOpen />,
    // page_role: { public: 1 },
  },
  {
    title: 'الطلبات المرفوضة ',
    path: process.env.PUBLIC_URL + '/dashboard/reportPage',
    icon: <MenuOpen />,
    // page_role: { public: 1 },
  },
  {
    title: 'تقرير ',
    path: process.env.PUBLIC_URL + '/dashboard/DepsFollow',
    icon: <MenuOpen />,
    // page_role: { public: 1 },
  },
  // {
  //   title: 'ادخال',
  //   path: process.env.PUBLIC_URL + '/dashboard/DepartmentFollowup',
  //   icon: <MenuOpen />,
  //   // page_role: { public: 1 },
  // },
  // {
  //   title: 'تقرير الاقسام   ',
  //   path: process.env.PUBLIC_URL + '/dashboard/Reports',
  //   icon: <MenuOpen />,
  //   // page_role: { public: 1 },
  // },
  // {
  //   title: 'البحث التقريبي',
  //   path: process.env.PUBLIC_URL + '/dashboard/ApproximateSearch',
  //   icon: <MenuOpen />,
  //   // page_role: { public: 1 },
  // },
  // {
  //   title: '  التقاريير ',
  //   path: process.env.PUBLIC_URL + '/dashboard/ReportPage',
  //   icon: <MenuOpen />,
  //   page_role: { public: 1 }
  // },
  // {
  //   title: '  الاحصائيات ',
  //   path: process.env.PUBLIC_URL + '/dashboard/StatisticsPage',
  //   icon: <MenuOpen />,
  //   page_role: { public: 1 },
  // },
];

export default navConfig;
