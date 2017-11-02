'use strict';

const express = require('express');

const api = express.Router();

api.get('/', (req, res) => {
  res.json(['a', 'b', 'c']);
});

api.get('/:id(\\w+)', (req, res) => {
  res.send(`hello ${req.params.id}`);
});

api.put('/:id(\\w+)', (req, res) => {
  res.send(`saved ${req.params.id}`);
});


module.exports = api;
