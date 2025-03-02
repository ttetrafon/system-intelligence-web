import styles from '../style.css?inline';
import { emitSideInfoEvent } from "../helper/dom.js";

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  span {
    font-weight: bold;
    font-style: italic;
    cursor: pointer;
  }
</style>

<span></span>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$label = this._shadow.querySelector("span");
  }

  static get observedAttributes() { return ['label', 'target']; }

  get label() { return this.getAttribute('label'); }
  get target() { return this.getAttribute('target'); }

  set label(value) { this.setAttribute('label', value); }
  set target(value) { this.setAttribute('target', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case "label":
        this.$label.innerText = this.label;
        break;
      case "target":
        this.$label.addEventListener("click", this.toggleInfoTarget.bind(this));
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
    this.$label.removeEventListener("click", this.toggleInfoTarget);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  toggleInfoTarget() {
    emitSideInfoEvent(this.target);
  }
}

window.customElements.define('si-info', Component);