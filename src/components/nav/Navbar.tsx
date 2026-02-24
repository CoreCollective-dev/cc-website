import React, { useState, useEffect } from 'react';
import LogoImg from '../../assets/CoreCollective_White-Wordmark.png';

const navLinks = [
  { name: 'Working Groups', href: '/working-groups/' },
  { name: 'About', href: '/about/' },
  { name: 'Join', href: '/join/' },
  { name: 'Blog & News', href: '/blog/' },
  { name: 'Contact', href: '/contact/' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(globalThis.location.pathname);
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
            {navLinks.map((link) => (
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
            ))}
          </ul>
        </div>
      </header>
      <div className="h-30"></div>
    </>
  );
}
