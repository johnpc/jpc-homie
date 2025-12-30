import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import { Providers } from '@/app/providers';

export default function DashboardPage() {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Home Dashboard</h1>
          <Dashboard />
        </main>
      </div>
    </Providers>
  );
}
