'use client';

import { useSelector } from 'react-redux';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SafeLink from './SafeLink';
import { iconMap } from '@/utils/iconMap';

const HeaderNavigation = () => {
  const categories = useSelector((state) => state.category.categories);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  const categoryDropdownItems = (categories || [])
    .filter((cat) => cat?.slug)
    .map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      icon: cat.icon,
      subCategories: (cat.subCategories || [])
        .filter((sub) => sub.level === 1 && sub.path)
        .map((sub) => ({
          name: sub.name,
          href: `/${sub.path}`,
        })),
    }));

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    {
      name: 'Categories',
      href: '/categories',
      hasDropdown: true,
      dropdownItems: categoryDropdownItems,
    },
    { name: 'Combo offer', href: '/combo-offer' },
    { name: 'Deals', href: '/deals', badge: 'Hot' },
    { name: 'Brands', href: '/brands' },
  ];

  return (
    <div className="flex items-center gap-2">
      {navigationLinks.map((link) => (
        <div
          key={link.name}
          className="relative"
          onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
          onMouseLeave={() => {
            setActiveDropdown(null);
            setActiveSub(null);
          }}
        >
          {/* MAIN LINK */}
          <SafeLink
            href={link.href}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            {link.name}

            {link.badge && (
              <span className="ml-1 px-2 py-1 text-xs rounded-full bg-red-500 text-white font-semibold">
                {link.badge}
              </span>
            )}

            {link.hasDropdown && (
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  activeDropdown === link.name ? 'rotate-180' : ''
                }`}
              />
            )}
          </SafeLink>

          {/* DROPDOWN */}
          {link.hasDropdown && link.dropdownItems?.length > 0 && (
            <div
              className={`absolute left-0 top-9 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 min-w-[260px] z-40 transition-all ${
                activeDropdown === link.name
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible translate-y-2'
              }`}
            >
              {link.dropdownItems.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => setActiveSub(item.name)}
                >
                  {/* CATEGORY */}
                  <SafeLink
                    href={item.href}
                    className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 font-medium text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {/* check if it's a lucide icon component or emoji string */}
                      {item.icon && typeof item.icon === 'string' ? (
                        <span className="text-lg">{item.icon}</span> // emoji
                      ) : (
                        <item.icon size={14} className="text-gray-700" /> // Lucide icon
                      )}

                      <span>{item.name}</span>
                    </div>

                    {item.subCategories?.length > 0 && (
                      <ChevronDown size={14} className="-rotate-90" />
                    )}
                  </SafeLink>

                  {/* SUB CATEGORY */}
                  {item.subCategories?.length > 0 && (
                    <div
                      className={`absolute top-0 left-full bg-white border border-gray-200 shadow-xl rounded-xl min-w-[220px] transition-all ${
                        activeSub === item.name
                          ? 'opacity-100 visible'
                          : 'opacity-0 invisible'
                      }`}
                    >
                      {item.subCategories.map((sub) => (
                        <SafeLink
                          key={sub.name}
                          href={`category${sub.href}`}
                          className="block px-4 py-3 hover:bg-gray-50 text-gray-700"
                        >
                          {sub.name}
                        </SafeLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HeaderNavigation;
