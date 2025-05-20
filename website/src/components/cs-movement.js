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

  th {
    text-align: center;
    font-style: italic;
  }

  th:nth-child(1) {
    width: 85px;
  }
  th:nth-child(2) {
    width: 50px;
  }
  th:nth-child(3) {
    width: 100px;
  }
  th:nth-child(5), th:nth-child(6), th:nth-child(7) {
    width: 25px;
  }
  th:nth-child(5), th:nth-child(6), td:nth-child(5), td:nth-child(6) {
    border-right: none;
  }
  th:nth-child(6), th:nth-child(7), td:nth-child(6), td:nth-child(7) {
    border-left: none;
  }

  .sense {
    text-align: center;
    font-weight: bold;
  }

  .centred {
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
      <th></th>
      <th>score</th>
      <th>speed</th>
      <th>manoeuvrability</th>
      <th class="vertical">solid</th>
      <th class="vertical">liquid</th>
      <th class="vertical">gas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="sense"><input type="checkbox"> Walk</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
    <tr>
      <td class="sense"><input type="checkbox"> Climb</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
    <tr>
      <td class="sense"><input type="checkbox"> Swim</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
    <tr>
      <td class="sense"><input type="checkbox"> Fly</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
    <tr>
      <td class="sense"><input type="checkbox"> Glide</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
    <tr>
      <td class="sense"><input type="checkbox"> Teleport</td>
      <td></td>
      <td></td>
      <td></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
      <td class="centred"><input type="checkbox"></td>
    </tr>
  </tbody>
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

window.customElements.define('cs-movement', Component);