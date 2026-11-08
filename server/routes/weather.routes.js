import { Router } from 'express';

import {
  geocodeCity,
  getWeather,
} from '../controllers/weather.controller.js';

import {
  validateCityQuery,
  validateCoordinates,
} from '../middleware/validate.js';

const router = Router();

router.get('/geocode', validateCityQuery, geocodeCity);

router.get('/weather', validateCoordinates, getWeather);

export default router;