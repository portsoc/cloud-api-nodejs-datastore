'use strict';

const data = {};

module.exports.list = () => Object.keys(data);

module.exports.get = (id) => data[id];

module.exports.put = (id, val) => { data[id] = val; };
