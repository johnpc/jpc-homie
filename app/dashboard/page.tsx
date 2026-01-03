import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import { Providers } from '@/app/providers';

export default function DashboardPage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Home Dashboard</h2>
          <Dashboard />
        </main>
      </div>
    </Providers>
  );
}
