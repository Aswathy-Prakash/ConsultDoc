// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  // {
  //   title: 'Patient Details',
  //   path: '/admin/dashboard/app', 
  //   icon: icon('ic_user'),
  // },
  {
    title: 'Patient Details',
    path: '/admin/dashboard/candidates',
    icon: icon('ic_user'),
  }
  // {
  //   title: 'register user',
  //   path: '/admin/dashboard/user',
  //   icon: icon('ic_user'),
  // },
  // {
  //   title: 'election phase',
  //   path: '/admin/dashboard/phase',
  //   icon: icon('ic_blog'),
  // },
  
//  {
 //   title: 'login',
 //   path: '/login',
//    icon: icon('ic_lock'),
//  },
 // {
 //   title: 'Not found',
 //   path: '/404',
 //   icon: icon('ic_disabled'),
 // },
];
 
export default navConfig;
