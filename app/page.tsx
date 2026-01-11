'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const lastTab = localStorage.getItem('lastTab');
    router.replace(lastTab || '/chat');
  }, [router]);

  return null;
}
