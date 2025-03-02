import { urls } from '../data/config.js';
import { userRole } from '../data/enums.js';
import { htmlMethods, jsonRequest } from '../helper/requests.js';

class State {
  constructor() {
    // console.log("---> State()");
    if (!State.instance) {
      State.instance = this;
    }
    this.user = new User(userRole.DM);
    this.data = {}; // TODO: if data is empty, get data from storage
    this.elementHierarchy = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p"
    ];
    this.$runningRequests = {};

    this.dataCategories = [
      "app-data",
      "gameplay-data"
    ];
    this.dataPages = {
      "app-data": [
        "app-structure"
      ],
      "gameplay-data": [
        "general-gameplay"
      ]
    };

    return State.instance;
  }

  async fetchData(type) {
    if (this.data[type]) return this.data[type];

    if (this.$runningRequests[type]) return; // TODO: make this rerun in a second or so if this is true, so that the requester gets the data back when the same call has finished!
    this.$runningRequests[type] = true;

    let res = await jsonRequest(`${urls.gameDataService}/${type}`, htmlMethods.GET);
    this.data[type] = res; // TODO: send to browser storage too; maybe this a secondary function!

    this.$runningRequests[type] = false;
    return res;
  }

  buildInfoCardStructure(elementList, target, isEditorEnabled = false) {
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