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

app.get('/location', (request, response) => {
  try{
    let city = request.query.city;
    let geoData = require('./data/geo.json');

    let location = new City(city, geoData[0]);
    // let dataObj = {
    //   "search_query": city,
    //   "formatted_query": geoData[0].display_name,
    //   "latitude": geoData[0].lat,
    //   "longitude": geoData[0].lon
    // }

    response.send(location);
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

// turn on the server
app.listen(PORT, () => {
  console.log(`listening to ${PORT}`);
});
