import Weather from '@/components/Weather';
import Header from '@/components/Header';
import { Providers } from '../providers';

export default function WeatherPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 h-screen flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto px-4">
            <Weather />
          </div>
        </div>
      </main>
    </Providers>
  );
}
