const redis = require('redis');
let redisCache = {};
class Redis {
  constructor(config) {
    config = config || {};
    this.host = config.host || '127.0.0.1';
    this.port = config.port || 6379;
    this.db = config.db || 0;
    this.client = redis.createClient(this.port, this.host);
    this.client.select(this.db);
  }

  static getInstance(config) {
    config = config || {};
    let key = `${config.db}/${config.collection}`;
    if (!redisCache[key]) {
      console.log('redisCache');
      redisCache[key] = new this(config);
    }
    return redisCache[key];
  }

  set(key, value, expire) {
    this.client.set(key, value);
    if (expire) {
      this.client.expire(key, expire);
    }
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          logger.error('Redis get error');
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          logger.error('Redis del error');
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async exists(key) {
    return new Promise((resolve, reject) => {
      this.client.exists(key, (err, reply) => {
        if (err) {
          logger.error('Redis exists error');
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async keys(key) {
    return new Promise((resolve, reject) => {
      this.client.keys(key, (err, rows) => {
        if (err) {
          logger.error('Reids keys error');
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async delWildcard(key) {
    let rows = await this.keys(key);
    let promises = [];
    rows.forEach(row => {
      promises.push(this.del(row));
    });
    let res = await Promise.all(promises);
    return true;
  }
}

module.exports = Redis;
