'use strict';

const express = require('express');
const db = require('./db');

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
    res.json(await db.get(req.params.id));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

api.put('/:id(\\w+)', async (req, res) => {
  try {
    res.json(await db.put(req.params.id, req.body));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});


module.exports = api;
