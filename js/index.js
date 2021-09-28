import {
  getForecast as getForecast,
  createWeatherIcon,
} from './weather.services.js';
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
  },
  searchLocation: async function (ev) {
    ev.preventDefault();
    let query = document.getElementById('city').value.trim();
    if (!query) return false;
    let coord = await getGeolocation(query);
    await locationStorage({ coord });
    let reverse = await reverseLocation(coord.lat, coord.lon);
    let location = document.querySelector('.location');
    location.innerHTML = `${reverse.data.address.city}, ${reverse.data.address.state} ${reverse.data.address.country}`;
    let forecast = await getForecast({ coord });
    await APP.showForecast({ forecast });
    await forecastStorage({ forecast });
    console.log(forecast);
  },
  getLocation: async function (ev) {
    let options = {
      enableHighAccuracy: true,
      timeout: 1000 * 10, //10 seconds
      maximumAge: 1000 * 60 * 5, //5 minutes
    };
    navigator.geolocation.getCurrentPosition(APP.ftw, APP.wtf, options);
  },
  ftw: async function (position) {
    let reverse = await reverseLocation(
      position.coords.latitude.toFixed(2),
      position.coords.longitude.toFixed(2)
    );
    console.log({ reverse });
    let location = document.querySelector('.location');
    location.innerHTML = `${reverse.data.address.city}, ${reverse.data.address.state} ${reverse.data.address.country}`;
    await locationStorage({ reverse });
    let forecast = await getForecast('metric', { reverse });
    await forecastStorage({ forecast });
    await APP.showForecast({ forecast });
    console.log(forecast);
  },
  wtf: (err) => {
    //geolocation failed
    console.error(err);
  },
  showForecast: async function (data) {
    let mainCard = document.querySelector('.mainCard');
    let cards = document.querySelector('.cards');
    let hourly = document.querySelector('#hourly');
    let weekly = document.querySelector('#weekly');
    mainCard.innerHTML = data.forecast.daily
      .map((day, idx) => {
        if (idx == 0) {
          let dt = new Date(day.dt * 1000); //timestamp * 1000
          return `<div class="card" style="width: 99%">
          <div class="row no-gutters">
              <div class="col center" >
                  <img class="align-middle" src="http://openweathermap.org/img/wn/${
                    day.weather[0].icon
                  }@4x.png" class="img-fluid" alt="${
            day.weather[0].description
          }">
              </div>
              <div class="col">
                  <div class="card-block px-2">
                      <h4 class="card-title center">${dt.toDateString()}</h4>
                      <p class="card-text">High ${day.temp.max}&deg;C </p>
                      <p class="card-text">Low ${day.temp.min}&deg;C </p>
                        <p class="card-text">High Feels like ${
                          day.feels_like.day
                        }&deg;C</p>
                        <p class="card-text">Humidity ${day.humidity}%</p>
                        <p class="card-text">UV Index ${day.uvi}</p>
                        <p class="card-text">Precipitation ${day.pop * 100}%</p>
                  </div>
              </div>
          </div>
    </div>`;
        }
      })
      .join(' ');
    cards.innerHTML = data.forecast.daily
      .map((day, idx) => {
        if (idx > 0 && idx <= 2) {
          let dt = new Date(day.dt * 1000); //timestamp * 1000
          return `<div class="col" style="display:inline-block; width:49%; margin:0;">
          <div class="card" style="width:100%;">
          <div class="row no-gutters">
              <div class="col center" >
                  <img class="align-middle" src="http://openweathermap.org/img/wn/${
                    day.weather[0].icon
                  }@4x.png" class="img-fluid" alt="${
            day.weather[0].description
          }">
              </div>
              <div class="col">
                  <div class="card-block px-2">
                      <h4 class="card-title center">${dt.toDateString()}</h4>
                      <p class="card-text">High ${day.temp.max}&deg;C </p>
                      <p class="card-text">Low ${day.temp.min}&deg;C </p>
                        <p class="card-text">High Feels like ${
                          day.feels_like.day
                        }&deg;C</p>
                        <p class="card-text">Precipitation ${day.pop * 100}%</p>
                  </div>
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
          let dt = new Date(hour.dt * 1000); //timestamp * 1000
          return `<div class="col" style="display:inline-block; width:100%; margin:0;">
        <div class="card" style="width:100%;">
        <div class="row no-gutters">
            <div class="col center" >
                <img class="align-middle" src="http://openweathermap.org/img/wn/${
                  hour.weather[0].icon
                }@2x.png" class="img-fluid" alt="${
            hour.weather[0].description
          }">
            </div>
            <div class="col">
                <div class="card-block px-2">
                    <h4 class="card-title center">${dt.toLocaleTimeString()}</h4>
                    <p class="card-text">Currently ${hour.temp}&deg;C </p>
                    <p class="card-text">Feels like ${
                      hour.feels_like
                    }&deg;C </p>
                      <p class="card-text">Precipitation ${hour.pop * 100}%</p>
                      <p class="card-text">Humidity ${hour.humidity}%</p>
                </div>
            </div>
        </div>
      </div>
  </div>`;
        }
      })
      .join(' ');
    weekly.innerHTML = data.forecast.daily
      .map((day, idx) => {
        if (idx <= 5) {
          let dt = new Date(day.dt * 1000); //timestamp * 1000
          return `<div class="col" style="display:inline-block; width:100%; margin:0;">
        <div class="card" style="width:100%;">
        <div class="row no-gutters">
            <div class="col center" >
                <img class="align-middle" src="http://openweathermap.org/img/wn/${
                  day.weather[0].icon
                }@2x.png" class="img-fluid" alt="${day.weather[0].description}">
            </div>
            <div class="col">
                <div class="card-block px-2">
                    <h4 class="card-title center">${dt.toDateString()}</h4>
                    <p class="card-text">High ${day.temp.max}&deg;C </p>
                    <p class="card-text">Low ${day.temp.min}&deg;C </p>
                      <p class="card-text">Precipitation ${day.pop * 100}%</p>
                </div>
            </div>
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
};

APP.init();
