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
        if (!city) return alert("Введите город!");

        try {
            const weatherRes = await fetch(`/weather?city=${city}`);
            const weatherData = await weatherRes.json();
            document.getElementById("weather").innerText = `Температура: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}`;

            const currencyRes = await fetch(`/currency?country=${weatherData.sys.country}`);
            const currencyData = await currencyRes.json();
            document.getElementById("currency").innerText = `Курс валюты: 1 USD = ${currencyData.data.USD.value} ${weatherData.sys.country}`;

            const timeRes = await fetch(`/time?city=${city}`);
            const timeData = await timeRes.json();
            document.getElementById("time").innerText = `Время в городе: ${timeData.datetime}`;
        } catch (error) {
            alert("Ошибка загрузки данных");
        }
    };
});