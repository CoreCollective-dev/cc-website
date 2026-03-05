import React, { useState, useEffect, useRef } from 'react';
import LogoImg from '../../assets/CoreCollective_White-Wordmark.png';

type NavLink =
  | { name: string; href: string }
  | { name: string; children: { name: string; href: string }[] };

const navLinks: NavLink[] = [
  { name: 'Working Groups', href: '/working-groups/' },
  {
    name: 'About',
    children: [
      { name: 'About', href: '/about/' },
      { name: 'FAQ', href: '/faq/' },
    ],
  },
  { name: 'Join', href: '/join/' },
  { name: 'Blog & News', href: '/blog/' },
  { name: 'Contact', href: '/contact/' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setCurrentPath(globalThis.location.pathname);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-cc-blue fixed top-0 z-50 h-30 w-full text-white">
        <nav className="mx-auto flex h-full items-center justify-between px-4 md:max-w-2/3">
          <div className="flex h-full shrink-0 items-center">
            <a href="/">
              <img src={LogoImg.src} alt="Logo" className="h-auto w-75" />
            </a>
          </div>
          <ul className="hidden items-center md:flex">
            {navLinks.map((link) => {
              if ('children' in link) {
                const isActive = link.children.some(
                  (child) => currentPath === child.href,
                );
                const isDropdownOpen = dropdownOpen === link.name;
                return (
                  <li
                    key={link.name}
                    ref={dropdownRef}
                    className="border-cc-cyan relative flex h-6 items-center border-r-2 px-6 first:border-l-2 last:border-r-0"
                  >
                    <button
                      onClick={() =>
                        setDropdownOpen(isDropdownOpen ? null : link.name)
                      }
                      className={`hover:text-cc-cyan flex items-center gap-1 transition-colors ${
                        isActive ? 'text-cc-cyan font-bold' : 'text-white'
                      }`}
                    >
                      {link.name}
                      <svg
                        className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <ul className="bg-cc-blue absolute top-full left-0 mt-3 min-w-40 rounded-md border border-white/10 py-2 shadow-lg">
                        {link.children.map((child) => (
                          <li key={child.name}>
                            <a
                              href={child.href}
                              className={`hover:text-cc-cyan block px-4 py-2 transition-colors ${
                                currentPath === child.href
                                  ? 'text-cc-cyan font-bold'
                                  : 'text-white'
                              }`}
                              onClick={() => setDropdownOpen(null)}
                            >
                              {child.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              const isActive =
                currentPath === link.href ||
                (currentPath === '' && link.href === '/');

              return (
                <li
                  key={link.name}
                  className="border-cc-cyan flex h-6 items-center border-r-2 px-6 first:border-l-2 last:border-r-0"
                >
                  <a
                    href={link.href}
                    className={`hover:text-cc-cyan transition-colors ${
                      isActive ? 'text-cc-cyan font-bold' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white focus:outline-none md:hidden"
            aria-expanded={isOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>
        <div
          className={`${isOpen ? 'block' : 'hidden'} bg-cc-blue absolute left-0 w-full border-t border-white/10 shadow-lg md:hidden`}
        >
          <ul className="flex flex-col p-4">
            {navLinks.map((link) => {
              if ('children' in link) {
                const isMobileDropdownOpen = dropdownOpen === link.name;
                return (
                  <li
                    key={link.name}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <button
                      onClick={() =>
                        setDropdownOpen(
                          isMobileDropdownOpen ? null : link.name,
                        )
                      }
                      className="hover:text-cc-cyan flex w-full items-center justify-between py-4 text-white"
                    >
                      {link.name}
                      <svg
                        className={`h-3 w-3 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isMobileDropdownOpen && (
                      <ul className="pb-2 pl-4">
                        {link.children.map((child) => (
                          <li key={child.name}>
                            <a
                              href={child.href}
                              className={`hover:text-cc-cyan block py-2 ${
                                currentPath === child.href
                                  ? 'text-cc-cyan'
                                  : 'text-white'
                              }`}
                              onClick={() => {
                                setIsOpen(false);
                                setDropdownOpen(null);
                              }}
                            >
                              {child.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li
                  key={link.name}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <a
                    href={link.href}
                    className={`hover:text-cc-cyan block py-4 ${
                      currentPath === link.href ? 'text-cc-cyan' : 'text-white'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </header>
      <div className="h-30"></div>
    </>
  );
}
