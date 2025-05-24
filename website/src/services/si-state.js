import { gameServiceUrl } from '../data/config.js';
import { requestSymbols } from '../helper-library/requests.js';
import { Command, commandNames } from '../model/command.js';
import state from '../services-library/state.js';

class SiState {
  constructor() {
    if (!SiState.instance) {
      SiState.instance = this;
    }

    return SiState.instance;
  }

  /**
   * Execute commands from the server.
   * @param {Array[Command]} commands
   */
  executeCommands(commands) {
    commands.forEach(command => {
      switch(command.type) {
        case commandNames.COMMAND_GAMEPLAY_DATA_UPDATE_DOCUMENT.description:
          // Update the updated document in the state.
          // console.log('executing command:', command);
          let document = command.dataCategory;
          Object.keys(command.dataStructure).forEach(item => {
            state.updateObservable(document, item, command.dataStructure[item]);
          });
          break;
        default:
          console.error("unknown command:", command);
      }
    });
  }

  /**
   * Retrieve a gameplay data document.
   * @param {String} document
   * @param {Array[String]} items
   */
  async getGameplayData(document) {
    // console.log(`---> getGameplayData(${document})`);
    // TODO: check local storage...

    const url = `${gameServiceUrl}/data/gameplay-data/${document}`;
    return await state.getDataFromServer(url, document);
  }

  async pingGameplayServer() {
    await state.pingServer(`${gameServiceUrl}/`);
  }

  /**
   * Send a server gameplay data command.
   * @param {Command} command
   */
  async publishEditablePageCommand(command) {
    let res = await state.publishMessage(`${gameServiceUrl}/data/command/${command.type}`, command, requestSymbols.POST);
    // console.log("publishEditablePageCommand.res", res);

    if (res.commands) {
      this.executeCommands(res.commands);
    }
  }
}

const instance = new SiState();
Object.freeze(instance);
export default instance;