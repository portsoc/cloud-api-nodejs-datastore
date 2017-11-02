# CLOCOSS example: API in Node.js/Express and Datastore

This is a simple example of a read/write API with database backing, intended for use in Google App Engine.

The API is implemented in Node.js and Express, the database is either in-memory (for testing and demonstration), and in Datastore.

## Installation

1. clone the code
2. `npm install`
3. To test that it works: `DBTYPE=inmemory npm start`
  * it will be available on port 8080
4. To deploy in App Engine
  1. change service name in `app.yaml`
  2. `gcloud app deploy`

## Description

The application is a simple store of textual data. It has a list of named _files_ whose content can be loaded, edited, and saved.

For example, we might have two files:
 * `pets` contains `kitten, doggie, tortoise`
 * `message` contains `Hello World!`

In the app, we can load either file and edit it, or we can create a new file.

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

This tutorial goes through the steps of creating the API and connecting it to a database.

#### Prerequisites

You will need Node.js version 8 or later, `git`, and the `gcloud` tools.

It may be easiest to follow this tutorial on a Compute Engine VM with HTTP networking and with full access to the cloud APIs (these are parameters you can set when creating the VM).

### 1. start in a fresh directory

The tutorial assumes that you are starting in an empty directory but have a copy of this repository at hand.

Because this tutorial doesn't look at how the client web page is done, please just copy the directory `static/` and its contents from this repository.

You should now have a directory with `static/` inside it.

### 2. create `package.json`

Run `npm init`, answer the prompts, the defaults are generally OK because we won't be publishing this package.


### 3. create a basic Express.js app

For that, we will need the `express` package, so run `npm install --save express`.

Now create the main file for your app, which we can name `app.js`. The following is its basic content:

```javascript
const express = require('express');

const app = express();

app.use(express.static('static', { extensions: ['html'] }));

const port = process.env.PORT || 8080;

app.listen(port, (err) => {
  if (err) console.log('error', err);
  else console.log(`app listening on port ${port}`);
});
```

You can test this app by running `node app` and connecting to your machine on port 8080. It will serve the static pages only, so you can see that the app can retrieve `/style.css` and `/script.js`.

For example, if your VM has the IP address 10.11.12.13, then you should reach `style.css` at `http://10.11.12.13:8080/style.css`

### 4. the first API route: listing available files

Our app first needs to be able to load the list of available files. In an API that only has a simple list of files, we can return the list of available files at the root of the API:

`GET /api/   ->  returns ["message", "pets"]`

It is good practice to split the API routes away from the main server file, therefore we will put the route in a file called `api/index.js`. Copy the following code into this file:

```javascript
const express = require('express');
const api = express.Router();

api.get('/', (req, res) => {
  res.json(["message", "pets"]);
});

module.exports = api;
```

The code above gives us a Javascript module that exports an Express _router_, which is a collection of routes. The only route in there simply returns a hard-coded list of files: "message" and "pets".

Now add the following line into `app.js` before the line that mentions `static`:

```javascript
app.use('/api', require('./api'));
```

It needs to go before the line that mentions `static` to give preference to the API: if the `static/` directory contains (probably by mistake) a directory called `api` with some files in it, these would not override our API.

test that the app now loads correctly

todo api/db-inmemory.js

test that the app now loads correctly

### 5. routes for loading and saving file content

todo api/index.js and api/db-inmemory.js for `GET /api/:id` and `PUT /api/:id`

test that the app now works correctly

show that the data doesn't persist

### 6. use Datastore for the database

todo api/db-datastore.js

test that the data now persists

### 7. deploy into App Engine

prepare app.yaml

`gcloud app deploy`
