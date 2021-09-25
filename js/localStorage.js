//this came from location
//   const response = await fetch(url);
//   // if (!response.ok) {
//   //   throw new Error(response.statusText);
//   // }
//   // const data = await response.json();
//   // console.log(data[0]);
//   // // i want to save the data for [0] to local storage
//   // return { lat: data[0].lat, lon: data[0].lon };
//   fetch(url)
//     .then((resp) => {
//       if (!resp.ok) throw new Error(resp.statusText);
//       return resp.json();
//     })
//     .then((data) => {
//       localStorage.setItem('location', JSON.stringify(data[0]));
//       let location = localStorage.getItem('location');
//       let lon = JSON.parse(location).lon;
//       let lat = JSON.parse(location).lat;
//       let coords = { lat, lon };
//       return coords;
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// }

//this came from reverseLocation
// localStorage.clear();
// localStorage.setItem('location', JSON.stringify(data));
// //let location = localStorage.getItem('location');
// let lon = JSON.parse(location).lon;
// let lat = JSON.parse(location).lat;
// let coords = { lat, lon };
