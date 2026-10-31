import React from 'react';

export type NavSection = 'catalog' | 'internships' | 'learning' | 'credentials' | 'verify';

interface NavbarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  onQuickVerifyClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onQuickVerifyClick,
}) => {
  const navItems: { id: NavSection; label: string }[] = [
    { id: 'catalog', label: 'Catalog' },
    { id: 'internships', label: 'Internships' },
    { id: 'learning', label: 'My Learning' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'verify', label: 'Verify ID' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-6 h-14">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('catalog');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          TechCodistic
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-slate-600 overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-indigo-700 border-indigo-700 font-semibold'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickVerifyClick}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Verify Credential
          </button>
        </div>
      </div>
    </header>
  );
};
