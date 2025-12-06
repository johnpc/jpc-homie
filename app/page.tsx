import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-0 sm:px-4 h-screen flex flex-col">
        <div className="text-center py-4 sm:py-6 px-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">🏠 Homie</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Your smart home assistant
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
