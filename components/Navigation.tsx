'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-1.5 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm border border-gray-300"
      >
        {isExpanded ? '▲' : '▼'}
      </button>
      {isExpanded && (
        <div className="fixed left-0 right-0 top-32 flex justify-center z-50 px-4">
          <nav className="flex flex-wrap gap-2 justify-center bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-4xl">
            <Link
              href="/chat"
              className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                pathname === '/chat'
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
              href="/weather"
              className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                pathname === '/weather'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              🌤️ Weather
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
            <Link
              href="/scripts"
              className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                pathname === '/scripts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              ⚡ Scripts
            </Link>
            <a
              href="https://wall.jpc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg font-medium transition text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            >
              ✍️ Wall
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
