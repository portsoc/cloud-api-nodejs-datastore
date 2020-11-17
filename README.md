# Cloud example: API in Node.js/Express and Datastore

This is a simple example of a read/write API with database backing, intended for use in Google App Engine.

The application is a simple store of textual data. It has a list of named _files_ whose content can be loaded, edited, and saved.

The API is implemented in Node.js and Express, the database is either in-memory (for testing and demonstration), and in Datastore.

## Installation

1. clone the code
2. `npm install`
3. To test that it works: `DBTYPE=inmemory npm start`
   * it will be available on port 8080
3. `gcloud app deploy`
3. `gcloud app browse -s myfiles`

## Description

The application is a simple store of textual data. It has a list of named _files_ whose content can be loaded, edited, and saved.

For example, we might have two files:
 * file named "pets" contains `kitten, doggie, tortoise`
 * file named "message" contains `Hello World!`

In the app, we can load either file and edit it, or we can create a new file. Note, though, that when first deployed, the app has no file in it yet.

The code consists of the following components:

1. `static/*` – the client-side web page that uses the API
2. `app.js` – the main server file; it serves the static files, and imports the API from the next point
3. `api/index.js` – the specification of the _routes_
   1. `GET /api/` – lists the available file names
   2. `GET /api/name` – returns the content of the file with name `name`
   3. `PUT /api/name` – replaces the content of the file named `name`
4. `api/db*` – database implementations that support the API:
   1. `api/db-inmemory.js` – a simple in-memory list of files; with a configurable delay to simulate slow network
   2. `api/db-datastore.js` – the default database that uses Google Datastore
5. `app.yaml` – the application descriptor for Google App Engine

## Tutorial

This [tutorial](https://portsoc.github.io/cloud-api-nodejs-datastore/) will walk you through the creation of a datastore-powered cloud app.

