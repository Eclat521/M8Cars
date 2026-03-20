-- Run this once against your Neon database to set up PostGIS and the postcodes table.
-- Use the Neon SQL console or psql.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS "postcodes" (
  "postcode" varchar(10) PRIMARY KEY NOT NULL,
  "latitude" double precision NOT NULL,
  "longitude" double precision NOT NULL,
  "location" geography(Point, 4326)
);

CREATE INDEX IF NOT EXISTS postcodes_location_idx ON postcodes USING GIST (location);
