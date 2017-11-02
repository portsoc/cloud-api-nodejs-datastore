'use strict';

// todo: the namespace should be in a config file
const datastore = require('@google-cloud/datastore')({ namespace: 'jacek' });

function key(id) {
  return datastore.key(['strings', id]);
}

module.exports.list = async () => {
  let [data] = await datastore.createQuery('strings').select('name').order('name').run();
  data = data.map((val) => val.name);
  return data;
};

module.exports.get = async (id) => {
  const [data] = await datastore.get(key(id));
  if (data && data.val) return data.val;
  return '';
};

module.exports.put = (id, val) => {
  return datastore.save({ key: key(id), data: { name: id, val } });
};
