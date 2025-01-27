import { MongoClient } from 'mongodb';
import { v4 as uuidV4 } from 'uuid';

export class FileDB {
  /**
   *
   * @param {Logger} logger
   */
  constructor(logger) {
    this.logger = logger;
    this.logger.info(`---> FileDB`);

    this.fileDbClient;
    this.dataDb;
    this.siDataCollection

    this.connectToFileDb();

    // setTimeout(() => {
    //   this.storeDataFile(
    //     "gameplay",
    //     {
    //       "structure": [
    //         {
    //           "element": "p",
    //           "id": "",
    //           "contents": "Whenever you want to do something non-trivial, a check is required. Actions are performed by rolling a check and comparing the result with the target difficulty."
    //         }
    //       ]
    //     }
    //   );
    // }, 3000);

    // setTimeout(() => {
    //   this.retrieveDataFile("gameplay");
    // }, 5000);
  }

  client() {
    if (!this.fileDbClient) {
      this.fileDbClient = new MongoClient('mongodb://admin:admin-pass@localhost://si-mongodb:27017/?authSource=admin');
    }
  }

  async connectToFileDb() {
    this.logger.debug(`---> connectToFileDb()`);
    try {
      this.client();
      console.log(this.fileDbClient);
      await this.fileDbClient.connect();
      this.dataDb = this.fileDbClient.db('test-data');
      console.log("this.dataDb:", this.dataDb);
      this.siDataCollection = this.dataDb.collection('si-data');
      console.log("this.siDataCollection:", this.siDataCollection);
      this.logger.debug("... connected to FileDB");
    }
    catch(err) {
      this.logger.error(err);
    }
  }

  async retrieveDataFile(key) {
    this.logger.debug(`--> storeDataFile(${key})`);
    try {
      const query = { _id: "12345" };
      const document = await this.siDataCollection.findOne(query);
      console.log("document:", document);
    }
    catch(err) {
      this.logger.error(err);
    }
  }

  async storeDataFile(key, json) {
    this.logger.debug(`--> storeDataFile(${key}, ${JSON.stringify(json)})`);
    try {
      let document = {
        _id: key,
        ...json
      };
      let result = await this.siDataCollection.insertOne(document);
      this.logger.debug(`Data inserted with custom key (_id): ${result.insertedId}`);
    }
    catch(err) {
      this.logger.error(err);
    }
  }
}
