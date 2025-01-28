import { Logger } from '../services/Logger.js';

export class Gameplay {
  constructor() {
    if (Gameplay._instance) {
      return Gameplay._instance;
    }
    Gameplay._instance = this;

    this.logger = new Logger();
    this.logger.info(`---> Gameplay`);
  }

  /**
   *
   * @param {Request} request
   */
  async test(request) {

    return {
      received: request.body,
      message: 'Data processed successfully!',
      "gameplay-test": "all good!"
    };
  }
}
