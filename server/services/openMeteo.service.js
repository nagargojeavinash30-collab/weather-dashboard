import config from '../config/index.js';
import fetchJson from '../utils/fetchJson.js';

export async function searchCities(query) {
  const url = new URL(config.upstream.geocodingUrl);

  url.search = new URLSearchParams({
    name: query,
    count: '8',
    language: 'en',
    format: 'json',
  });

  const data = await fetchJson(url);

  return (data.results || []).map((place) => ({
    name: place.name,
    country: place.country || '',
    admin1: place.admin1 || '',
    lat: place.latitude,
    lon: place.longitude,
    timezone: place.timezone || 'auto',
  }));
}

async function getForecast(lat, lon) {
  const url = new URL(config.upstream.forecastUrl);

  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '5',
  });

  return fetchJson(url);
}

async function getAirQuality(lat, lon) {
  const url = new URL(config.upstream.airQualityUrl);

  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'us_aqi',
      'european_aqi',
      'pm2_5',
      'pm10',
      'ozone',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'carbon_monoxide',
    ].join(','),
    timezone: 'auto',
  });

  return fetchJson(url);
}

export async function getWeatherBundle(lat, lon) {
  const [forecast, airQuality] = await Promise.all([
    getForecast(lat, lon),
    getAirQuality(lat, lon).catch((error) => {
      console.warn('Air quality data unavailable:', error.message);
      return null;
    }),
  ]);

  return {
    forecast,
    airQuality,
  };
}