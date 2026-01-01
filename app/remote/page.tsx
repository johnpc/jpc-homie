import RemoteControl from '@/components/RemoteControl';
import Navigation from '@/components/Navigation';
import { Providers } from '@/app/providers';

export default function RemotePage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-6 px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Homie</h1>
          <p className="text-base text-gray-600 mb-4">Your smart home assistant</p>
          <Navigation />
        </div>
        <main className="container mx-auto py-8 px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">TV Remote</h2>
          <RemoteControl />
        </main>
      </div>
    </Providers>
  );
}
