DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(225),
    formatted_query VARCHAR(225),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7)
);

INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ('','',000.0000000,000.0000000);

SELECT * FROM locations;