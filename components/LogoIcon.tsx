import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
        <stop offset="100%" stopColor="#818cf8" /> {/* indigo-400 */}
      </linearGradient>
    </defs>
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.8 14H9.6l3.2-8h1.6l3.2 8h-1.6l-.9-2.2h-3.4L11.2 16zm1.7-3.8h2.2l-1.1-2.8-1.1 2.8z"
      fill="url(#logo-gradient)"
    />
  </svg>
);

export default LogoIcon;
