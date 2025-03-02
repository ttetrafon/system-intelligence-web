import styles from '../style.css?inline';
import state from '../service/state.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  si-editor-header {
    width: 100%;
  }

  section {
    width: 100%;
  }
</style>

<si-editing-header></si-editing-header>
<section class="flex-column"></section>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$panelData = {};

    this.$container = this._shadow.querySelector("section");
  }

  static get observedAttributes() { return ['label', 'data-path']; }

  get dataPath() { return this.getAttribute('data-path'); }
  get label() { return this.getAttribute('label'); }

  set dataPath(value) { this.setAttribute('data-path', value); }
  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`---> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch (name) {
      case "data-path":
        this.initialiseData();
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async initialiseData() {
    if (!this.dataPath) return;

    this.$panelData = await state.fetchData(this.dataPath);
  }
}

window.customElements.define('si-panel', Component);