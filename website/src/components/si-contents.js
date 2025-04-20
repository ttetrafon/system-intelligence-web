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

  #main-menu-btn {
    display: none;
  }

  h3 {
    text-align: center;
    font-size: 1rem;
    white-space: nowrap;
  }

  hr {
    color: var(--colour-quaternary);
    opacity: 0.75;
  }

  section {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    flex-grow: 1;
    gap: 8px;
  }

  #controls {
    height: var(--statics-controls-short);
    justify-content: flex-end;
  }

  @media (max-width: 1024px) {
    #main-menu-btn {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      height: 50px;
      z-index: 33;
    }
  }

  @media (prefers-color-scheme: light) {
    hr {
      color: var(--colour-primary);
    }
  }
</style>

<h3>Table of Contents</h3>

<hr>

<section id="container" class="flex-column">
  <si-contents-page
    label="Introduction"
    image="menu_book"
    link="introduction"
  ></si-contents-page>
  <si-contents-page
    label="Gameplay"
    image="casino",
    link="gameplay"
  ></si-contents-page>
  <si-contents-page
    label="Characters"
    image="supervisor_account"
  ></si-contents-page>
  <si-contents-page
    label="Adventuring"
    image="nordic_walking"
  ></si-contents-page>
  <si-contents-page
    label="Equipment"
    image="construction"
  ></si-contents-page>
  <si-contents-page
    label="Vehicles"
    image="transportation"
  ></si-contents-page>
  <si-contents-page
    label="Organisations"
    image="source_environment"
  ></si-contents-page>
  <si-contents-page
    label="World"
    image="globe_location_pin"
  ></si-contents-page>
</section>

<hr>

<div id="controls" class="flex-multi-line">
</div>

`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

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