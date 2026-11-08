import { getWeatherDescription } from '../utils/weatherCodes.js';

function mapWeather(place, forecast, airQuality) {
  const current = forecast.current;
  const hourly = forecast.hourly;
  const daily = forecast.daily;

  const currentWeather = getWeatherDescription(current.weather_code);

  const hourlyForecast = hourly.time.slice(0, 24).map((time, index) => ({
    time,
    temperature: hourly.temperature_2m[index],
    humidity: hourly.relative_humidity_2m[index],
    precipitationProbability: hourly.precipitation_probability[index],
    weatherCode: hourly.weather_code[index],
    ...getWeatherDescription(hourly.weather_code[index]),
    windSpeed: hourly.wind_speed_10m[index],
  }));

  const dailyForecast = daily.time.map((date, index) => ({
    date,
    weatherCode: daily.weather_code[index],
    ...getWeatherDescription(daily.weather_code[index]),
    temperatureMax: daily.temperature_2m_max[index],
    temperatureMin: daily.temperature_2m_min[index],
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
    uvIndexMax: daily.uv_index_max[index],
    precipitationProbability: daily.precipitation_probability_max[index],
  }));

  const air = airQuality?.current;

  return {
    location: {
      name: place.name,
      country: place.country || '',
      admin1: place.admin1 || '',
      latitude: place.lat,
      longitude: place.lon,
      timezone: forecast.timezone,
    },

    current: {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      isDay: current.is_day === 1,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      description: currentWeather.label,
      icon: currentWeather.icon,
      pressure: current.surface_pressure,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      time: current.time,
    },

    hourly: hourlyForecast,
    daily: dailyForecast,

    airQuality: air
      ? {
          usAqi: air.us_aqi ?? null,
          europeanAqi: air.european_aqi ?? null,
          pm2_5: air.pm2_5 ?? null,
          pm10: air.pm10 ?? null,
          ozone: air.ozone ?? null,
          nitrogenDioxide: air.nitrogen_dioxide ?? null,
          sulphurDioxide: air.sulphur_dioxide ?? null,
          carbonMonoxide: air.carbon_monoxide ?? null,
        }
      : null,
  };
}

export default { mapWeather };