import { commandNames, eventNames, generalNames } from '../data/enums.js';
import { clearChildren, emitDialogEvent } from '../helper/dom.js';
import { Command_AppMenu_AddItem } from '../model/command.js';
import state from '../services/state.js';
import styles from '../style.css?inline';

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
    event-name=${ eventNames.CONTENTS_ITEM_ADD.description }
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

    this.$AddItemBtn = this._shadow.getElementById("add-contents-item-empty");
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
    this.$AddItemBtn.addEventListener(eventNames.CONTENTS_ITEM_ADD.description, this.triggerItemDialog.bind(this, generalNames.PAGE_NEW.description, 0));

    this.buildTableOfContents();
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$AddItemBtn.removeEventListener(eventNames.CONTENTS_ITEM_ADD.description, this.triggerItemDialog);
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

    clearChildren(this.$container);

    this.$appMenus = res;
    for (let i = 0; i < this.$appMenus.order.length; i++) {
      let data = this.$appMenus.items[this.$appMenus.order[i]];

      let item = document.createElement("si-contents-item");
      item.setAttribute("label", data.label);
      item.setAttribute("indentation", data.indentation);
      this.$container.appendChild(item);
    }
  }

  /**
   *
   * @param {HTMLElement} after
   * @param {Number} indentation
   */
  addItem(after, label, indentation) {
    let item = document.createElement("si-contents-item");
    item.setAttribute("label", label);
    item.setAttribute("indentation", indentation);

    if (after) {
      after.insertAdjacentElement('afterend', item);
    }
    else {
      this.$container.prepend(item);
    }
  }

  /**
   *
   * @param {JSON} data
   */
  async createAddItemCommand(data) {
    const addItemCommand = new Command_AppMenu_AddItem(
      this.$appMenus.version,
      data.label,
      data.indentation,
      data.after != "-" ? data.after : null
    );
    console.log("addItemCommand:", addItemCommand);
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
      switch (command.type) {
        case commandNames.COMMAND_APP_MENUS_ADD_ITEM.description:
          // items
          this.$appMenus.items[command.identifier] = {
            id: command.identifier,
            label: command.label,
            indentation: command.indentation
          };

          // order
          let afterElement = null;
          if (command.after) {
            let afterIndex = this.$appMenus.order.indexOf(command.after);
            afterElement = this.$contentItems[command.after];
            if (afterIndex >= 0) {
              if (this.$appMenus.order.length > afterIndex) {
                this.$appMenus.order.splice(afterIndex + 1, 0, command.identifier);
              }
              else {
                this.$appMenus.order.push(command.identifier);
              }
            }
          }
          else {
            this.$appMenus.order.unshift(command.identifier);
          }

          // version
          this.$appMenus.version = data.info.newVersion;
          console.log("this.$appMenus:", this.$appMenus);

          // execution
          this.addItem(afterElement, command.label, command.indentation);
          break;
        case commandNames.COMMAND_APP_MENUS_INDENT_ITEM.description:
          break;
        case commandNames.COMMAND_APP_MENUS_MOVE_ITEM.description:
          break;
        default:
          console.warn(`"No command matched: ${JSON.stringify(command)}"`);
          break;
      }
    }
  }

  /**
   *
   * @param {Number} indentation
   */
  async triggerItemDialog(title, indentation) {
    emitDialogEvent(
      this.$AddItemBtn,
      "si-contents-item-modal",
      {
        "title": title,
        "indentation": indentation
      },
      this.createAddItemCommand.bind(this)
    );
  }
}

window.customElements.define('si-contents', Component);