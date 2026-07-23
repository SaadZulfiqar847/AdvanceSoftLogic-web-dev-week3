import { getCoordinates, getWeather } from './api.js';
import { showLoading, showError, showWeather, renderRecentSearches } from './ui.js';

// Key used to store recent searches in localStorage, kept as a constant
// so the string literal only exists in one place.
const STORAGE_KEY = 'recentSearches';
const MAX_RECENT = 5;

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');

// Runs the full search flow: geocode the city, fetch its weather,
// update the UI, and save it to recent searches. Used both for manual
// searches and for clicking a recent search item.
async function searchCity(cityName) {
    showLoading();

    try {
        const location = await getCoordinates(cityName);
        const weatherData = await getWeather(location.latitude, location.longitude);

        showWeather(location, weatherData);
        saveRecentSearch(location);
    } catch (error) {
        // error.message comes from the specific throw in api.js,
        // so the user sees a relevant message instead of a generic one
        showError(error.message);
    }
}

// Reads recent searches from localStorage. Returns an empty array
// if nothing has been saved yet, so callers never have to check for null.
function getRecentSearches() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Adds a new search to the front of the recent list, removes duplicates
// of the same city, and trims the list down to MAX_RECENT entries.
function saveRecentSearch(location) {
    let recent = getRecentSearches();

    recent = recent.filter((city) => city.name !== location.name || city.country !== location.country);
    recent.unshift(location);
    recent = recent.slice(0, MAX_RECENT);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    renderRecentSearches(recent, handleRecentClick);
}

// Called when a recent search item is clicked — reloads that city's weather.
function handleRecentClick(city) {
    searchCity(city.name);
}

// Handles the search form submission.
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();
    if (cityName === '') {
        return;
    }

    searchCity(cityName);
    cityInput.value = '';
});

// On page load, show whatever recent searches were saved from before.
renderRecentSearches(getRecentSearches(), handleRecentClick);