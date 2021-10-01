import { getForecast, createWeatherIcon } from './weather.services.js';
import { getGeolocation, reverseLocation } from './map.services.js';
import { locationStorage, forecastStorage } from './localStorage.js';

const APP = {
  init: () => {
    document
      .getElementById('getWeather')
      .addEventListener('click', APP.searchLocation);
    document
      .getElementById('useLocation')
      .addEventListener('click', APP.getLocation);
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', APP.weatherNav);
    });
    APP.lastWeather();
  },
  searchLocation: async function (ev) {
    ev.preventDefault();
    let query = document.getElementById('city').value.trim();
    let location = document.querySelector('.location');

    if (!query) return false;
    let coord = await getGeolocation(query);
    let reverse = await reverseLocation(coord.lat, coord.lon);
    location.innerHTML = `${reverse.address.city}, ${reverse.address.state} ${reverse.address.country}`;
    let forecast = await getForecast({ coord });
    await APP.showForecast({ forecast });
    await locationStorage({ reverse });
    await forecastStorage({ forecast });
    setInterval(function () {
      return APP.showForecast({ forecast });
    }, 60 * 1000);
  },
  getLocation: async function (ev) {
    ev.preventDefault();
    let options = {
      enableHighAccuracy: true,
      timeout: 1000 * 10, //10 seconds
      maximumAge: 1000 * 60 * 5, //5 minutes
    };
    navigator.geolocation.getCurrentPosition(APP.ftw, APP.wtf, options);
  },
  ftw: async function (position) {
    //position found
    let reverse = await reverseLocation(
      position.coords.latitude.toFixed(2),
      position.coords.longitude.toFixed(2)
    );
    let location = document.querySelector('.location');
    location.innerHTML = `${reverse.address.city}, ${reverse.address.state} ${reverse.address.country}`;
    let forecast = await getForecast('metric', { reverse });
    await APP.showForecast({ forecast });
    await locationStorage({ reverse });
    await forecastStorage({ forecast });
  },
  wtf: (err) => {
    //location failed
    console.error(err);
  },
  showForecast: async function (data) {
    let mainCard = document.querySelector('.mainCard');
    let cards = document.querySelector('.cards');
    let hourly = document.querySelector('.hourly');
    let weekly = document.querySelector('.weekly');
    let tzn = data.forecast.timezone;
    let current = data.forecast.current;
    let dt = new Date(current.dt * 1000);
    let imageId = current.weather[0].icon;
    let image = createWeatherIcon(imageId);

    mainCard.innerHTML = `<div class="card main-card">
              <div class="col card-image" >
                  <img class="" src="${image}@4x.png" class="img-fluid" alt="${
      current.weather[0].description
    }">
              </div>
              <div class="col">
                  <div class="card-block px-2">
                      <h4 class="card-title main">${dt.toLocaleDateString(
                        navigator.language,
                        {
                          timeZone: tzn,
                          dateStyle: 'long',
                        }
                      )}</h4>
                      <p class="card-text current">Current: ${parseInt(
                        current.temp
                      )}&deg;C </p>
                      <p class="card-text">Feels Like: ${parseInt(
                        current.feels_like
                      )}&deg;C </p>
                      <p class="card-text">Humidity: ${parseInt(
                        current.humidity
                      )}&deg;C </p>
                      <p class="card-text">UV Index: ${parseInt(
                        current.uvi
                      )}&deg;C </p>
                    </div>
                </div>
            </div>`;
    cards.innerHTML = data.forecast.daily
      .map((day, idx) => {
        if (idx > 0 && idx <= 2) {
          let dt = new Date(day.dt * 1000);
          let imageId = day.weather[0].icon;
          let image = createWeatherIcon(imageId);
          return `<div class="card second-cards">
              <div class="col card-image">
                  <img class="align-middle" src="${image}@2x.png" class="img-fluid" alt="${
            day.weather[0].description
          }">
              </div>
              <div class="col">
                  <div class="card-block">
                      <h4 class="card-title">${dt.toLocaleDateString(
                        navigator.language,
                        {
                          timeZone: tzn,
                          dateStyle: 'long',
                        }
                      )}</h4>
                      <div class="weather-stats">
                      <p class="card-text">High ${parseInt(
                        day.temp.max
                      )}&deg;C </p>
                      <p class="card-text">Low ${parseInt(
                        day.temp.min
                      )}&deg;C </p>
                        <p class="card-text">High Feels like ${parseInt(
                          day.feels_like.day
                        )}&deg;C</p>
                        <p class="card-text">Precipitation ${parseInt(
                          day.pop * 100
                        )}%</p>
                        </div>
          </div>
        </div>
    </div>`;
        }
      })
      .join(' ');
    hourly.innerHTML = data.forecast.hourly
      .map((hour, idx) => {
        if (idx <= 5) {
          let dt = new Date(hour.dt * 1000);
          let imageId = hour.weather[0].icon;
          let image = createWeatherIcon(imageId);
          return `<div class="card small-cards">
            <div class="col card-image" >
                <img class="align-middle" src="${image}@2x.png" class="img-fluid" alt="${
            hour.weather[0].description
          }">
            </div>
            <div class="col">
                <div class="card-block">
                    <h4 class="card-title">${dt.toLocaleTimeString(
                      navigator.language,
                      {
                        timeZone: tzn,
                        hour: 'numeric',
                      }
                    )}</h4>
                    <p class="card-text">Currently ${parseInt(
                      hour.temp
                    )}&deg;C </p>
                    <p class="card-text">Feels like ${parseInt(
                      hour.feels_like
                    )}&deg;C </p>
                      <p class="card-text">Precipitation ${parseInt(
                        hour.pop * 100
                      )}%</p>
                      <p class="card-text">Humidity ${parseInt(
                        hour.humidity
                      )}%</p>
                  </div>
              </div>
            </div>`;
        }
      })
      .join(' ');
    weekly.innerHTML = data.forecast.daily
      .map((day, idx) => {
        if (idx <= 5) {
          let dt = new Date(day.dt * 1000);
          let imageId = day.weather[0].icon;
          let image = createWeatherIcon(imageId);
          return `<div class="card small-cards">
            <div class="col card-image" >
                <img class="align-middle" src="${image}@2x.png" class="img-fluid" alt="${
            day.weather[0].description
          }">
            </div>
            <div class="col">
                <div class="card-block">
                    <h4 class="card-title center">${dt.toLocaleDateString(
                      navigator.language,
                      {
                        timeZone: tzn,
                        dateStyle: 'long',
                      }
                    )}</h4>
                    <p class="card-text">High ${parseInt(
                      day.temp.max
                    )}&deg;C </p>
                    <p class="card-text">Low ${parseInt(
                      day.temp.min
                    )}&deg;C </p>
                      <p class="card-text">Precipitation ${parseInt(
                        day.pop * 100
                      )}%</p>
                  </div>
              </div>
            </div>`;
        }
      })
      .join(' ');
  },
  weatherNav: (ev) => {
    ev.preventDefault();
    let current = ev.target.getAttribute('data-target');
    document.querySelector('.active').classList.remove('active');
    document.getElementById(current).classList.add('active');
  },
  lastWeather: function () {
    if (localStorage.getItem('forecast') && localStorage.getItem('location')) {
      let locationData = JSON.parse(localStorage.getItem('location'));
      let forecastData = JSON.parse(localStorage.getItem('forecast'));
      let location = document.querySelector('.location');
      location.innerHTML = `${locationData.reverse.address.city}, ${locationData.reverse.address.state} ${locationData.reverse.address.country}`;
      //use location from storage to get data
      APP.showForecast(forecastData);
    }
  },
};

APP.init();
