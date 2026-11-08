
import AppError from '../utils/AppError.js';

import {
  searchCities,
  getWeatherBundle,
} from '../services/openMeteo.service.js';

import weatherMapper from '../services/weatherMapper.js';

import historyRepository from '../repositories/history.repository.js';

export async function geocodeCity(req, res, next) {
  try {
    const results = await searchCities(req.cityQuery);

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeather(req, res, next) {
  try {
    const { lat, lon } = req.coordinates;

    const place = {
      lat,
      lon,
      name: String(req.query.name || 'Selected location').trim(),
      country: String(req.query.country || '').trim(),
      admin1: String(req.query.admin1 || '').trim(),
    };

    if (
      place.name.length > 100 ||
      place.country.length > 100 ||
      place.admin1.length > 100
    ) {
      throw new AppError('Location details are too long.', 400);
    }

    const { forecast, airQuality } = await getWeatherBundle(lat, lon);

    const weather = weatherMapper.mapWeather(
      place,
      forecast,
      airQuality
    );

    // Save successful weather searches in SQLite
    historyRepository.addSearch(place);

    res.json({
      success: true,
      data: weather,
    });
  } catch (error) {
    next(error);
  }
}
