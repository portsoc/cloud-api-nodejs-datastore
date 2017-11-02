'use strict';

const express = require('express');
const bodyParser = require('body-parser');

// get the database model, use `export DBTYPE=inmemory` to use the in-memory model
const modelType = process.env.DBTYPE || 'datastore';
const db = require(`./db-${modelType}`);

const api = express.Router();

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


module.exports = api;
