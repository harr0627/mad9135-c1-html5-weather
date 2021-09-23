import {
  getForecast as getForecast,
  createWeatherIcon,
} from './weather.services.js';
import { getGeolocation, reverseLocation } from './map.services.js';

const APP = {
  init: () => {
    document
      .getElementById('getWeather')
      .addEventListener('click', APP.searchLocation);
    document
      .getElementById('useLocation')
      .addEventListener('click', APP.getLocation);
  },
  searchLocation: async function (ev) {
    ev.preventDefault();
    let query = document.getElementById('city').value.trim();
    if (!query) return false;
    getGeolocation(query);
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
    await reverseLocation(
      position.coords.latitude.toFixed(2),
      position.coords.longitude.toFixed(2)
    );
    getForecast('metric', {
      lon: position.coords.longitude.toFixed(2),
      lat: position.coords.latitude.toFixed(2),
    });
  },
  wtf: (err) => {
    //geolocation failed
    console.error(err);
  },
};

APP.init();
