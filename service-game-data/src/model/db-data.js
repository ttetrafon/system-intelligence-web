export class ContentsMenuItem {
  /**
   *
   * @param {UUID} id
   * @param {Number} indentation
   * @param {String} label
   * @param {String} type // TODO ??? separator/item
   * @param {Array<String>} tags
   * @param {Array<String>} viewers
   * @param {Array<String>} editors
   */
  constructor(id, label, indentation, type, tags, viewers, editors) {
    this.id = id;
    this.label = label ? label : "";
    this.indentation = indentation ? indentation : 0;
    this.type = type;
    this.tags = tags;
    this.viewers = viewers;
    this.editors = editors;
  }
}
