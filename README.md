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
   2. change namespace in `api/db-datastore.js`
   3. `gcloud app deploy`

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
module.exports = api;

api.get('/', (req, res) => {
  res.json(["message", "pets"]);
});
```

The code above gives us a Javascript module that exports an Express _router_, which is a collection of routes. The only route in there simply returns a hard-coded list of files: "message" and "pets".

Now add the following line into `app.js` before the line that mentions `static`:

```javascript
app.use('/api', require('./api'));
```

(It needs to go before the line that mentions `static` to give preference to the API: if the `static/` directory contains (probably by mistake) a directory called `api` with some files in it, these would not override our API.)

Now the server is ready to return a list of files. Run the app like above with `node app` and check that the drop-down box of file names gets loaded correctly.

A hard-coded list of files would not be useful. We will start with an in-memory database for our files. Put the following in the file `api/db-inmemory.js`:

```javascript
const data = {
  pets: 'kitten, doggie, tortoise',
  message: 'Hello World!',
  shoppinglist: '1. milk\n2. cookies',
};

module.exports.list = () => {
  return Object.keys(data);
};
```

This keeps the files in an object, keyed by the file name. `Object.keys(data)` returns an array of the keys, exactly what we need to return to the client.

We have put the database in a new file (`api/db-inmemory.js`) to separate the implementation of the API from the implementation of the data model.

Now we can use this file in `api/index.js` by replacing it with:

```javascript
const express = require('express');
const api = express.Router();
module.exports = api;

const db = require('./db-inmemory');

api.get('/', (req, res) => {
  res.json(db.list());
});
```

Restart the app and reload the page and the list of files should now contain "shoppinglist" as well as the other files we had in the hard-coded list before.

### 5. routes for loading and saving file content

Listing the available files above is only the first step. To add manipulation of the content of files, first, we will add the following to `api/db-inmemory.js`:

```javascript
module.exports.get = (id) => {
  if (data[id] == null) return '';
  return data[id];
};

module.exports.put = (id, val) => {
  data[id] = val;
};
```

These two new functions need to be used in the API, so we will add this in `api/index.js`:

```javascript
api.get('/:id(\\w+)', (req, res) => {
  res.send(db.get(req.params.id));
});

const bodyParser = require('body-parser');
api.put('/:id(\\w+)', bodyParser.text(), (req, res) => {
  db.put(req.params.id, req.body);
  res.sendStatus(204);
});
```

The first route serves `GET` requests – retrieving file contents. If a file isn't in the database, we will return an empty string as if the file was there.

The second route serves `PUT` requests – saving file contents. The route need not return any data, so it returns status 204 (HTTP OK, no content coming back).

The second route uses the `body-parser` package to get the body of the request. To install it, run `npm install --save body-parser`

In the routes, the path `'/:id(\\w+)'` specifies that the content of the URL becomes a request parameter called `id` (so we can get it as `req.params.id`), and that it must match the regex `\w+` – only alphanumeric characters.

Restarting the app now, we should see that the Web app works: lists all the files, loads their content, allows saving, and also allows us to create new files.

Because we only have an in-memory database, the app will only remember any saved changes as long as it is not restarted. You can try it by saving a file, restarting the app, and loading the file again – the changes will be lost. The next step addresses this.

### 6. use Datastore for the database

Now we can use a persistent database for our files. We will use Google Datastore; to install the Node.js package, run `npm install --save @google-cloud/datastore`

We can put the database code in a new file, `api/db-datastore.js`, like this:

```javascript
// change the namespace to something else than 'tutorial'
const ds = require('@google-cloud/datastore')({ namespace: 'tutorial' });

const kind = 'files';

function key(id) {
  return ds.key([kind, id]);
}

module.exports.list = async () => {
  // asynchronously get a list of entities with names
  let [data] = await ds.createQuery(kind).select('name').order('name').run();
  // extract only the names
  data = data.map((val) => val.name);
  return data;
};

module.exports.get = async (id) => {
  // asynchronously get the entity
  const [data] = await ds.get(key(id));
  if (data && data.val) return data.val;
  return '';
};

module.exports.put = (id, val) => {
  const entity = {
    key: key(id),
    data: { name: id, val },
  }
  await ds.save(entity);
};
```

Data stored in Datastore is seen as _entities_. We use one entity per file; each entity has two properties: `name` and `val`. Every entity is identified by a _key_ which has a _kind_ and an ID; we named the kind "files" and we use the file name as its ID.

The file uses a _namespace_ (by default "tutorial") that you should rename such that the entities do not collide with any other datastore entities used in your project.

Because the Datastore is remote, all the invocations are asynchronous. We use _async/await_ syntax that is only available from Node.js version 8.

The `list()` function uses a query to retrieve only the names of all the stored files; and sorts them alphabetically.

The `get()` function is a straightforward use of the `datastore.get()` function; similarly, the `put()` function is a simple use of `datastore.save()`.

When this app runs on a Compute Engine VM, or in App Engine, it automatically connects to the Datastore of the same cloud project, otherwise the first line of the code above would need to specify more about the datastore it uses.

In order to use this Datastore-backed database, we need to change `api/index.js` in two ways: first, we need to `require` the right module, and then we need to deal with the asynchronous nature of the datastore (together with any possible errors). Therefore, replace `api/index.js` with the following:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const api = express.Router();
module.exports = api;

const db = require(`./db-datastore`);

api.get('/', async (req, res) => {
  try {
    res.json(await db.list());
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

api.get('/:id(\\w+)', async (req, res) => {
  try {
    res.send(await db.get(req.params.id));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

api.put('/:id(\\w+)', bodyParser.text(), async (req, res) => {
  try {
    await db.put(req.params.id, req.body);
    res.sendStatus(204);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
```

Beside the `require` statement, the asynchrony, and error handling, not much has changed in that file.

If we now restart the app, we may see that there are no files available yet; when we create and save a file, we can test by restarting the app that the data persists.

The data is also available in the Google cloud console under Datastore -> Entities.

### 7. deploy into App Engine

We have been testing the app by running it locally on a Compute Engine VM. Now we can deploy it in App Engine so that Google manages the runtime environment, scaling, HTTPS, and so on, for us.

First, we need to prepare an application descriptor file `app.yaml`:

```yaml
runtime: nodejs
env: flex
service: tutorial
automatic_scaling:
  min_num_instances: 1
  max_num_instances: 3
```

In the file, change the service name from "tutorial" to avoid any service name conflicts.

Finally, run `gcloud app deploy` and after some waiting, your app will be ready and running. You can find out the URL for your app with `gcloud app browse` or in the cloud console.
