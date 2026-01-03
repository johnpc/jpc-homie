import MusicBrowser from '@/components/MusicBrowser';
import Header from '@/components/Header';
import { Providers } from '../providers';

export default function MusicPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 h-screen flex flex-col">
          <Header />
          <div className="flex-1 overflow-hidden px-4">
            <MusicBrowser />
          </div>
        </div>
      </main>
    </Providers>
  );
}
