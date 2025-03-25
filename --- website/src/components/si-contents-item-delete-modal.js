import { emitDialogCancelEvent, emitDialogConfirmEvent } from '../../../website/src/helper/dom.js';
import state from '../../../website/src/services/state.js';
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

  h1, p {
    margin: 0 0 10px 0;
    text-align: center;
  }

  div.flex-line {
    margin: auto;
    gap: 25px;
  }
</style>

<h1></h1>
<p>Are you sure you want to delete this page?</p>
<p>All relevant data will be deleted immediately.</p>
<hr>
<div class="flex-line">
  <button id="ok">Delete</button>
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

    this.$title = this._shadow.querySelector("h1");

    this.$okBtn = this._shadow.getElementById("ok");
    this.$cancelBtn = this._shadow.getElementById("cancel");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['uuid', 'title']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get uuid() { return JSON.parse(this.getAttribute('uuid')); }
  get title() { return this.getAttribute('title'); }

  set uuid(value) { this.setAttribute('uuid', value); }
  set title(value) { this.setAttribute('title', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case "title":
        this.$title.innerText = `Delete ${this.title} page?`;
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$okBtn.addEventListener('click', this.confirmDialog.bind(this));
    this.$cancelBtn.addEventListener('click', this.cancelDialog.bind(this));
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

  cancelDialog(event) {
    event.stopImmediatePropagation();
    emitDialogCancelEvent(this.$cancelBtn);
  }

  confirmDialog(event) {
    event.stopImmediatePropagation();

    emitDialogConfirmEvent(this.$okBtn, {
      uuid: this.uuid
    });
  }
}

window.customElements.define('si-contents-item-delete-modal', Component);