'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 mb-4">
      <Link
        href="/"
        className={`px-4 py-2 rounded-lg font-medium transition ${
          pathname === '/'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        💬 Chat
      </Link>
      <Link
        href="/music"
        className={`px-4 py-2 rounded-lg font-medium transition ${
          pathname === '/music'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        🎵 Music
      </Link>
      <Link
        href="/dashboard"
        className={`px-4 py-2 rounded-lg font-medium transition ${
          pathname === '/dashboard'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        📊 Dashboard
      </Link>
    </nav>
  );
}
