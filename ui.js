// Grab references to all the DOM elements we'll need to update.
// Doing this once at the top avoids repeated document.querySelector calls.
const loadingState = document.getElementById('loading-state');
const weatherResult = document.getElementById('weather-result');
const errorMessage = document.getElementById('error-message');
const locationName = document.getElementById('location-name');
const temperature = document.getElementById('temperature');
const conditions = document.getElementById('conditions');
const wind = document.getElementById('wind');
const forecastEl = document.getElementById('forecast');
const recentList = document.getElementById('recent-list');

// Maps Open-Meteo's numeric weather codes to a short human-readable label.
// Open-Meteo only gives codes, not text, so this translation has to happen somewhere.
const WEATHER_CODES = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Snow',
    80: 'Rain showers',
    95: 'Thunderstorm'
};

// Shows the loading message and hides everything else while a request is in flight.
export function showLoading() {
    loadingState.classList.remove('hidden');
    weatherResult.classList.add('hidden');
    errorMessage.textContent = '';
}

// Displays a user-friendly error message and hides the loading/result sections.
export function showError(message) {
    loadingState.classList.add('hidden');
    weatherResult.classList.add('hidden');
    errorMessage.textContent = message;
}

// Renders the fetched weather data into the page and reveals the result section.
export function showWeather(location, weatherData) {
    loadingState.classList.add('hidden');
    errorMessage.textContent = '';

    locationName.textContent = `${location.name}, ${location.country}`;
    temperature.textContent = `Temperature: ${weatherData.current.temperature_2m}°C`;
    conditions.textContent = `Conditions: ${WEATHER_CODES[weatherData.current.weather_code] || 'Unknown'}`;
    wind.textContent = `Wind: ${weatherData.current.wind_speed_10m} km/h`;

    renderForecast(weatherData.daily);

    weatherResult.classList.remove('hidden');
}

// Builds a short forecast card for each of the next few days.
// Kept separate from showWeather so each function has one clear job.
function renderForecast(daily) {
    forecastEl.innerHTML = '';

    for (let i = 0; i < daily.time.length; i++) {
        const day = document.createElement('div');
        day.classList.add('forecast-day');

        const date = new Date(daily.time[i]);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

        day.innerHTML = `
            <p>${dayLabel}</p>
            <p>${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°</p>
        `;

        forecastEl.appendChild(day);
    }
}

// Renders the list of recent searches as clickable items.
// onCityClick is a callback passed in from app.js, so ui.js doesn't need
// to know anything about how searches are triggered.
export function renderRecentSearches(cities, onCityClick) {
    recentList.innerHTML = '';

    cities.forEach((city) => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener('click', () => onCityClick(city));
        recentList.appendChild(li);
    });
}