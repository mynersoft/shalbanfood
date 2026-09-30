'use client';

import {
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, setSidebar } from '@/redux/store/slices/uiSlice';
import { userSidebarMenu } from '@/constants/menu';
import { usePathname } from 'next/navigation';


export default function UserSidebar() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { sidebarOpen } = useSelector((state) => state.ui);
  /* 🔹 Auto sidebar behavior based on screen size */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        dispatch(setSidebar(false)); // mobile → closed
      } else {
        dispatch(setSidebar(true)); // desktop → open
      }
    };

    handleResize(); // initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 z-50
          bg-emerald-900 text-white flex flex-col
          transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo + Toggle */}
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <span className="text-xl font-bold tracking-tight text-emerald-400">
              TOMART<span className="text-orange-400">BD</span>
            </span>
          ) : (
            <ShoppingCart className="w-8 h-8 text-emerald-400 mx-auto" />
          )}

          {/* Toggle button */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1 rounded hover:bg-emerald-800"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-6 px-3 space-y-2">
          {userSidebarMenu.map((menu, index) => {
            return (
              <NavItem
                key={index}
                icon={menu.icon}
                label={menu.label}
                link={menu.link}
                active={pathname === menu.link}
                isOpen={sidebarOpen}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}

const NavItem = ({ icon, link, label, active, isOpen }) => (
  <Link
    href={link}
    className={`
      flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition
      ${active ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/60'}
      ${!isOpen ? 'justify-center' : ''}
    `}
  >
    <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
    {isOpen && <span className="font-medium">{label}</span>}
  </Link>
);
