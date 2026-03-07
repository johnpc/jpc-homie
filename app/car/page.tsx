import Header from '@/components/Header';
import CarCard from '@/components/CarCard';
import { Providers } from '@/app/providers';

export default function CarPage() {
  return (
    <Providers>
      <main className="min-h-screen bg-gray-100 p-4">
        <Header />
        <div className="max-w-md mx-auto mt-4">
          <CarCard />
        </div>
      </main>
    </Providers>
  );
}
