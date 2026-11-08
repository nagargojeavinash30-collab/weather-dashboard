import AppError from '../utils/AppError.js';

export function validateCoordinates(req, res, next) {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (
    req.query.lat === undefined ||
    req.query.lon === undefined ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return next(
      new AppError('Valid latitude and longitude are required.', 400)
    );
  }

  req.coordinates = { lat, lon };
  next();
}

export function validateCityQuery(req, res, next) {
  const query = String(req.query.q || '').trim();

  if (query.length < 2 || query.length > 100) {
    return next(
      new AppError('City name must be between 2 and 100 characters.', 400)
    );
  }

  req.cityQuery = query;
  next();
}