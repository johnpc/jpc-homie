'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function TabPersistence() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') {
      localStorage.setItem('lastTab', pathname);
    }
  }, [pathname]);

  return null;
}
