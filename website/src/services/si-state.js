import { gameServiceUrl } from '../data/config.js';
import state from '../services-library/state.js';

class SiState {
  constructor() {
    if (!SiState.instance) {
      SiState.instance = this;
    }

    return SiState.instance;
  }

  /**
   *
   * @param {String} section
   * @param {Array[String]} items
   */
  async getGameplayData(section) {
    console.log(`---> getGameplayData(${section})`);
    // TODO: check local storage...

    const url = `${gameServiceUrl}/data/gameplay-data/${section}`;
    return await state.getDataFromServer(url, section);
  }

  async pingGameplayServer() {
    await state.pingServer(`${gameServiceUrl}/`);
  }

}

const instance = new SiState();
Object.freeze(instance);
export default instance;