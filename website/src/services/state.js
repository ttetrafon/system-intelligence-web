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

    this.cache = {}; // TODO: put cache in the browser storage, and retrieve it when loading state!
    this.commands = []; // TODO: store executed commands for undo functionality

    return State.instance;
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
    if (this.cache.appMenus) {
      return this.cache.appMenus;
    }

    this.cache.appMenus = await jsonRequest(gameServiceUrl + routeTableOfContents, {}, requestSymbols.GET);
    return this.cache.appMenus;
  }

  async updateAppMenus(appMenus) {
    this.cache.appMenus = appMenus;
  }
}

const instance = new State();
Object.freeze(instance);
export default instance;