DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(225),
    formatted_query VARCHAR(225),
    latitude NUMERIC (9,9),
    longitude  NUMERIC (9,9)
);

INSERT INTO locations (city) VALUES (city);

SELECT * FROM people;