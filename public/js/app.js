
const searchInput = document.getElementById('city-search');
const searchButton = document.getElementById('search-btn');
const locationButton = document.getElementById('location-btn');
const searchResults = document.getElementById('search-results');
const weatherContent = document.getElementById('weather-content');

let selectedCity = null;
let searchTimeout = null;

let temperatureUnit = 'C';
let windUnit = 'kmh';
let currentWeatherData = null;

// Chart instances
let hourlyChart = null;
let dailyChart = null;

// API request function
async function apiRequest(url) {
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Something went wrong.');
  }

  return result;
}

// Loading state
function showLoading(message = 'Loading weather...') {
  destroyCharts();

  weatherContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⏳</div>
      <h2>${escapeHTML(message)}</h2>
      <p>Fetching the latest weather information.</p>
    </div>
  `;
}

// Error state
function showError(message) {
  weatherContent.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h2>Unable to load weather</h2>
      <p>${escapeHTML(message)}</p>
    </div>
  `;
}

// HTML safety function
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

// Search cities
async function searchCities(query) {
  if (query.trim().length < 2) {
    searchResults.style.display = 'none';
    return;
  }

  try {
    const result = await apiRequest(
      `/api/geocode?q=${encodeURIComponent(query.trim())}`
    );

    searchResults.innerHTML = '';

    if (!result.results.length) {
      searchResults.innerHTML =
        '<div class="search-result">No cities found</div>';
    } else {
      result.results.forEach(city => {
        const button = document.createElement('button');

        button.className = 'search-result';
        button.type = 'button';

        button.textContent =
          `${city.name}, ${city.admin1 || city.country || ''}`;

        button.addEventListener('click', () => {
          selectedCity = city;
          searchInput.value = city.name;
          searchResults.style.display = 'none';
          loadWeather(city);
        });

        searchResults.appendChild(button);
      });
    }

    searchResults.style.display = 'block';
  } catch (error) {
    searchResults.style.display = 'none';
    console.error('City search error:', error);
  }
}

// Reverse geocoding: convert coordinates into a city name
async function reverseGeocode(latitude, longitude) {
  try {
    const url = new URL(
      'https://api.bigdatacloud.net/data/reverse-geocode-client'
    );

    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set('localityLanguage', 'en');

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Reverse geocoding failed.');
    }

    const result = await response.json();

    const cityName =
      result.city ||
      result.locality ||
      result.localityInfo?.administrative?.find(
        item => item.adminLevel === 8
      )?.name ||
      'My Location';

    return {
      name: cityName,
      lat: latitude,
      lon: longitude,
      country: result.countryName || '',
      admin1: result.principalSubdivision || ''
    };
  } catch (error) {
    console.warn('Reverse geocoding unavailable:', error);

    // Weather can still load using coordinates
    return {
      name: 'My Location',
      lat: latitude,
      lon: longitude,
      country: '',
      admin1: ''
    };
  }
}

// Get the user's current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError(
      'Geolocation is not supported by your browser.'
    );
    return;
  }

  locationButton.disabled = true;
  locationButton.textContent = '📍 Detecting location...';

  showLoading('Detecting your location...');

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const city = await reverseGeocode(latitude, longitude);

        selectedCity = city;
        searchInput.value = city.name;
        searchResults.style.display = 'none';

        await loadWeather(city);
      } catch (error) {
        console.error('Location weather error:', error);
        showError(error.message || 'Unable to load local weather.');
      } finally {
        locationButton.disabled = false;
        locationButton.textContent = '📍 Use My Location';
      }
    },

    error => {
      let message;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          message =
            'Location permission was denied. Allow location access in your browser settings and try again.';
          break;

        case error.POSITION_UNAVAILABLE:
          message =
            'Your current location is unavailable. Check your device location settings.';
          break;

        case error.TIMEOUT:
          message =
            'Location request timed out. Please try again.';
          break;

        default:
          message =
            'An unknown error occurred while detecting your location.';
      }

      showError(message);

      locationButton.disabled = false;
      locationButton.textContent = '📍 Use My Location';
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    }
  );
}

// Load weather from backend
async function loadWeather(city) {
  selectedCity = city;

  showLoading();

  try {
    const params = new URLSearchParams({
      lat: city.lat,
      lon: city.lon,
      name: city.name,
      country: city.country || '',
      admin1: city.admin1 || ''
    });

    const result = await apiRequest(`/api/weather?${params}`);

    renderWeather(result.data);
  } catch (error) {
    showError(error.message);
  }
}

// Temperature and wind conversion functions
function convertTemperature(celsius) {
  if (temperatureUnit === 'F') {
    return (celsius * 9 / 5) + 32;
  }

  return celsius;
}

function convertWind(speed) {
  if (windUnit === 'mph') {
    return speed * 0.621371;
  }

  return speed;
}

function displayTemperature(value) {
  return `${convertTemperature(value).toFixed(1)}°${temperatureUnit}`;
}

function displayWind(value) {
  return `${convertWind(value).toFixed(1)} ${
    windUnit === 'mph' ? 'mph' : 'km/h'
  }`;
}

// Change temperature unit
function changeTemperatureUnit(unit) {
  temperatureUnit = unit;

  if (currentWeatherData) {
    renderWeather(currentWeatherData);
  }
}

// Change wind unit
function changeWindUnit(unit) {
  windUnit = unit;

  if (currentWeatherData) {
    renderWeather(currentWeatherData);
  }
}

// Destroy previous chart instances
function destroyCharts() {
  if (hourlyChart) {
    hourlyChart.destroy();
    hourlyChart = null;
  }

  if (dailyChart) {
    dailyChart.destroy();
    dailyChart = null;
  }
}

// Shared chart styling
function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        labels: {
          color: '#c4c4d4',
          usePointStyle: true,
          padding: 20
        }
      },

      tooltip: {
        backgroundColor: '#171722',
        titleColor: '#ffffff',
        bodyColor: '#c4c4d4',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1
      }
    },

    scales: {
      x: {
        ticks: {
          color: '#a0a0b5'
        },
        grid: {
          color: 'rgba(255,255,255,0.05)'
        }
      },

      y: {
        ticks: {
          color: '#a0a0b5',
          callback(value) {
            return `${value}°${temperatureUnit}`;
          }
        },
        grid: {
          color: 'rgba(255,255,255,0.07)'
        }
      }
    }
  };
}

// Create both temperature charts
function renderWeatherCharts(data) {
  destroyCharts();

  if (typeof Chart === 'undefined') {
    console.error('Chart.js is not loaded.');
    return;
  }

  // Hourly temperature chart
  const hourlyCanvas = document.getElementById(
    'hourly-temperature-chart'
  );

  if (hourlyCanvas && Array.isArray(data.hourly)) {
    const hourlyData = data.hourly.slice(0, 24);

    hourlyChart = new Chart(hourlyCanvas, {
      type: 'line',

      data: {
        labels: hourlyData.map(hour => hour.time.slice(11, 16)),

        datasets: [{
          label: `Temperature (°${temperatureUnit})`,

          data: hourlyData.map(hour =>
            Number(convertTemperature(hour.temperature).toFixed(1))
          ),

          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167,139,250,0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6
        }]
      },

      options: {
        ...getChartOptions(),

        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  // Five-day temperature chart
  const dailyCanvas = document.getElementById(
    'daily-temperature-chart'
  );

  if (dailyCanvas && Array.isArray(data.daily)) {
    dailyChart = new Chart(dailyCanvas, {
      type: 'line',

      data: {
        labels: data.daily.map(day => formatDate(day.date)),

        datasets: [
          {
            label: `Maximum (°${temperatureUnit})`,

            data: data.daily.map(day =>
              Number(convertTemperature(day.temperatureMax).toFixed(1))
            ),

            borderColor: '#fb923c',
            backgroundColor: 'rgba(251,146,60,0.12)',
            borderWidth: 3,
            tension: 0.35,
            fill: false
          },

          {
            label: `Minimum (°${temperatureUnit})`,

            data: data.daily.map(day =>
              Number(convertTemperature(day.temperatureMin).toFixed(1))
            ),

            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96,165,250,0.12)',
            borderWidth: 3,
            tension: 0.35,
            fill: false
          }
        ]
      },

      options: getChartOptions()
    });
  }
}

// Render weather dashboard
function renderWeather(data) {
  currentWeatherData = data;

  const current = data.current;
  const location = data.location;

  weatherContent.innerHTML = `
    <div class="weather-layout">

      <section class="weather-main">

        <div class="weather-location">
          <div>
            <p class="eyebrow">CURRENT WEATHER</p>
            <h2>${escapeHTML(location.name)}</h2>
            <p>
              ${escapeHTML(location.admin1 || '')},
              ${escapeHTML(location.country || '')}
            </p>
          </div>

          <div class="weather-icon">${current.icon}</div>
        </div>

        <div class="unit-controls">

          <div class="unit-group">
            <button
              type="button"
              id="unit-c"
              class="${temperatureUnit === 'C' ? 'active' : ''}"
            >°C</button>

            <button
              type="button"
              id="unit-f"
              class="${temperatureUnit === 'F' ? 'active' : ''}"
            >°F</button>
          </div>

          <div class="unit-group">
            <button
              type="button"
              id="wind-kmh"
              class="${windUnit === 'kmh' ? 'active' : ''}"
            >km/h</button>

            <button
              type="button"
              id="wind-mph"
              class="${windUnit === 'mph' ? 'active' : ''}"
            >mph</button>
          </div>

        </div>

        <div class="temperature">
          ${displayTemperature(current.temperature)}
        </div>

        <h3>${escapeHTML(current.description)}</h3>

        <p class="feels-like">
          Feels like ${displayTemperature(current.feelsLike)}
        </p>

        <div class="weather-stats">

          <div class="stat-card">
            <span>💧</span>
            <p>Humidity</p>
            <strong>${current.humidity}%</strong>
          </div>

          <div class="stat-card">
            <span>💨</span>
            <p>Wind speed</p>
            <strong>${displayWind(current.windSpeed)}</strong>
          </div>

          <div class="stat-card">
            <span>🌡️</span>
            <p>Pressure</p>
            <strong>${current.pressure} hPa</strong>
          </div>

        </div>

      </section>

      <section class="air-card">
        <p class="eyebrow">AIR QUALITY</p>

        <h2>${data.airQuality?.usAqi ?? 'N/A'}</h2>

        <p>US Air Quality Index</p>

        <div class="air-details">

          <div>
            <span>PM2.5</span>
            <strong>${data.airQuality?.pm2_5 ?? 'N/A'}</strong>
          </div>

          <div>
            <span>PM10</span>
            <strong>${data.airQuality?.pm10 ?? 'N/A'}</strong>
          </div>

          <div>
            <span>Ozone</span>
            <strong>${data.airQuality?.ozone ?? 'N/A'}</strong>
          </div>

        </div>
      </section>

    </div>

    <!-- Temperature Charts -->
    <section class="forecast-section">

      <div class="section-heading">
        <h2>Temperature Trends</h2>
        <span>Weather insights</span>
      </div>

      <div class="chart-grid">

        <div class="chart-card">
          <h3>Next 24 Hours</h3>

          <div class="chart-container">
            <canvas id="hourly-temperature-chart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3>5-Day Temperature</h3>

          <div class="chart-container">
            <canvas id="daily-temperature-chart"></canvas>
          </div>
        </div>

      </div>
    </section>

    <!-- Hourly Forecast -->
    <section class="forecast-section">

      <div class="section-heading">
        <h2>Hourly Forecast</h2>
        <span>Next 24 hours</span>
      </div>

      <div class="hourly-list">

        ${data.hourly.map(hour => `
          <div class="hour-card">
            <span>${escapeHTML(hour.time.slice(11, 16))}</span>
            <span>${hour.icon}</span>
            <strong>${displayTemperature(hour.temperature)}</strong>
            <small>${hour.precipitationProbability}% rain</small>
          </div>
        `).join('')}

      </div>
    </section>

    <!-- Five-Day Forecast -->
    <section class="forecast-section">

      <div class="section-heading">
        <h2>5-Day Forecast</h2>
        <span>Upcoming days</span>
      </div>

      <div class="daily-list">

        ${data.daily.map(day => `
          <div class="day-card">
            <span>${formatDate(day.date)}</span>
            <span>${day.icon} ${escapeHTML(day.label)}</span>

            <strong>
              ${displayTemperature(day.temperatureMax)} /
              ${displayTemperature(day.temperatureMin)}
            </strong>
          </div>
        `).join('')}

      </div>
    </section>
  `;

  // Temperature unit events
  document.getElementById('unit-c').addEventListener('click', () => {
    changeTemperatureUnit('C');
  });

  document.getElementById('unit-f').addEventListener('click', () => {
    changeTemperatureUnit('F');
  });

  // Wind unit events
  document.getElementById('wind-kmh').addEventListener('click', () => {
    changeWindUnit('kmh');
  });

  document.getElementById('wind-mph').addEventListener('click', () => {
    changeWindUnit('mph');
  });

  // Render charts after canvas elements exist
  renderWeatherCharts(data);
}

// Format forecast date
function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }
  );
}

// Search input events
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);

  // Clear the previous selection when the user types a new query
  selectedCity = null;

  searchTimeout = setTimeout(() => {
    searchCities(searchInput.value);
  }, 350);
});

// Search button event
searchButton.addEventListener('click', () => {
  if (selectedCity) {
    loadWeather(selectedCity);
  } else if (searchInput.value.trim()) {
    searchCities(searchInput.value);
  }
});

// Enter key search
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const firstResult = searchResults.querySelector(
      'button.search-result'
    );

    if (firstResult) {
      firstResult.click();
    } else if (selectedCity) {
      loadWeather(selectedCity);
    } else if (searchInput.value.trim()) {
      searchCities(searchInput.value);
    }
  }
});

// Location button event
if (locationButton) {
  locationButton.addEventListener('click', getCurrentLocation);
} else {
  console.error('Location button was not found in index.html.');
}

// Hide search results when clicking outside
document.addEventListener('click', event => {
  if (!event.target.closest('.search-container')) {
    searchResults.style.display = 'none';
  }
});

console.log('Atmosphere Weather Dashboard initialized.');
