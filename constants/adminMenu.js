import {
  BarChart,
  CreditCard,
  FileText,
  Home,
  Layers,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  Tag,
  Building,
  Truck,
} from 'lucide-react';

export const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Combos',
    href: '/admin/combos',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    name: 'Brand',
    href: '/admin/brands',
    icon: <Building className="w-5 h-5" />,
  },
  {
    name: 'Category',
    href: '/admin/categories',
    icon: <Building className="w-5 h-5" />,
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: 'Vouchers',
    href: '/admin/vouchers',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: 'Shipping',
    href: '/admin/shipping',
    icon: <Truck className="w-5 h-5" />,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: <BarChart className="w-5 h-5" />,
  },
  {
    name: 'Live Orders',
    href: '/admin/live-orders',
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];
