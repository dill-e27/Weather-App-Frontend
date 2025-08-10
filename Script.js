//Configuration and Global Variables
let currentCity = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const backgroundImages = [
    'Pics/cloudy-day.jpg', 'Pics/cloudy-night.jpg',
    'Pics/rainy-day.jpg', 'Pics/rainy-night.jpg',
    'Pics/snowy-day.jpg', 'Pics/snowy-night.jpg',
    'Pics/sunny-day.jpg', 'Pics/sunny-night.jpg'
];

//Set Random Background Imagess
function setRandomBackground() {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedImage = backgroundImages[randomIndex];
    document.body.style.backgroundImage = url('${selectedImage}');
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
}

//DOMContentLoaded Setup
document.addEventListener('DOMContentLoaded', () => {
    setRandomBackground();
    renderFavorites();

    const weatherContainer = document.getElementById('weather-container');

    if (window.innerWidth <= 500) {
        weatherContainer.style.height = 'fit-content';
    }

    weatherContainer.classList.add('hide-scrollbars');
    favoriteBtn.disabled = true;
});

//Event Listener: Press Enter to Search
document.getElementById('city').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

//Fetch and Display Weather Data
function getWeather() {
    const city = document.getElementById('city').value;

    if (!city) {
        alert('Please enter a city');
        return;
    }

    fetch(https://weather-app-backend-g5xy.onrender.com/weather?city=${encodeURIComponent(city)})
        .then(res => res.json())
        .then(data => {
            displayWeather(data.current);
            displayHourlyForecast(data.forecast.list);
            displayWeeklyForecast(data.forecast.list);
        })
        .catch(() => alert('Error fetching weather.'));
}

//Display Current Weather
function displayWeather(data) {
    const tempDiv = document.getElementById('temp-div');
    const infoDiv = document.getElementById('weather-info');
    const icon = document.getElementById('weather-icon');
    const hourlyDiv = document.getElementById('hourly-forecast');

    infoDiv.innerHTML = '';
    hourlyDiv.innerHTML = '';
    tempDiv.innerHTML = '';

    if (data.cod === '404') {
        infoDiv.innerHTML = <p>${data.message}</p>;
        return;
    }

    currentCity = data.name;
    updateFavoriteIcon();

    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconUrl = https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png;

    tempDiv.innerHTML = <p>${temperature}°C</p>;
    infoDiv.innerHTML = <p>${currentCity}</p><p>${description}</p>;
    icon.src = iconUrl;
    icon.alt = description;
    showImage();

    document.getElementById('weekly-forecast-section').style.display = 'block';
    document.getElementById('weather-container').classList.remove('hide-scrollbars');

    if (window.innerWidth <= 500) {
        document.getElementById('weather-container').style.height = '30em';
    }

    favoriteBtn.disabled = false;
}

//Display Hourly Forecast
function displayHourlyForecast(hourlyData) {
    const hourlyDiv = document.getElementById('hourly-forecast');
    const next8 = hourlyData.slice(0, 8);

    next8.forEach(item => {
        const time = new Date(item.dt * 1000);
        const hour = (time.getHours() % 12 || 12) + (time.getHours() >= 12 ? ' PM' : ' AM');
        const temp = Math.round(item.main.temp - 273.15);
        const icon = https://openweathermap.org/img/wn/${item.weather[0].icon}.png;

        hourlyDiv.innerHTML += 
            <div class="hourly-item">
                <span>${hour}</span>
                <img src="${icon}" alt="Hourly Icon">
                <span>${temp}°C</span>
            </div>
        ;
    });
}

//Display Weekly Forecast
function displayWeeklyForecast(hourlyData) {
    const weeklyDiv = document.getElementById('weekly-forecast');
    weeklyDiv.innerHTML = '';

    const grouped = {};

    hourlyData.forEach(item => {
        const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        grouped[day] = grouped[day] || [];
        grouped[day].push(item);
    });

    Object.entries(grouped).slice(0, 7).forEach(([day, items]) => {
        const avgTemp = Math.round(
            items.reduce((sum, i) => sum + i.main.temp, 0) / items.length - 273.15
        );
        const icon = https://openweathermap.org/img/wn/${items[0].weather[0].icon}.png;
        const date = new Date(items[0].dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        weeklyDiv.innerHTML += 
            <div class="weekly-item">
                <span>${day}</span>
                <span>${date}</span>
                <img src="${icon}" alt="Icon">
                <span>${avgTemp}°C</span>
            </div>
        ;
    });
}

//Show Weather Icon
function showImage() {
    document.getElementById('weather-icon').style.display = 'block';
}

//Favorite Button Setup
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesBar = document.getElementById('favorites-bar');
const warn = document.getElementById('max-fav-warning');
const warnList = document.getElementById('warn-favorites-list');

favoriteBtn.addEventListener('click', () => {
    toggleFavorite(currentCity);
});

//Favorite City Logic
function toggleFavorite(city) {
    if (favorites.includes(city)) {
        favorites = favorites.filter(c => c !== city);
    } else {
        if (favorites.length >= 3) {
            showWarn();
            return;
        }
        favorites.push(city);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteIcon();
    renderFavorites();
}

function updateFavoriteIcon() {
    favoriteBtn.classList.remove('favorite');
    if (favorites.includes(currentCity)) {
        favoriteBtn.classList.add('favorite');
    }
}

function renderFavorites() {
    favoritesBar.innerHTML = '';
    favorites.forEach(city => {
        const tag = document.createElement('span');
        tag.className = 'favorite-tag';
        tag.innerText = city;
        tag.onclick = () => {
            document.getElementById('city').value = city;
            getWeather();
        };
        favoritesBar.appendChild(tag);
    });
}

//Max Favorites Warning Modal
function showWarn() {
    warn.classList.remove('hidden');
    warnList.innerHTML = '';

    favorites.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'warn-fav-btn';
        btn.innerText = city;
        btn.onclick = () => {
            favorites = favorites.filter(c => c !== city);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            warn.classList.add('hidden');
            toggleFavorite(currentCity);
        };
        warnList.appendChild(btn);
    });
}

function closeWarn() {
    warn.classList.add('hidden');
}

//Responsive Resize Behavior
window.addEventListener('resize', () => {
    const container = document.getElementById('weather-container');
    const hasWeather = document.getElementById('weather-info').innerHTML.trim() !== '';

    if (window.innerWidth <= 500) {
        container.style.height = hasWeather ? '30em' : 'fit-content';
    } else {
        container.style.height = '';
    }
});
