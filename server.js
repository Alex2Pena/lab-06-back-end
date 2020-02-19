'use strict';

// brings in the expresss library which is our server
const express = require('express');

// instantiates the express library in app
const app = express();

// lets us go into the .env and get the variables
require('dotenv').config();

// the policeman - lets the server know that it is OK to give information to the front end
const cors = require('cors');
app.use(cors());

// get the port from the env
const PORT = process.env.PORT || 3001;

const superagent = require('superagent');

//Read JSON file data
app.get('/location', (request, response) => {
  try{
    let city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
    superagent.get(url)
      .then(results => {
        let geoData = results.body;
        let location = new City(city, geoData[0]);
        response.status(200).send(location);
      });
  }
  catch (err){
    console.log(err);
  }
});
function City(city, obj){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

//Read JSON file data

app.get('/weather', (request, response) => {
  let weather = [];
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${lon}`;
  superagent.get(url)
    .then(results => {
      let wData = results.body.daily.data;
      let dailyData = wData.daily.data;
      let forecast = dailyData.map(day => {
        let newDay = new Weather(day);
        weather.push(newDay);
      });
    });
  response.send(weather);
});

function Weather(obj){
  this.forecast = obj.summary;
  this.time = new Date(obj.time * 1000).toString().slice(0,15);
}


// turn on the server
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});

