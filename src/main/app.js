document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '252be32884bd006c093704edaefa47e0'; //API Key obtained from openweathermap.org
    const apiUrl = 'https://api.openweathermap.org/data/2.5/weather'; //API URL for getting weather data
    const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast'; //API URL for getting next-5 day forecast

    const searchButton = document.getElementById('search-button');
    const currentLocationButton = document.getElementById('current-location-button');
    const cityInput = document.getElementById('city-input');
    const weatherDataDiv = document.getElementById('weather-data');
    const recentCitiesDropdown = document.getElementById('recent-cities-dropdown');
    const webpageDiv = document.querySelector('.webpage'); // Select the div with class 'webpage'

    searchButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            fetchWeatherData(cityName); //Fetch weather data
            fetchExtendedForecast(cityName); // Fetch extended forecast data
            addCityToRecent(cityName); //Updating local storage to have recent city names
        } else {
            alert('Please enter a city name.');
        }
    });

    currentLocationButton.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherDataByLocation(latitude, longitude, cityName);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    recentCitiesDropdown.addEventListener('change', () => {
        const cityName = recentCitiesDropdown.value;
        if (cityName) {
            fetchWeatherData(cityName);
            fetchExtendedForecast(cityName); // Fetch extended forecast data
        }
    });

    function addCityToRecent(cityName) {
        let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        if (!recentCities.includes(cityName)) {
            recentCities.push(cityName);
            localStorage.setItem('recentCities', JSON.stringify(recentCities));
            updateRecentCitiesDropdown();
        }
    }

    function updateRecentCitiesDropdown() {
        let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
        recentCitiesDropdown.innerHTML = '<option value="">Select a recent city</option>';
        recentCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    }

    async function fetchWeatherData(city) {
        try {
            const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            displayWeatherData(data);
            webpageDiv.innerText = `Weather data fetched for ${city}`; // Set text content of the div
        } catch (error) {
            alert(error.message);
        }
    }

    async function fetchWeatherDataByLocation(lat, lon, city) {
        try {
            const response = await fetch(`${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('Location not found');
            const data = await response.json();
            displayWeatherData(data);
            webpageDiv.innerText = `Weather data fetched for your current location (${city})`; //text content for the div
        } catch (error) {
            alert(error.message);
        }
    }

    async function fetchExtendedForecast(city) {
        try {
            const response = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            displayExtendedForecast(data);
        } catch (error) {
            alert(error.message);
        }
    }

    function displayWeatherData(data) {
        const { name, main, weather, wind } = data;
        weatherDataDiv.innerHTML = `
            <div class="bg-blue-200 p-4 rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold mb-2">${name} (${new Date().toLocaleDateString()})</h2>
                <p>Temperature: ${main.temp}°C</p>
                <p>Wind: ${wind.speed} m/s</p>
                <p>Humidity: ${main.humidity}%</p>
                <p>Condition: ${weather[0].description}</p>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
            </div>
        `;
    }

    function displayExtendedForecast(data) {
        const extendedForecastDiv = document.createElement('div');
        extendedForecastDiv.classList.add('extended-forecast');
    
        //an object to keep track of the days that have already been added
        const daysAdded = {};
    
        extendedForecastDiv.innerHTML = `
            <h3 class="text-xl font-bold mt-6">5-Day Forecast</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
                ${data.list.filter(forecast => {
                    const date = new Date(forecast.dt * 1000).toLocaleDateString();
                    // Only add forecast if the day has not been added yet
                    if (!daysAdded[date]) {
                        daysAdded[date] = true;
                        return true;
                    }
                    return false;
                }).map(forecast => {
                    const date = new Date(forecast.dt * 1000).toLocaleDateString();
                    return `
                        <div class="forecast-day bg-white p-4 rounded shadow-lg text-center">
                            <p class="font-semibold">${date}</p>
                            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                            <p>Temp: ${forecast.main.temp}°C</p>
                            <p>Wind: ${forecast.wind.speed} m/s</p>
                            <p>Humidity: ${forecast.main.humidity}%</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    
        weatherDataDiv.appendChild(extendedForecastDiv);
    }

    // Initialize recent cities dropdown
    updateRecentCitiesDropdown();
});
