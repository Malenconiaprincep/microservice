/*
 *  连接mongoDB
 *  @author by makuta
 */

const MongoClient = require('mongodb').MongoClient

const connections = {}
class Mongo {
  static async get(config = {}) {
    let host = config.host || '127.0.0.1:27017'
    const dbName = config.db || 'test'
    if (!Array.isArray(host)) {
      host = [host]
    }
    const key = `${host.join(',')}/${dbName}`
    if (!connections[key]) {
      const connectStr = `mongodb://${host.join(',')}/${dbName}`
      const url = host.length > 1
        ? `${connectStr}?replicaSet=replset`
        : connectStr
      try {
        const connection = await MongoClient.connect(url)
        connections[key] = connection
      } catch (err) {
        console.log(err)
      }
    }
    return connections[key]
  }
}

module.exports = Mongo
