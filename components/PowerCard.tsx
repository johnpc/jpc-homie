interface PowerCardProps {
  kw: number;
  kwh: number;
  cost: number;
}

export default function PowerCard({ kw, kwh, cost }: PowerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Energy Usage</h3>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{kw.toFixed(2)} kW</p>
        <p className="text-sm text-gray-700">{kwh.toFixed(2)} kWh</p>
        <p className="text-sm text-gray-500">${cost.toFixed(2)}</p>
      </div>
    </div>
  );
}
