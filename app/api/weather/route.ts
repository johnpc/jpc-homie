import { NextResponse } from 'next/server';

export async function GET() {
  const haUrl = process.env.HOME_ASSISTANT_URL;
  const haToken = process.env.HOME_ASSISTANT_TOKEN;

  if (!haUrl || !haToken) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  const sensors = [
    'weather.forecast_home_weather',
    'sensor.johnpc_weather_temperature',
    'sensor.johnpc_weather_feels_like',
    'sensor.johnpc_weather_humidity',
    'sensor.johnpc_weather_wind_speed',
    'sensor.johnpc_weather_wind_gust',
    'sensor.johnpc_weather_wind_direction',
    'sensor.johnpc_weather_daily_rain',
    'sensor.johnpc_weather_uv_index',
    'sensor.johnpc_weather_irradiance',
    'sensor.johnpc_weather_dew_point',
    'sensor.johnpc_weather_relative_pressure',
    'sensor.johnpc_weather_inside_temperature',
    'sensor.johnpc_weather_humidity_indoor',
  ];

  try {
    const responses = await Promise.all(
      sensors.map((entity) =>
        fetch(`${haUrl}/api/states/${entity}`, {
          headers: { Authorization: `Bearer ${haToken}` },
        }).then((r) => r.json())
      )
    );

    const [
      forecast,
      temp,
      feelsLike,
      humidity,
      windSpeed,
      windGust,
      windDir,
      dailyRain,
      uvIndex,
      irradiance,
      dewPoint,
      pressure,
      insideTemp,
      insideHumidity,
    ] = responses;

    return NextResponse.json({
      condition: forecast.state,
      temperature: parseFloat(temp.state),
      feelsLike: parseFloat(feelsLike.state),
      humidity: parseFloat(humidity.state),
      windSpeed: parseFloat(windSpeed.state),
      windGust: parseFloat(windGust.state),
      windDirection: parseFloat(windDir.state),
      dailyRain: parseFloat(dailyRain.state),
      uvIndex: parseFloat(uvIndex.state),
      irradiance: parseFloat(irradiance.state),
      dewPoint: parseFloat(dewPoint.state),
      pressure: parseFloat(pressure.state),
      insideTemp: parseFloat(insideTemp.state),
      insideHumidity: parseFloat(insideHumidity.state),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
