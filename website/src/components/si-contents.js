import { commandNames, eventNames } from '../data/enums.js';
import { deepCopy } from '../helper/data.js';
import { Command_AppMenu_AddItem } from '../model/command.js';
import styles from '../style.css?inline';
import state from '../services/state.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: block;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    gap: 5px;
  }

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
    flex-grow: 1;
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
<section id="container">
</section>
<div id="controls" class="flex-line">
  <button-text-image id="add-contents-item-empty"
    label="Add Page"
    hide-text=true,
    image="add"
    event-name=${ eventNames.ADD_CONTENTS_ITEM.description }
  ></button-text-image>
</div>
<hr>
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
    this.$contentItems = {}; // String (UUID), HTMLElement
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

  /**
   *
   * @returns
   */
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
   */
  addItem(after, indentation) {
    let item = document.createElement("si-contents-item");
    item.setAttribute("indentation", indentation);

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
  async createAddItemCommand(after, indentation, event) {
    event.stopPropagation();
    const addItemCommand = new Command_AppMenu_AddItem(this.$appMenus.version, indentation, after);
    const res = await state.publishCommand(addItemCommand);
    this.executeCommands(res);
  }

  /**
   *
   * @param {JSON} commands
   */
  async executeCommands(data) {
    for (let i = 0; i < data.commands.length; i++) {
      const command = data.commands[i];
      console.log("... executing command:", command);
      switch (command.$type) {
        case commandNames.COMMAND_APP_MENUS_ADD_ITEM.description:
          // items
          this.$appMenus.items[command.$identifier] = {
            id: command.$identifier,
            indentation: command.$indentation,
            label: "..."
          };

          // order
          let afterElement = null;
          if (command.$after) {
            let afterIndex = this.$appMenus.order.indexOf(command.$after);
            afterElement = this.$contentItems[command.$after];
            if (afterIndex >= 0) {
              if (this.$appMenus.order.length > afterIndex) {
                this.$appMenus.order.splice(afterIndex + 1, 0, command.$identifier);
              }
              else {
                this.$appMenus.order.push(command.$identifier);
              }
            }
          }
          else {
            this.$appMenus.order.unshift(command.$identifier);
          }

          // version
          this.$appMenus.version = data.info.newVersion;
          console.log("this.$appMenus:", this.$appMenus);

          // execution
          this.addItem(afterElement, command.$indentation);
          break;
        case commandNames.COMMAND_APP_MENUS_INDENT_ITEM.description:
          break;
        case commandNames.COMMAND_APP_MENUS_MOVE_ITEM.description:
          break;
      }
    }
  }
}

window.customElements.define('si-contents', Component);