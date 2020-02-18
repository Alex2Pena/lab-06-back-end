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

//Read JSON file data
app.get('/location', (request, response) => {
  try{
    let city = request.query.city;
    let geoData = require('./data/geo.json');
    let location = new City(city, geoData[0]);

    response.send(location);
  }
  catch (err){
    response.status(500).send(err);
    console.log(request);
    console.log(err);
  }
});
// Constructor function for City obj
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
  let wData = require('./data/darksky.json');
  let dailyData = wData.daily.data;
  let forecast = dailyData.forEach(day => {
    let newDay = new Weather(day);
    weather.push(newDay);
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