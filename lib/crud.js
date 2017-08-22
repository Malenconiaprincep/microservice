/*
 *  增删改查模块
 *  @author by makuta
 */

// import log4js from 'log4js'
const Mongo = require('./mongo')

// const logger = log4js.getLogger('Crud')
const dbs = {}

class Crud {
  constructor(config) {
    this.db = config.db
    this.collection = config.collection
    this.mongo = config.mongo
  }

  static async get(config) {
    const key = `${config.db}/${config.collection}`
    const connection = await this.privateConnectDB(config)
    if (!dbs[key]) {
      dbs[key] = new this(
        Object.assign(
          {
            mongo: connection,
          },
          config,
        ),
      )
    }
    return dbs[key]
  }

  static async privateConnectDB(config) {
    const mongo = await Mongo.get(config)
    return mongo
  }

  static initDoc(doc) {
    Object.assign(
      {
        create_time: Date.now(),
      },
      doc,
    )
  }

  /*
   *  http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#find
   *  method read
   */
  async read({
    query = {},
    options = {},
    sort = {},
    collectionName = this.collection,
  }) {
    /*
     *  可以从自己的collection读 ， 也可以从传进去的 collection读
     */
    const collection = this.mongo.collection(collectionName)
    let results
    if (Object.keys(sort).length > 0) {
      results = await collection.find(query, options).sort(sort).toArray()
    } else {
      results = await collection.find(query, options).toArray()
    }
    return results
  }

  /*
   *  http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#insert
   *  method create
   */
  async create({ docs, collectionName = this.collection }) {
    if (Array.isArray(docs)) {
      docs.forEach(doc => {
        Crud.initDoc(doc)
      })
    } else {
      Crud.initDoc(docs)
    }
    const collection = this.mongo.collection(collectionName)
    let result = await collection.insert(docs)
    if (Array.isArray(docs)) {
      result = result.ops
    } else {
      result = result.ops[0]
    }
    return result
  }

  /*
   *  http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#update
   *  method create
   */
  async update({
    query = {},
    docs = {},
    options = {},
    collectionName = this.collection,
  }) {
    const collection = this.mongo.collection(collectionName)
    const modifyTime = { $set: {} }
    modifyTime.$set.modify_time = Date.now()
    Object.assign(modifyTime, docs)
    const result = await collection.findAndModify(
      query,
      [['_id', 1]],
      docs,
      options,
    )
    return result.result
  }

  /*
   *  http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#remove
   *  method remove
   */
  async del({ query, collectionName = this.collection }) {
    const collection = this.mongo.collection(collectionName)
    if (query) {
      const result = await collection.remove(query)
      return result.result
    }
    return false
  }

  /*
   *  http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#count
   *  method count
   */

  async count({ query = {}, collectionName = this.collection }) {
    const collection = this.mongo.collection(collectionName)
    const results = await collection.count(query)
    return results
  }
}

module.exports = Crud
