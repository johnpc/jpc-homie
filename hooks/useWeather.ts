import { useQuery } from '@tanstack/react-query';

export interface WeatherData {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  dailyRain: number;
  uvIndex: number;
  irradiance: number;
  dewPoint: number;
  pressure: number;
  insideTemp: number;
  insideHumidity: number;
}

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch('/api/weather');
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}

export function useWeather() {
  return useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    refetchInterval: 60000,
  });
}
