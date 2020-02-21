'use strict';

// lets us go into the .env and get the variables
require('dotenv').config();
// brings in the expresss library which is our server
const express = require('express');
// instantiates the express library in app
const app = express();
// requires that postgress is running
const pg = require('pg');
// the policeman - lets the server know that it is OK to give information to the front end
const cors = require('cors');
app.use(cors());
// get the port from the env
const PORT = process.env.PORT || 3001;
// install super agent in terminal (npm i -S superagent)
const superagent = require('superagent');
//using the pg library to assign an instance of a client to the variable client.
const client = new pg.Client(process.env.DATABASE_URL);
//Turns on the DataBase and reports an error if found
client.on('error', err => console.error(err));


//need to convert to city
app.get('/add', (request, response) => {
  //takes in input from front end and stores it into the table in the DB.
  let city = request.query.city;
  console.log(city);

  let SQL = 'INSERT INTO people (city) VALUES ($1)';
  let safeValues = [city];

  client.query(SQL, safeValues);
});

app.get('/display', (request, response) => {
  let SQL = 'SELECT * FROM people';
  client.query(SQL)
    .then(results => {
      response.json(results.rows);
    });
});

// client.connect()
//   .then(
//     app.listen(PORT, () => console.log(`listening on ${PORT}`))
//   );

// app.listen(PORT, () => {
//   console.log(`listening to ${PORT}`);
// });

app.get('/location', (request, response) => {

  let city = request.query.city;
  //look in my DB to see if location exists
  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];

  client.query(sql, safeValues)
    .then(results => {
      if(results.rows.length > 0){
        console.log('found city in DB');
        //if it does, send that file to the front end
        //it will  make my life easier if the DB data is the same  format as what the front  end is  expecting.
        //aka- my table should have the same keys as my constructor
        response.send(results.rows[0]);
      } else {
        console.log('did not find data in DB');
        //if it doesnt the use super agent  to goto API to get data
        //save it to DB
        //send it to Front end
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;

        superagent.get(url)
          .then(results => {
            let geoData = results.body;
            let location = new City(city, geoData[0]);

            let sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];

            client.query(sql, safeValues);

            response.status(200).send(location);
          });
      }
    });
}
);


//Read JSON file data

app.get('/weather', (request, response) => {
  let weather = [];
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let url = `https://api.darksky.net/forecast/${process.env.DARK_SKY_API}/${lat},${lon}`;
  superagent.get(url)
    .then(results => {
      let wData = results.body.daily.data;
      wData.map(day => {
        let newDay = new Weather(day);
        weather.push(newDay);
      });
      response.status(200).send(weather);
    });
});
app.get('/trails', (request, response) => {
  let {latitude,longitude} = request.query;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;

  superagent.get(url)
    .then(results => {
      const dataObj = results.body.trails.map(trail => new Trail(trail));
      response.status(200).send(dataObj);
    });
});
function City(city, obj){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
function Weather(obj){
  this.time = new Date(obj.time * 1000).toString().slice(0,15);
  this.forecast = obj.summary;
}
function Trail(obj){
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.slice(0,10);
  this.condition_time = obj.conditionDate.slice(11,19);
}
client.connect()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  );



// turn on the server
