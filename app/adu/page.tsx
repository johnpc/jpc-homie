import AirbnbCalendar from '@/components/AirbnbCalendar';
import ADUSmartLock from '@/components/ADUSmartLock';
import ADUThermostat from '@/components/ADUThermostat';
import ADUTVStatus from '@/components/ADUTVStatus';
import ADUTCLTVStatus from '@/components/ADUTCLTVStatus';
import Header from '@/components/Header';
import { Providers } from '../providers';

export default function ADUPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 h-screen flex flex-col">
          <Header />
          <div className="flex-1 overflow-auto px-4 pb-8">
            <AirbnbCalendar />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ADUSmartLock />
              <ADUThermostat />
              <ADUTVStatus />
              <ADUTCLTVStatus />
            </div>
          </div>
        </div>
      </main>
    </Providers>
  );
}
