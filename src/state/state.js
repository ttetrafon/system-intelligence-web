import { userRole } from "../data/enums.js";

class State {
  constructor() {
    console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }
    this.user = new User(userRole.OBSERVER);
    this.testValue = Math.random();
    console.log("...", this.testValue);
    return State.instance;
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