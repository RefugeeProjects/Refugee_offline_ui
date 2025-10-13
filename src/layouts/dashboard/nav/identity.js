// component
import SvgColor from '../../../components/svg-color';
// ----------------------------------------------------------------------
// keys:0 dashborad, 1 identity, 2 approvals, 3 minister
const icon = (name) => (
  <SvgColor src={process.env.PUBLIC_URL + `/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'الطلبات الحالية',
    path: '/identity/Requestoffline',
    icon: icon('ic_analytics'),
  },
  {
    title: 'متابعة سير الطلبات',
    path: '/identity/Trackingpage',
    icon: icon('ic_analytics'),
  },
  {
    title: 'طباعة الهويات',
    path: '/identity/PrinterMachin',
    icon: icon('ic_analytics'),
  },
  {
    title: 'تقارير الطباعة',
    path: '/identity/Print',
    icon: icon('ic_analytics'),
  },
  {
    title: 'الحسابات',
    path: '/identity/Financial_accounts',
    icon: icon('ic_analytics'),
  },
  {
    title: 'الجودة',
    path: '/identity/Quality',
    icon: icon('ic_analytics'),
  },
  {
    title: 'التسليم',
    path: '/identity/Delivery',
    icon: icon('ic_analytics'),
  },
  {
    title: 'التقارير',
    path: '/identity/Report',
    icon: icon('ic_analytics'),
  },
  {
    title: 'بحث تقريبي',
    path: '/identity/ApproximateSearch',
    icon: icon('ic_analytics'),
  },
];

export default navConfig;
