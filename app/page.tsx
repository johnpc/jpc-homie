import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Homie</h1>
          <p className="text-gray-600">
            Your smart home assistant
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  );
}
