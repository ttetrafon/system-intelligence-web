const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';
</style>

<section>
  <p>A number of attributes describes your overall prowess with any type of action. Each of them is used to perform different actions and features its own % score. Attributes are what you usually roll when making checks.</p>
  <p>Attributes are divided in three categories called attribute traits, <b>Body</b>, <b>Mind</b>, <b>Spirit</b>. Each trait is assigned its relevant <a href="#category-score">category score</a> (<i>body</i>, <i>mind</i>, <i>spirit</i>).</p>

  <h2>Mod</h2>
  <p>An attribute's mod is equal to the attribute's score divided by 10, rounded down. Mods are noted with lower case in the test (e.g.: <b>APP's</b> mod is written as <b>App</b>).</p>

  <h2 id="category-score">Category/Trait Score</h2>
  <p>Each category also has its own score, equal to double the sum of its attributes mods, increased again by double the respective defensive attribute in that category (END, WIL, RES).</p>
  <p class="quote">For example, your Mind score is equal to 2*Ima + 2*Mem + 2*Per + 2*Rea + 4*Wil.</p>
  <p>A trait score is updated immediately when any of its attributes changes.</p>
</section>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));


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

window.customElements.define('si-attributes', Component);