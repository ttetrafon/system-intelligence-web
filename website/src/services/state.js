import { gameServiceUrl, routeCommands, routeTableOfContents } from "../data/config.js";
import { jsonRequest, requestSymbols } from "../helper/requests.js";
import { Command } from "../model/command.js";
import { User } from "../model/user.js";

class State {
  constructor() {
    console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }

    return State.instance;
  }

  /**
   * Accepts commands (other clients produced) from the server and executes them.
   * @param {Command} command
   */
  async consumeCommand(command) {

  }

  /**
   * Sends commands created on this client to the server.
   * @param {Command} command
   * // TODO:
   */
  async publishCommand(command) {
    // console.log("state.publishCommand: ", command);
    let res = await jsonRequest(gameServiceUrl + routeCommands, command, requestSymbols.POST);
    if (!res) return;

    // TODO: handle extra commands submitted before this client's
    return res;
  }

  async getAppMenus() {
    // TODO: cache...
    return await jsonRequest(gameServiceUrl + routeTableOfContents, {}, requestSymbols.GET);
  }
}

const instance = new State();
Object.freeze(instance);
export default instance;