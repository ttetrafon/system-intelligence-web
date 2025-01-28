import { MongoClient } from 'mongodb';
import { Logger } from './Logger.js';

export class FileDB {
  constructor() {
    if (FileDB._instance) {
      return FileDB._instance;
    }
    FileDB._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> FileDB`);

    this.fileDbClient;

    this.gameplayDb;
    this.gameplayCollection;

    this.testDb;
    this.testCollection;

    this.connectToFileDb();
  }

  client() {
    if (!this.fileDbClient) {
      this.fileDbClient = new MongoClient('mongodb://admin:admin-pass@localhost://si-mongodb:27017/?authSource=admin');
    }
  }

  async connectToFileDb() {
    this.logger.debug(`---> connectToFileDb()`);
    if (this.fileDbClient && this.fileDbClient.topology.isConnected()) {
      this.logger.debug('... FileDB is already connected');
      return
    };

    try {
      this.client();
      console.log(this.fileDbClient);
      await this.fileDbClient.connect();

      // this.testDb = this.fileDbClient.db('test-db');
      // this.testCollection = this.testDb.collection('test-collection');

      this.logger.debug("... connected to FileDB");
      this.getGameplayDb();
    }
    catch(err) {
      this.logger.error(err);
    }
  }
  async getGameplayDb() {
    this.logger.debug(`---> getGameplayDb()`);
    if (this.gameplayDb && this.gameplayCollection) {
      this.logger.debug('... gameplay-db is already accessible');
      return
    };

    try {
      this.gameplayDb = this.fileDbClient.db('gameplay-data');
      this.gameplayCollection = this.gameplayDb.collection('general-gameplay');
      this.logger.debug("... successfully accessing gameplay-db");
    }
    catch(err) {
      this.logger.error(err);
    }
  }

  async retrieveDataFile(key) {
    this.logger.debug(`--> retrieveDataFile(${key})`);
    // try {
    //   const query = { _id: "12345" };
    //   const document = await this.siDataCollection.findOne(query);
    //   console.log("document:", document);
    // }
    // catch(err) {
    //   this.logger.error(err);
    // }
  }

  async storeDataFile(key, json) {
    this.logger.debug(`--> storeDataFile(${key}, ${JSON.stringify(json)})`);
    // try {
    //   let document = {
    //     _id: key,
    //     ...json
    //   };
    //   let result = await this.siDataCollection.insertOne(document);
    //   this.logger.debug(`Data inserted with custom key (_id): ${result.insertedId}`);
    // }
    // catch(err) {
    //   this.logger.error(err);
    // }
  }
}
