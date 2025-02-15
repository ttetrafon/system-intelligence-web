import { svgRequest } from '../helper/requests.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';

  #svg-container {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    justify-content: center;
  }
  svg {
    width: 100%;
    aspect-ratio: 1;
  }

  .pointer {
    cursor: pointer;
  }
</style>

<div id="svg-container" class="flex-column"></div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$svgContainer = this._shadow.querySelector("div");
    this.$svg;
    this.$path;
  }

  static get observedAttributes() { return ['background', 'colour', 'label', 'image', 'pointer']; }

  get background() { return this.getAttribute('background'); }
  get colour() { return this.getAttribute('colour'); }
  get image() { return this.getAttribute('image'); }
  get label() { return this.getAttribute('label'); }
  get pointer() { return JSON.parse(this.getAttribute('pointer')); }

  set background(value) { this.setAttribute('background', value); }
  set colour(value) { this.setAttribute('colour', value); }
  set image(value) { this.setAttribute('image', value); }
  set pointer(value) { this.setAttribute('pointer', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case "image":
        this.createSvg(`./img/ui/${this.image}`);
        break;
      case "label":
        this.$svgContainer.setAttribute("title", this.label);
        this.setAlt();
        break;
      case "colour":
        this.setColour();
        break;
      case "background":
        this.setBackground();
        break;
      case "pointer":
        this.setPointer();
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

  async createSvg(url) {
    let svg = await svgRequest(url);
    this.$svgContainer.innerHTML = svg;
    this.$svg = this._shadow.querySelector("svg");
    this.$path = this._shadow.querySelector("path");
    this.setColour();
    this.setAlt();
    this.setBackground();
    this.setPointer();
  }

  setAlt() {
    if (this.$svg && this.label) {
      this.$svg.setAttribute("alt", this.label);
    }
  }

  setBackground() {
    if (this.$svgContainer && this.background) {
      this.$svgContainer.style.backgroundColor = this.background;
    }
  }

  setColour() {
    if (this.$svg && this.colour) {
      this.$svg.setAttribute("fill", this.colour);
    }
  }

  setPointer() {
    console.log(`setPointer()`, this.pointer, this.$svg, this.pointer != null, this.pointer != undefined);
    if (this.$svg && this.pointer != null && this.pointer != undefined) {
      this.$svg.classList.toggle("pointer", this.pointer);
      this.$path.classList.toggle("pointer", this.pointer);
    }
  }
}

window.customElements.define('svg-wrapper', Component);