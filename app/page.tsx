import ChatInterface from '@/components/ChatInterface';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 h-screen flex flex-col">
        <div className="text-center py-6 px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Homie</h1>
          <p className="text-base text-gray-600 mb-4">Your smart home assistant</p>
          <Navigation />
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
