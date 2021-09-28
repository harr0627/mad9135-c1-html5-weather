export async function locationStorage(location) {
  localStorage.setItem('location', JSON.stringify(location));
}
export async function forecastStorage(forecast) {
  localStorage.setItem('forecast', JSON.stringify(forecast));
}
