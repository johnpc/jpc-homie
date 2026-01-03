import RemoteControl from '@/components/RemoteControl';
import Header from '@/components/Header';
import { Providers } from '@/app/providers';

export default function RemotePage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">TV Remote</h2>
          <RemoteControl />
        </main>
      </div>
    </Providers>
  );
}
