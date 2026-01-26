import React from 'react';
import LogoImg from '../../assets/CC_logo_no_tag.svg';

const navLinks = [
  { name: 'Working Groups', href: '/working-groups' },
  { name: 'About', href: '/about' },
  { name: 'Join', href: '/join' },
  { name: 'Blog & News', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#010004] px-4 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between space-y-8 border-b border-white/10 pb-10 md:flex-row md:space-y-0">
          <div className="flex flex-1 justify-start">
            <a href="/">
              <img src={LogoImg.src} alt="Logo" className="h-24 w-auto" />
            </a>
          </div>
          <nav className="flex">
            <ul className="flex flex-wrap justify-center">
              {navLinks.map((link) => (
                <li
                  key={link.name}
                  className="flex h-6 items-center border-r-2 border-[#02EAEA] px-6 last:border-r-0"
                >
                  <a
                    href={link.href}
                    className="text-sm text-white transition-colors hover:text-[#02EAEA]"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-1 justify-end gap-6">
            <a
              href="/code-of-conduct"
              className="border-r-2 border-white px-6 text-xs text-[#02EAEA] hover:text-white"
            >
              Code of Conduct
            </a>
            <a
              href="/ai-policy"
              className="text-xs text-[#02EAEA] hover:text-white"
            >
              AI Policy
            </a>
          </div>
        </div>
        <div className="pt-8 text-center">
          <p className="text-xs text-gray-600">
            &copy;Linaro Group {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
