import styles from '../style.css?inline';
import state from '../service/state.js';
import { buildHtmlFromStructure, clearChildren } from '../helper/dom.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  article {
    width: 100%;
    padding: 10px;
    position: relative;
  }

  #nav {
    justify-content: flex-end;
    gap: 3px;
  }
  #title {
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
  }
  #title * {
    width: 100%;
    overflow: hidden;
  }
  button {
    width: 22px;
    height: 22px;
  }
  button:hover {
    background-color: var(--colour-2a);
  }

  #id {
    margin-top: 25px;
  }
</style>

<article class="border-dark">
  <section id="nav" class="flex-line">
    <div class="flex-line">
      <div id="title"></div>
      <button id="move-up"><img src="./img/ui/btn_move_up.png" /></button>
      <button id="move-down"><img src="./img/ui/btn_move_down.png" /></button>
      <button id="minimise"><img src="./img/ui/btn_minimise.png" /></button>
      <button id="maximise" class="hidden"><img src="./img/ui/btn_maximise.png" /></button>
      <button id="close"><img src="./img/ui/btn_close.png" /></button>
    </div>
  </section>
  <section id="data"></section>
</article>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.getElementById("data");
    this.$title = this._shadow.getElementById("title");
    this.$btnMoveUp = this._shadow.getElementById("move-up");
    this.$btnMoveDown = this._shadow.getElementById("move-down");
    this.$btnMinimise = this._shadow.getElementById("minimise");
    this.$btnMaximise = this._shadow.getElementById("maximise");
    this.$btnClose = this._shadow.getElementById("close");

    this.$htmlStructure = [];
  }

  static get observedAttributes() { return ['target']; }

  get target() { return this.getAttribute('target'); }

  set target(value) { this.setAttribute('target', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case "target":
        this.populateCard(this.target.split("."));
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$btnClose.addEventListener("click", this.closeCard.bind(this));
    this.$btnMaximise.addEventListener("click", this.maximiseCard.bind(this));
    this.$btnMinimise.addEventListener("click", this.minimiseCard.bind(this));
    this.$btnMoveDown.addEventListener("click", this.moveCardDown.bind(this));
    this.$btnMoveUp.addEventListener("click", this.moveCardUp.bind(this));
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$btnClose.removeEventListener("click", this.closeCard);
    this.$btnMaximise.removeEventListener("click", this.maximiseCard);
    this.$btnMinimise.removeEventListener("click", this.minimiseCard);
    this.$btnMoveDown.removeEventListener("click", this.moveCardDown);
    this.$btnMoveUp.removeEventListener("click", this.moveCardUp);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  closeCard() {
  }

  maximiseCard() {
    this.$btnMinimise.classList.remove("hidden");
    this.$btnMaximise.classList.add("hidden");
    this.$container.classList.remove("hidden");
    clearChildren(this.$title);
  }

  minimiseCard() {
    this.$btnMinimise.classList.add("hidden");
    this.$btnMaximise.classList.remove("hidden");
    this.$container.classList.add("hidden");
    let firstElement = this.$htmlStructure[0];
    if (firstElement) {
      buildHtmlFromStructure([ firstElement ], this.$title);
    }
  }

  moveCardDown() {
  }

  moveCardUp() {
  }

  async populateCard(target) {
    console.log(`---> populateCard(${JSON.stringify(target)})`);
    this.$htmlStructure = state.getInfoCardStructure(target);
    clearChildren(this.$container);
    buildHtmlFromStructure(this.$htmlStructure, this.$container);
  }
}

window.customElements.define('si-info-card', Component);