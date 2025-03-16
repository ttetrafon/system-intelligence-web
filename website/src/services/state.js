import { gameServiceUrl, routeTableOfContents } from "../data/config.js";
import { jsonRequest, requestSymbols } from "../helper/requests.js";

class State {
  constructor() {
    console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }
    this.user = new User();

    return State.instance;
  }

  async getAppMenus() {
    // TODO: cache...
    return await jsonRequest(gameServiceUrl + routeTableOfContents, {}, requestSymbols.GET);
  }
}

class User {
  constructor() {}
}

const instance = new State();
Object.freeze(instance);
export default instance;