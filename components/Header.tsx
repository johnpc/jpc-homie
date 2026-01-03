import Navigation from './Navigation';

export default function Header() {
  return (
    <div className="text-center py-6 px-4 relative">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Navigation />
        <h1 className="text-4xl font-bold text-gray-900">🏠 Homie</h1>
      </div>
      <p className="text-base text-gray-600 mb-4">Your smart home assistant</p>
    </div>
  );
}
