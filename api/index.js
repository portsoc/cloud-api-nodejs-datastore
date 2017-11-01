'use strict';

const express = require('express');

const api = express.Router();

api.get('/:id(\\w+)', (req, res) => {
  res.send(`hello ${req.params.id}`);
});

module.exports = api;
