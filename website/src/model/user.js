export const roles = Object.freeze({
  SYSTEM_EDITOR: Symbol("system-editor"),
  GM: Symbol("game-master"),
  PLAYER: Symbol("player"),
  OBSERVER: Symbol("observer"),
  VISITOR: Symbol("visitor")
});

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
