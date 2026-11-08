import db from '../db/database.js';

const saveSearchStatement = db.prepare(`
  INSERT INTO search_history (
    city,
    country,
    admin1,
    latitude,
    longitude,
    searched_at
  )
  VALUES (
    @city,
    @country,
    @admin1,
    @latitude,
    @longitude,
    strftime('%Y-%m-%d %H:%M:%f', 'now')
  )
  ON CONFLICT(latitude, longitude)
  DO UPDATE SET
    city = excluded.city,
    country = excluded.country,
    admin1 = excluded.admin1,
    searched_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
`);

const findSearchStatement = db.prepare(`
  SELECT
    id,
    city,
    country,
    admin1,
    latitude,
    longitude,
    searched_at AS searchedAt
  FROM search_history
  WHERE latitude = ? AND longitude = ?
`);

const getRecentStatement = db.prepare(`
  SELECT
    id,
    city,
    country,
    admin1,
    latitude,
    longitude,
    searched_at AS searchedAt
  FROM search_history
  ORDER BY searched_at DESC
  LIMIT ?
`);

const deleteByIdStatement = db.prepare(`
  DELETE FROM search_history WHERE id = ?
`);

const clearAllStatement = db.prepare(`
  DELETE FROM search_history
`);

function addSearch(place) {
  saveSearchStatement.run({
    city: place.name || place.city,
    country: place.country || null,
    admin1: place.admin1 || null,
    latitude: place.lat,
    longitude: place.lon,
  });

  return findSearchStatement.get(place.lat, place.lon);
}

function getRecent(limit = 8) {
  return getRecentStatement.all(limit);
}

function deleteById(id) {
  return deleteByIdStatement.run(id).changes > 0;
}

function clearAll() {
  return clearAllStatement.run().changes;
}

export default {
  addSearch,
  getRecent,
  deleteById,
  clearAll,
};