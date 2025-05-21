import styles from '../styles/styles-cs-printable.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: block;
    width: 100%;
  }

  table {
    width: 100%;
  }

  table, thead, tbody, tr, th, td {
    border: none;
  }

  th {
    font-style: italic;
    text-align: center;
    text-decoration: underline;
  }

  tr {
    height: 30px;
  }

  th:nth-child(1) {
    width: 100px;
  }

  th:nth-child(3) {
    width: 50px;
  }

  th:nth-child(4) {
    width: 60px;
  }

  .centred {
    font-style: italic;
    font-weight: bold;
    text-align: center;
  }

  .vertical {
    writing-mode: vertical-rl;
    transform: rotate(200deg);
    white-space: nowrap;
  }
</style>

<table>
  <thead>
    <tr>
      <th>item (slot)</th>
      <th>properties</th>
      <th>health</th>
      <th>TL/ML</th>
    </tr>
  </thead>
</table>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return []; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.

  // A web component implements the following lifecycle methods.
  /**
   * Attribute value changes can be tied to any type of functionality through the lifecycle methods.
   * @param {String} name
   * @param {Object} oldVal
   * @param {Object} newVal
   * @returns
   */
  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch (name) {
    }
  }
  /**
   * Triggered when the component is added to the DOM.
   */
  connectedCallback() {
  }
  /**
   * Triggered when the component is removed from the DOM.
   * - Ideal place for cleanup code.
   * - Note that when destroying a component, it is good to also release any listeners.
   */
  disconnectedCallback() {
  }
  /**
   * Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
   * Note that adoption does not trigger the constructor again.
   */
  adoptedCallback() {
  }
}

window.customElements.define('cs-equipment', Component);