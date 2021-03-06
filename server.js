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
//connects to the frontend @ /location
app.get('/location', (request, response) => {
// request.query is  what is  what is typed in for the search.
  let city = request.query.city;
  //look in my DB to see if the request query location exists
  let sql = 'SELECT * FROM locations WHERE search_query=$1;';
  //takes in
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
            let sql = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)';
            let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];
            client.query(sql, safeValues);
            response.status(200).send(location);
          });
      }
    });
}
);

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
  let {
    latitude,
    longitude, } = request.query;

  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;

  superagent.get(url)
    .then(results => {
      const dataObj = results.body.trails.map(trail => new Trail(trail));
      response.status(200).send(dataObj);
    });
});

//build movies here:
app.get('/movies', (request, response) => {
  let location = request.query.search_query;
  console.log(request.search_query);
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${location}&page=1&include_adult=false`;

  superagent.get(url)
    .then (results => {
      console.log('movie superagent results', results.body.results);
      let movieData = results.body.results;
      let movieResults = movieData.map((data) => (new Movie(data)));
      // console.log(movieResults);
      response.status(200).send(movieResults);
    })
    .catch(err => {
      console.error(err);
      response.status(500).send(err);
    });
});

app.get('/yelp',(request, response) => {
  let city = request.query.search_query;
  let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(results => {
      let newYelp = results.body.businesses.map(biz => {
        return new Yelp(biz);
      });
      response.status(200).send(newYelp);
    });
});

//Constructor funtions for different columns

//city  constructor
function City(city, obj){
  this.search_query = city;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
//weather constructor
function Weather(obj){
  this.time = new Date(obj.time * 1000).toString().slice(0,15);
  this.forecast = obj.summary;
}
//trail constructor
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
//movie constructor
function Movie(data){
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${data.backdrop_path}`;
  // this.image_url = `https://image.tmdb.org/t/p/${data.backdrop_path}`
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}
//Yelp constructor
function Yelp(obj){
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}
// turn on the server
client.connect()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  );



