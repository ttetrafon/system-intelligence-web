import { userRoles } from '../data/enums.js';

export class User {
  /**
   *
   * @param {String} id: uuid
   * @param {Symbol} role: the user's role
   */
  constructor(id, role) {
    this.$id = id ? id : crypto.randomUUID();
  }
}
