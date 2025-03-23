export class ContentsMenuItem {
  /**
   *
   * @param {UUID} id
   * @param {String} label
   * @param {Number} indentation
   * @param {Array<String>} tags
   * @param {Array<String>} viewers
   * @param {Array<String>} editors
   */
  constructor(id, label, indentation, tags, viewers, editors) {
    this.id = id;
    this.label = label ? label : "";
    this.indentation = indentation ? indentation : 0;
    this.tags = tags;
    this.viewers = viewers;
    this.editors = editors;
  }
}
