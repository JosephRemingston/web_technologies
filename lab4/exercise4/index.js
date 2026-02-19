// Configuration
const CONFIG = {
    OPENWEATHER_API_KEY: 'c30712408090a39f33fc6ab161647431', // Replace with your OpenWeather API key
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    MOCK_DATA_URL: 'weather-data.json',
    USE_LIVE_API: false
};

// Cache for last searched city
let lastSearchedCity = null;
let lastWeatherData = null;
let mockWeatherData = null;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorTitle = document.getElementById('errorTitle');
const errorText = document.getElementById('errorText');
const weatherDisplay = document.getElementById('weatherDisplay');
const apiModeToggle = document.getElementById('apiModeToggle');
const apiModeText = document.getElementById('apiModeText');
const apiModeHint = document.getElementById('apiModeHint');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
apiModeToggle.addEventListener('change', toggleApiMode);

// Initialize - Load mock data
window.addEventListener('load', loadMockData);

// Toggle between Mock and Live API
function toggleApiMode() {
    CONFIG.USE_LIVE_API = apiModeToggle.checked;
    
    if (CONFIG.USE_LIVE_API) {
        apiModeText.textContent = 'Live API Mode';
        apiModeHint.textContent = '(Real OpenWeather API)';
        
        if (CONFIG.OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
            showError(
                'API Key Required',
                'Please add your OpenWeather API key in index.js to use Live API mode. Switch back to Mock mode for testing.'
            );
        }
    } else {
        apiModeText.textContent = 'Mock API Mode';
        apiModeHint.textContent = '(Local testing - no API key needed)';
    }
}

// Load mock weather data
function loadMockData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', CONFIG.MOCK_DATA_URL, true);
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                mockWeatherData = JSON.parse(xhr.responseText);
                console.log('Mock weather data loaded successfully');
            } catch (error) {
                console.error('Error parsing mock data:', error);
            }
        }
    };
    
    xhr.onerror = function() {
        console.error('Error loading mock data');
    };
    
    xhr.send();
}

// Handle search
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Empty Input', 'Please enter a city name');
        return;
    }
    
    searchCity(city);
}

// Search city weather
function searchCity(cityName) {
    // Update input field
    cityInput.value = cityName;
    
    // Cache the search
    lastSearchedCity = cityName;
    
    // Hide previous results and errors
    hideError();
    hideWeather();
    showLoading();
    
    if (CONFIG.USE_LIVE_API) {
        fetchWeatherFromAPI(cityName);
    } else {
        fetchWeatherFromMock(cityName);
    }
}

// Fetch weather from Live API
function fetchWeatherFromAPI(cityName) {
    // Check API key
    if (CONFIG.OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        hideLoading();
        showError(
            'API Key Missing',
            'Please configure your OpenWeather API key in index.js or switch to Mock API mode'
        );
        return;
    }
    
    // Build URL with query parameters
    const url = `${CONFIG.OPENWEATHER_BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onload = function() {
        hideLoading();
        
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                lastWeatherData = data;
                displayWeather(data);
            } catch (error) {
                showError(
                    'Parse Error',
                    'Failed to parse weather data. Please try again.'
                );
                console.error('JSON Parse Error:', error);
            }
        } else if (xhr.status === 404) {
            showError(
                'City Not Found',
                `Unable to find weather data for "${cityName}". Please check the spelling and try again.`
            );
        } else if (xhr.status === 401) {
            showError(
                'Authentication Error',
                'Invalid API key. Please check your OpenWeather API key.'
            );
        } else if (xhr.status >= 500) {
            showError(
                'Server Error',
                'Weather service is currently unavailable. Please try again later.'
            );
        } else {
            showError(
                'Request Failed',
                `Request failed with status ${xhr.status}. Please try again.`
            );
        }
    };
    
    xhr.onerror = function() {
        hideLoading();
        showError(
            'Network Error',
            'Unable to connect to weather service. Please check your internet connection and try again.'
        );
    };
    
    xhr.send();
}

// Fetch weather from Mock data
function fetchWeatherFromMock(cityName) {
    // Simulate API delay
    setTimeout(() => {
        hideLoading();
        
        if (!mockWeatherData) {
            showError(
                'Data Not Loaded',
                'Mock weather data is not available. Please reload the page.'
            );
            return;
        }
        
        // Search for city in mock data (case-insensitive)
        const cityKey = cityName.toLowerCase();
        const weatherData = mockWeatherData.cities[cityKey];
        
        if (weatherData) {
            lastWeatherData = weatherData;
            displayWeather(weatherData);
        } else {
            showError(
                'City Not Found',
                `"${cityName}" is not available in mock data. Available cities: London, New York, Tokyo, Paris, Sydney, Dubai.`
            );
        }
    }, 800); // Simulate network delay
}

// Display weather data
function displayWeather(data) {
    // Update location info
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('countryName').textContent = data.sys.country;
    document.getElementById('updateTime').textContent = new Date().toLocaleTimeString();
    
    // Update temperature
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    
    // Update weather condition
    document.getElementById('weatherMain').textContent = data.weather[0].main;
    document.getElementById('weatherDescription').textContent = 
        data.weather[0].description.charAt(0).toUpperCase() + 
        data.weather[0].description.slice(1);
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('weatherIcon').alt = data.weather[0].description;
    
    // Update details
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('tempRange').textContent = 
        `${Math.round(data.main.temp_min)} / ${Math.round(data.main.temp_max)} °C`;
    
    // Update sunrise/sunset
    document.getElementById('sunrise').textContent = 
        new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunset').textContent = 
        new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Show weather display
    weatherDisplay.classList.remove('hidden');
    
    // Update background based on weather
    updateBackground(data.weather[0].main);
}

// Update background based on weather condition
function updateBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; // Remove all classes
    
    const weatherClass = weatherCondition.toLowerCase();
    body.classList.add(`weather-${weatherClass}`);
}

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(title, message) {
    errorTitle.textContent = title;
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Hide weather display
function hideWeather() {
    weatherDisplay.classList.add('hidden');
}

// Retry last search (using cached city)
function retryLastSearch() {
    if (lastSearchedCity) {
        searchCity(lastSearchedCity);
    }
}
