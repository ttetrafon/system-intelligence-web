import { userRole } from "../data/enums.js";

class State {
  constructor() {
    console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }
    this.user = new User(userRole.DM);
    this.data = {};

    return State.instance;
  }

  async fetchData(type) {
    let res = await fetch(`./data/${type}.json`);
    let data = await res.json();
    this.data[type] = data;
    return data;
  }
}

class User {
  constructor(role) {
    this.role = role;
  }
}

const instance = new State();
Object.freeze(instance);
export default instance;