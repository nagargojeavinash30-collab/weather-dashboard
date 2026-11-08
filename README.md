\# Atmosphere – Weather Dashboard



A modern, responsive weather dashboard built with HTML, CSS, JavaScript, Node.js and Express. It provides real-time weather information, hourly and 5-day forecasts, air quality details and weather search history.



\## Features



\- Search weather by city name

\- Get weather using your current location

\- Current weather conditions and temperature

\- Hourly weather forecast

\- 5-day weather forecast

\- Air quality information

\- Temperature conversion (°C / °F)

\- Wind speed conversion (km/h / mph)

\- Interactive weather charts using Chart.js

\- Recent search history stored in SQLite

\- Responsive dark-themed user interface



\## Tech Stack



\*\*Frontend\*\*

\- HTML5

\- CSS3

\- Vanilla JavaScript

\- Chart.js



\*\*Backend\*\*

\- Node.js

\- Express.js

\- ES Modules



\*\*Database\*\*

\- SQLite

\- better-sqlite3



\*\*APIs\*\*

\- Open-Meteo Weather API

\- Open-Meteo Geocoding API

\- Open-Meteo Air Quality API

\- BigDataCloud Reverse Geocoding API



\## Project Structure



```text

weather-dashboard/

├── public/

│   ├── css/

│   │   └── style.css

│   ├── js/

│   │   └── app.js

│   └── index.html

├── server/

│   ├── config/

│   ├── controllers/

│   ├── db/

│   ├── middleware/

│   ├── repositories/

│   ├── routes/

│   ├── services/

│   ├── utils/

│   ├── app.js

│   └── server.js

├── .gitignore

├── package.json

└── package-lock.json

```



\## Installation and Setup



\### 1. Clone the repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

```



\### 2. Navigate to the project



```bash

cd weather-dashboard

```



\### 3. Install dependencies



```bash

npm install

```



\### 4. Start the application



```bash

npm start

```



\### 5. Open in browser



```text

http://localhost:3000

```



\## API Endpoints



| Method | Endpoint | Description |

|---|---|---|

| GET | `/api/health` | Check server status |

| GET | `/api/geocode?q=city` | Search for a city |

| GET | `/api/weather` | Fetch weather information |

| GET | `/api/history` | Retrieve recent searches |



\## Data Sources



Weather information is provided by Open-Meteo. Reverse geocoding is provided by BigDataCloud.



\## License



This project is available for educational and portfolio purposes.

