import { emitDialogCancelEvent, emitDialogConfirmEvent } from '../helper/dom';
import state from '../services/state.js';
import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: flex;
    flex-flow: column nowrap;
    justify-content: stretch;
    gap: 10px;
  }

  h1 {
    text-align: center;
  }

  div.flex-line {
    margin: auto;
    gap: 25px;
  }
</style>

<h1>Page</h1>
<input-field id="label-input"
  label="Label"
  direction="line"
></input-field>
<input-field id="indentation-input"
  label="Indentation"
  type="number"
  direction="line"
></input-field>
<selector-field id="after-selector"
  label="After"
  direction="line"
></selector-field>
<hr>
<div class="flex-line">
  <button id="ok">Ok</button>
  <button id="cancel">Cancel</button>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$labelInput = this._shadow.getElementById("label-input");
    this.$indentationInput = this._shadow.getElementById("indentation-input");
    this.$afterSelector = this._shadow.getElementById("after-selector");

    this.$title = this._shadow.querySelector("h1");
    this.$okBtn = this._shadow.getElementById("ok");
    this.$cancelBtn = this._shadow.getElementById("cancel");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['indentation', 'title']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get indentation() { return this.getAttribute('indentation'); }
  get title() { return JSON.parse(this.getAttribute('title')); }

  set indentation(value) { this.setAttribute('indentation', value); }
  set title(value) { this.setAttribute('title', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case "indentation":
        this.$indentationInput.setAttribute('initial-value', this.indentation);
        break;
      case "title":
        this.$title.innerText = this.title;
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$okBtn.addEventListener('click', this.confirmDialog.bind(this));
    this.$cancelBtn.addEventListener('click', this.cancelDialog.bind(this));

    this.buildSelector();
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$okBtn.removeEventListener('click', this.confirmDialog);
    this.$cancelBtn.removeEventListener('click', this.cancelDialog);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async buildSelector() {
    let appMenus = await state.getAppMenus();
    let afterSelectorOptions = {
      valueKey: 'value',
      textKey: 'text',
      options: [
        {
          value: "-",
          text: "--- FIRST ---"
        }
      ]
    };
    for (let i = 0; i < appMenus.order.length; i++) {
      let itemId = appMenus.order[i];
      let label = appMenus.items[itemId].label;

      afterSelectorOptions.options.push({
        value: itemId,
        text: label
      });
    }
    this.$afterSelector.setAttribute("options", JSON.stringify(afterSelectorOptions));
  }

  cancelDialog(event) {
    event.stopImmediatePropagation();
    emitDialogCancelEvent(this.$cancelBtn);
  }

  confirmDialog(event) {
    event.stopImmediatePropagation();

    let label = this.$labelInput.getValue();
    if (!label || label == "") label = "Untitled page";

    let indentation = Number(this.$indentationInput.getValue());
    if (!indentation) indentation = 0;

    let afterElement = this.$afterSelector.getValue();

    emitDialogConfirmEvent(this.$okBtn, {
      label: label,
      indentation: indentation,
      after: afterElement
    });
  }
}

window.customElements.define('si-contents-item-modal', Component);