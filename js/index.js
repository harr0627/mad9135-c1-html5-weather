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
              <p class="card-title main">${dt.toLocaleDateString(
                navigator.language,
                {
                  timeZone: tzn,
                  dateStyle: 'long',
                }
              )}</p>
                  <img src="${image}@4x.png"  class="currentImg" alt="${
      current.weather[0].description
    }">
              </div>
              <div class="col">
                  <div class="card-block px-2">
                      <p class="card-text current">${parseInt(
                        current.temp
                      )}&deg;C </p>
                      <p class="card-text">Feels Like: ${parseInt(
                        current.feels_like
                      )}&deg;C </p>
                    </div>
                </div>
            </div>`;
    hourly.innerHTML = data.forecast.hourly
      .map((hour, idx) => {
        if (idx <= 5) {
          let dt = new Date(hour.dt * 1000);
          let imageId = hour.weather[0].icon;
          let image = createWeatherIcon(imageId);
          return `<div class="card small-cards col">
          <p class="card-title">${dt.toLocaleTimeString(navigator.language, {
            timeZone: tzn,
            hour: 'numeric',
          })}</p>
            <div class="col card-image" >
                <img class="align-middle" src="${image}@2x.png" class="img-fluid" alt="${
            hour.weather[0].description
          }">
            </div>
            <div class="col">
                <div class="card-block">
                    <p class="small-card-text">${parseInt(hour.temp)}&deg;C </p>
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
          return `<div class="card small-list-cards">
          <div class=card-list-title >
          <p class="card-list-date center">${dt.toLocaleDateString(
            navigator.language,
            {
              timeZone: tzn,
              dateStyle: 'long',
            }
          )}</p>
          </div>
            <div class=" card-list-image" >
                <img class="align-middle" src="${image}@2x.png" alt="${
            day.weather[0].description
          }">
            </div>
                <div class="card-list-block">
                    <p class="card-list-text">${parseInt(day.temp.max)}</p>
                    <p class="card-list-text">${parseInt(day.temp.min)}</p>
              </div>
            </div>`;
        }
      })
      .join(' ');
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
