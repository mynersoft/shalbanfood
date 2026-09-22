import {
  Car,
  Heart,
  LayoutDashboard,
  ParkingSquareIcon,
  Settings,
  User,
} from 'lucide-react';

export const userSidebarMenu = [
  {
    label: 'Dashboard',
    link: '/user',
    icon: <LayoutDashboard />,
  },

  {
    label: 'Order',
    link: '/user/orders',
    icon: <ParkingSquareIcon />,
  },
  {
    label: 'Tracking order',
    link: '/user/tracking-order',
    icon: <Car />,
  },
  {
    label: 'Wishlist',
    link: '/user/wishlist',
    icon: <Heart />,
  },
  {
    label: 'Profile',
    link: '/user/profile',
    icon: <User />,
  },
 
  {
    label: 'Settings',
    link: '/user/settings',
    icon: <Settings />,
  },
];
