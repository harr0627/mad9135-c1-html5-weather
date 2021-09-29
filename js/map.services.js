const API_TOKEN = 'pk.480aa31da4bde959e8c975cd4005bd9a';
const BASE_URL = 'https://us1.locationiq.com/v1';
const REVERSE_URL = 'https://us1.locationiq.com/v1/reverse.php?format=json&';

export async function getGeolocation(location) {
  const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return { lat: data[0].lat, lon: data[0].lon };
}

export async function reverseLocation(lat, lon) {
  let url = `${REVERSE_URL}key=${API_TOKEN}&lat=${lat}&lon=${lon}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return data;
}
