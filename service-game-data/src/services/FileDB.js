import { MongoClient } from 'mongodb';
import { Logger } from './Logger.js';
import { fileDbNames } from '../data/enums.js';

export class FileDB {
  constructor() {
    if (FileDB._instance) {
      return FileDB._instance;
    }
    FileDB._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> FileDB`);

    this.fileDbClient;
  }

  async connectToFileDb() {
    this.logger.debug(`---> connectToFileDb()`);
    if (this.fileDbClient && this.fileDbClient.topology.isConnected()) {
      this.logger.debug('... FileDB is already connected');
      return
    };

    try {
      this.client();
      await this.fileDbClient.connect();

      // this.testDb = this.fileDbClient.db('test-db');
      // this.testCollection = this.testDb.collection('test-collection');

      this.logger.debug("... connected to FileDB");
      this.getAppDataDb();
    }
    catch (err) {
      this.logger.error(err);
    }
  }
  client() {
    if (!this.fileDbClient) {
      this.fileDbClient = new MongoClient('mongodb://admin:admin-pass@localhost://si-mongodb:27017/?authSource=admin');
    }
  }

  /**
   *
   * @param {Symbol} db: The name of the DB.
   * @param {Array[Symbol]} collections: The names of the collections in the given DB.
   */
  async getDdAndCollections(db, collections) {
    this.logger.debug(`---> connectToFileDb()`);
    if (this[db.description] && collections.every(col => this[col.description] != null && this[col.description] != undefined)) {
      this.logger.debug(`... ${ db.description } is already accessible`);
    }

    try {
      this[db.description] = this.fileDbClient.db(db.description);
      collections.forEach(col => {
        this[col.description] = this[db.description].collection(col.description);
      });
      this.logger.debug(`... successfully established access to ${ db.description }`);
    }
    catch (err) {
      this.logger.error(err);
    }
  }
  /**
   *
   */
  async getAppDataDb() {
    this.logger.debug(`---> getAppDataDb()`);
    await this.getDdAndCollections(
      fileDbNames.DB_APP_DATA,
      [
        fileDbNames.COL_APP_STRUCTURE
      ]
    );
  }
  /**
   *
   */
  async getGameplayDb() {
    this.logger.debug(`---> getGameplayDb()`);
    await this.getDdAndCollections(
      fileDbNames.DB_GAME_DATA,
      [
        fileDbNames.COL_GENERAL_GAMEPLAY
      ]
    );
  }

  /**
   *
   * @param {String} collection
   * @param {String} key
   * @returns {JSON}
   */
  async retrieveDataFile(collection, key) {
    this.logger.debug(`--> retrieveDataFile(${ key })`);
    const query = { _id: key };
    const document = await this[collection].findOne(query);
    console.log("retrieved document:", document);
    return document;
  }

  /**
   *
   * @param {String} collection
   * @param {String} key
   * @param {JSON} json
   * @returns {String}
   */
  async storeDataFile(collection, key, json) {
    this.logger.debug(`--> storeDataFile(${ key }, ${ JSON.stringify(json) })`);
    let document = {
      _id: key,
      ...json
    };
    let result = await this.siDataCollection.insertOne(document);
    this.logger.debug(`Data inserted with key (_id): ${ result.insertedId }`);
    return result;
  }
}
