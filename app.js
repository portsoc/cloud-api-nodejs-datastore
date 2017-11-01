#!/usr/bin/env node

'use strict';

const express = require('express');

const app = express();

app.use('/api', require('./api'));

app.use(express.static('static', { extensions: ['html'] }));

const port = process.env.PORT || 8080;

app.listen(port, (err) => {
  if (err) console.log('error', err);
  else console.log(`app listening on port ${port}`);
});
