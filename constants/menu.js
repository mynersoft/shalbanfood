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
		label: 'Tracking order',
		link: '/user/tracking-order',
		icon: <Car />,
	},
	
	{
		label: 'Profile',
		link: '/user/profile',
		icon: <User />,
	},
];
