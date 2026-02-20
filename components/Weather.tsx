'use client';

import { useWeather } from '@/hooks/useWeather';

const conditionEmoji: Record<string, string> = {
  sunny: '☀️',
  'clear-night': '🌙',
  cloudy: '☁️',
  partlycloudy: '⛅',
  rainy: '🌧️',
  snowy: '❄️',
  fog: '🌫️',
  windy: '💨',
  lightning: '⚡',
};

function windDirectionLabel(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function Weather() {
  const { data, isLoading, error } = useWeather();

  if (isLoading) return <div className="text-gray-500">Loading weather...</div>;
  if (error || !data) return <div className="text-red-500">Failed to load weather</div>;

  const emoji = conditionEmoji[data.condition] || '🌤️';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-5xl font-bold text-gray-900">{data.temperature.toFixed(1)}°F</div>
            <div className="text-gray-500 mt-1">Feels like {data.feelsLike.toFixed(1)}°F</div>
          </div>
          <div className="text-6xl">{emoji}</div>
        </div>
        <div className="text-lg text-gray-700 capitalize">{data.condition.replace('-', ' ')}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card label="💧 Humidity" value={`${data.humidity}%`} />
        <Card label="🌡️ Dew Point" value={`${data.dewPoint.toFixed(1)}°F`} />
        <Card
          label="💨 Wind"
          value={`${data.windSpeed.toFixed(1)} mph ${windDirectionLabel(data.windDirection)}`}
        />
        <Card label="🌬️ Gusts" value={`${data.windGust.toFixed(1)} mph`} />
        <Card label="🌧️ Rain Today" value={`${data.dailyRain} in`} />
        <Card label="☀️ UV Index" value={data.uvIndex.toString()} />
        <Card label="🔆 Solar" value={`${data.irradiance.toFixed(0)} W/m²`} />
        <Card label="📊 Pressure" value={`${data.pressure.toFixed(2)} inHg`} />
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500 mb-2">🏠 Inside</div>
        <div className="flex justify-between">
          <span className="text-gray-900 font-medium">{data.insideTemp.toFixed(1)}°F</span>
          <span className="text-gray-600">{data.insideHumidity}% humidity</span>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-medium text-gray-900">{value}</div>
    </div>
  );
}
