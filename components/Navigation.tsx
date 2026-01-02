'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mb-4 justify-center">
      <Link
        href="/"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        💬 Chat
      </Link>
      <Link
        href="/music"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/music'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        🎵 Music
      </Link>
      <Link
        href="/dashboard"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/dashboard'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        📊 Dashboard
      </Link>
      <Link
        href="/temperature"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/temperature'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        🌡️ Temperature
      </Link>
      <Link
        href="/remote"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/remote'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        📺 Remote
      </Link>
      <Link
        href="/adu"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/adu'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        🏡 ADU
      </Link>
      <Link
        href="/cameras"
        className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
          pathname === '/cameras'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        📹 Cameras
      </Link>
    </nav>
  );
}
