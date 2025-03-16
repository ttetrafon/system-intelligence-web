import { eventNames } from '../data/enums.js';
import { deepCopy } from '../helper/data.js';
import styles from '../style.css?inline';
import state from '../services/state.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  h3 {
    text-align: center;
    font-size: 1rem;
  }

  hr {
    color: var(--colour-quaternary);
    opacity: 0.75;
  }

  section {
    width: 100%;
    overflow-y: auto;
    overflow-x: auto;
    padding: 10px;
  }

  #container {

  }

  #controls {
    height: var(--statics-controls-short);
    justify-content: flex-end;
  }

  #add-contents-item-empty {
    opacity: 0.75;
  }

  @media (prefers-color-scheme: light) {
    hr {
      color: var(--colour-primary);
    }
  }
</style>

<h3>Table of Contents</h3>
<hr>
<section>
  <div id="container" class="flex-column"></div>
  <div id="controls" class="flex-line">
    <button-text-image id="add-contents-item-empty"
      label="Add Page"
      hide-text=true,
      image="add"
      event-name=${ eventNames.ADD_CONTENTS_ITEM.description }
    ></button-text-image>
  </div>
</section>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$btnAddItemOnEmptyContents = this._shadow.getElementById("add-contents-item-empty");
    this.$container = this._shadow.getElementById("container");

    this.$appMenus = {
      version: 0,
      order: [],
      items: {}
    };
    this.$locallyExecutedCommands = [];
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return []; }

  // A web component implements the following lifecycle methods.
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$btnAddItemOnEmptyContents.addEventListener(eventNames.ADD_CONTENTS_ITEM.description, this.createAddItemCommand.bind(this, null, 0));

    this.buildTableOfContents();
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$btnAddItemOnEmptyContents.removeEventListener(eventNames.ADD_CONTENTS_ITEM.description, this.createAddItemCommand);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async buildTableOfContents() {
    let res = await state.getAppMenus();
    if (res.version == this.$appMenus.version) return;

    this.$appMenus = deepCopy(res["app-menus"]);
    for (let i = 0; i < this.$appMenus.order.length; i++) {

    }
  }

  /**
   *
   * @param {HTMLElement} after
   * @param {Number} indentation
   * @param {Event} event
   */
  addItem(after, indentation, event) {
    let item = document.createElement("si-contents-item");

    if (after) {
      after.insertAdjacentElement('afterend', item);
    }
    else {
      this.$container.appendChild(item);
    }
  }

  /**
   *
   * @param {HTMLElement} after
   * @param {Number} indentation
   * @param {Event} event
   */
  createAddItemCommand(after, indentation, event) {

  }

  /**
   *
   * @param {JSON} command
   */
  executeCommand(command) {
    if (this.$locallyExecutedCommands.includes(command.id)) {
      let index = this.$locallyExecutedCommands.indexOf(command.id);
      this.$locallyExecutedCommands.slice()

      return;
    }

    // TODO: execute command as appropriate
  }

  toggleBtnAddOnEmptyContents() {
    this.$btnAddItemOnEmptyContents.classList.toggle("hidden", this.$appMenus.order.length != 0);
  }
}

window.customElements.define('si-contents', Component);