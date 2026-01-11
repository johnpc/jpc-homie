import ChatInterface from '@/components/ChatInterface';
import Header from '@/components/Header';

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 h-screen flex flex-col">
        <Header />
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
