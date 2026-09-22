'use client';

import { useSelector } from 'react-redux';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SafeLink from './SafeLink';

const MobileHeaderNavigation = () => {
  const categories = useSelector((state) => state.category.categories);

  const [openMenu, setOpenMenu] = useState(null); // main menu
  const [openSub, setOpenSub] = useState(null); // sub category

  // 🔥 Dynamic categories
  const categoryDropdownItems = (categories || [])
    .filter((cat) => cat?.slug)
    .map((cat) => ({
      name: cat.name,
      href: `/category/${cat.slug}`,
      subCategories: (cat.subCategories || [])
        .filter((sub) => sub.level === 1 && sub.path)
        .map((sub) => ({
          name: sub.name,
          href: `/category/${sub.path}`,
        })),
    }));

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    {
      name: 'Categories',
      hasDropdown: true,
      dropdownItems: categoryDropdownItems,
    },
    { name: 'Combo offer', href: '/combo-offer' },
    { name: 'Deals', href: '/deals', badge: 'Hot' },
    { name: 'Brands', href: '/brands' },
  ];

  return (
    <div className="w-full">
      <ul className="flex flex-col divide-y divide-gray-200">
        {navigationLinks.map((link) => (
          <li key={link.name} className="py-2">
            {/* MAIN ITEM */}
            <div
              className="flex items-center justify-between px-4 py-3"
              onClick={() =>
                link.hasDropdown
                  ? setOpenMenu(openMenu === link.name ? null : link.name)
                  : null
              }
            >
              <SafeLink href={link.href} className="font-medium text-gray-800">
                {link.name}
                {link.badge && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {link.badge}
                  </span>
                )}
              </SafeLink>

              {link.hasDropdown && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    openMenu === link.name ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>

            {/* CATEGORY DROPDOWN */}
            {link.hasDropdown && openMenu === link.name && (
              <ul className="bg-gray-50">
                {link.dropdownItems.map((item) => (
                  <li key={item.name} className="border-t">
                    <div
                      className="flex items-center justify-between px-6 py-3"
                      onClick={() =>
                        setOpenSub(openSub === item.name ? null : item.name)
                      }
                    >
                      <SafeLink
                        href={item.href}
                        className="text-gray-700 font-medium"
                      >
                        {item.name}
                      </SafeLink>

                      {item.subCategories?.length > 0 && (
                        <ChevronRight
                          size={16}
                          className={`transition-transform ${
                            openSub === item.name ? 'rotate-90' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* SUB CATEGORY */}
                    {item.subCategories?.length > 0 &&
                      openSub === item.name && (
                        <ul className="bg-white">
                          {item.subCategories.map((sub) => (
                            <li key={sub.name}>
                              <SafeLink
                                href={sub.href}
                                className="block px-10 py-3 text-gray-600 hover:bg-gray-100"
                              >
                                {sub.name}
                              </SafeLink>
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileHeaderNavigation;
