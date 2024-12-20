import { userRole } from "../data/enums.js";

class State {
  constructor() {
    // console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }
    this.user = new User(userRole.DM);
    this.data = {};
    this.elementHierarchy = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p"
    ]

    // TODO: if data is empty, get data from storage

    return State.instance;
  }

  async fetchData(type) {
    if (this.data[type]) return this.data[type];
    let res = await fetch(`./data/${type}.json`);
    let data = await res.json();
    this.data[type] = data;
    // TODO: send to browser storage
    return data;
  }

  buildInfoCardStructure(elementList, target) {
    // console.log("---> buildInfoCardStructure()", elementList, target);
    let res = [];
    let targetElementType;
    let targetElementPriority = -1;

    for (let i = 0; i < elementList.length; i++) {
      let item = elementList[i];
      if (item.id && item.id == target[0]) {
        // console.log("... found our target root!");
        if (target.length > 1) {
          target.shift();
          return this.buildInfoCardStructure(item.contents, target);
        }
        else {
          targetElementType = item.element;
          targetElementPriority = this.elementHierarchy.indexOf(targetElementType);
          res.push(item);
        }
      }
      else {
        // console.log("... ", targetElementType);
        if (targetElementType) {
          let currentElementPriority = this.elementHierarchy.indexOf(item.element);
          if (currentElementPriority > targetElementPriority) {
            res.push(item);
          }
          else {
            return res;
          }
        }
      }
      // console.log(item, res);
    };
  }
  getInfoCardStructure(target) {
    // console.log(`---> getInfoCardStructure(${JSON.stringify(target)})`);
    let structure = this.data[target[0]].structure;
    target.shift();
    return this.buildInfoCardStructure(structure, target);
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