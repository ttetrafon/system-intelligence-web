import { commandNames, eventNames, generalNames } from '../data/enums.js';
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
<!--  <button-text-image id="add-contents-item-empty"
    label="Add Page"
    hide-text=true,
    image="add"
    event-name=${ eventNames.CONTENTS_ITEM_ADD.description }
  ></button-text-image> -->
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

    this.$addItemBtn = this._shadow.getElementById("add-contents-item-empty");
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

}

window.customElements.define('si-contents', Component);