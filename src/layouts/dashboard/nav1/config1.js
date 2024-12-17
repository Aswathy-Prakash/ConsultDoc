// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig1 = [
  {
    title: 'Prescriptions',
    path: '/user/dashboard/app',
    icon: icon('ic_user'),
    
  },
  // {
  //   title: 'Verify Mobile',
  //   path: '/user/dashboard/verify',
  //   icon: icon('ic_blog'), 
  // },
  {
    title: 'chat with doctor',
    path: '/user/dashboard/vote',
    icon: icon('ic_user'),
   // disabled: true,
  }
  // {
  //   title: 'Result',
  //   path: '/user/dashboard/result',
  //   icon: icon('ic_blog'),
  // },
];

// if (userVerifiedMobile) { // Replace "userVerifiedMobile" with your verification status variable
//   navConfig1[2].disabled = false;
// }


export default navConfig1; 



