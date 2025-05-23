document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value;
            const email = document.getElementById("regEmail").value;
            const password = document.getElementById("regPassword").value;

            const res = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();
            alert(data.message);
            if (res.ok) window.location.href = data.redirect;
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            const res = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            alert(data.message);
            if (res.ok) window.location.href = data.redirect;
        });
    }
});

function generateQRCode() {
    let input = document.getElementById("qr-input").value;
    let qrImage = document.getElementById("qr-image");

    if (input.trim() === "") {
        alert("Enter a valid URL!");
        return;
    }

    qrImage.style.display = "block";
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(input)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    window.getWeather = async function () {
        const city = document.getElementById("cityInput").value;
        if (!city) return alert("Enter the city");

        try {
            const weatherRes = await fetch(`/weather?city=${city}`);
            const weatherData = await weatherRes.json();
            document.getElementById("weather").innerText = `Temperature: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}`;

            const currencyRes = await fetch(`/currency?country=${weatherData.sys.country}`);

            const timeRes = await fetch(`/time?city=${city}`);
            const timeData = await timeRes.json();
            document.getElementById("time").innerText = `Время в городе: ${timeData.datetime}`;
        } catch (error) {
            alert("Errrrorrrrr");
        }
    };
});

const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const aqiResult = document.getElementById('aqiResult');
const timeResult = document.getElementById('timeResult');
const currencyResult = document.getElementById('currencyResult');
let map;

const openWeatherApiKey = 'c350104bfeadd8ce6381bdbd1a058ed1';

function initMap(lat, lon) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([lat, lon]).addTo(map)
        .openPopup();
}

async function fetchWeather(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();

        displayWeather(data);
        initMap(data.coord.lat, data.coord.lon);
        fetchAQI(data.coord.lat, data.coord.lon);
        fetchTime(data.coord.lat, data.coord.lon);
        fetchCurrency(data.sys.country);
    } catch (error) {
        weatherResult.innerHTML = `<p>Error</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather, wind, sys, coord } = data;
    const countryCode = sys.country.toLowerCase();
    const flagUrl = `https://flagsapi.com/${sys.country}/flat/64.png`;

    weatherResult.innerHTML = `
        <h2>${name}, ${sys.country}</h2>
        <img src="${flagUrl}" alt="Flag ${sys.country}" width="150" height="120">
        <p>Prеssurе: ${main.pressure} hPa</p>
        <p>Wind speed: ${wind.speed} m/s</p>
        <p>Coordinatеs: ${coord.lat}, ${coord.lon}</p>
        <p>Wеthеr: ${weather[0].description}</p>
        <p>Temprrature: ${main.temp}°C</p>
        <p>Fееls likе: ${main.feels_like}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        
    `;
}

async function fetchAQI(lat, lon) {
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`;

    try {
        const response = await fetch(aqiUrl);
        const data = await response.json();
        displayAQI(data);
    } catch (error) {
        aqiResult.innerHTML = `<p>Errоr with getting АQI</p>`;
    }
}

function displayAQI(data) {
    const aqi = data.list[0].main.aqi;
    const aqiLevels = ["Gооd", "Nоrmal", "Stablе", "Bаd", "Dаngеrоus"];
    aqiResult.innerHTML = `<p>Air Quality Index: ${aqi} - ${aqiLevels[aqi - 1]}</p>`;
}

async function fetchTime(lat, lon) {
    const timeUrl = `https://www.timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`;

    try {
        const response = await fetch(timeUrl);
        const data = await response.json();
        timeResult.innerHTML = `<p>Current time: ${data.time}</p>`;
    } catch (error) {
        timeResult.innerHTML = `<p>Error with catching the time, wait a sec</p>`;
    }
}

async function fetchCurrency(countryCode) {
    const currencyUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;

    try {
        const response = await fetch(currencyUrl);
        const data = await response.json();
        const currencyInfo = Object.values(data[0].currencies)[0];

        currencyResult.innerHTML = `<p><strong>Currency:</strong> ${currencyInfo.name} (${currencyInfo.symbol})</p>`;
    } catch (error) {
        currencyResult.innerHTML = `<p>Error with cathing the currency</p>`;
    }
}

weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        weatherResult.innerHTML = `<p>Enter the city</p>`;
    }
});
