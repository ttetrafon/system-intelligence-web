import { buildHtmlFromStructure } from '../helper/dom.js';
import state from '../helper/state.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';
</style>

<section></section>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.querySelector("section");
  }

  static get observedAttributes() { return ['label']; }

  get label() { return this.getAttribute('label'); }

  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
    }
  }
  connectedCallback() {
    this.initialiseAttributes();
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

  async initialiseAttributes() {
    let attributes = await state.fetchData("attributes");
    // console.log("attributes", attributes);
    buildHtmlFromStructure(attributes.structure, this.$container);
  }
}

window.customElements.define('si-attributes', Component);