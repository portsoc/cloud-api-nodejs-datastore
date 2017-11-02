'use strict';

const data = {
  first: 'test',
  second: 'not here',
};

let sleepTime = parseInt(process.env.SLEEP, 10);
if (Number.isNaN(sleepTime)) sleepTime = 1000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports.list = async () => {
  await sleep(sleepTime);
  return Object.keys(data);
};

module.exports.get = async (id) => {
  await sleep(sleepTime);
  return data[id];
};

module.exports.put = async (id, val) => {
  await sleep(sleepTime);
  data[id] = val;
};
