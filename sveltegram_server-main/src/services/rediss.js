/*
import {createClient} from 'redis';


export const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  },
  password: process.env.REDIS_PASS,
});


export function connect(): Promise<typeof client> {
  return new Promise((resolve, reject)  => {
    client.connect()

    client.on('connect', async () => {
      await client.flushAll()
      resolve(client);
    })
    client.on('error', (err) => {
      reject(err);
    })
    
  })
}
*/






const {createNodeRedisClient} = require('handy-redis');
const {local} = require('../routes/rooms/config');

const localStore = {};

let _exports = {
  get: key => localStore[key],
  set: (key, value) => (localStore[key] = value),
  del: key => {
    delete localStore[key];
  },
  list: prefix => Object.keys(localStore).filter(key => key.startsWith(prefix)),
  roomCount: () =>
    Object.keys(localStore).filter(key => key.startsWith('rooms/')).length,
  identityCount: () =>
    Object.keys(localStore).filter(key => key.startsWith('identities/')).length,
};

if (!local) {
  let client = createNodeRedisClient({host: 'pantryredis'});
  client.nodeRedis.on('error', err => {
    console.log('error connecting to redis, host pantryredis');
    console.error(err);
    client.nodeRedis.quit();
  });
  // do this after migrating to esm
  // await new Promise(resolve => client.nodeRedis.on('ready', resolve));

  const roomCount = async () => (await client.keys('rooms/*')).length;
  const identityCount = async () => (await client.keys('identities/*')).length;
  const set = (key, value) => client.set(key, JSON.stringify(value));
  const get = async key => JSON.parse(await client.get(key));
  const del = key => client.del(key);
  const list = prefix => client.keys(`${prefix}*`);

  _exports = {
    get,
    set,
    del,
    list,
    roomCount,
    identityCount,
  };
}

module.exports = _exports;
