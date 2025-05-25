import styles from '../styles/style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  :host {
    display: flex;
    flex-flow: row nowrap;
    height: 2em;
    align-items: center;
    position: relative;
  }

  #copyright {
    margin: 0 10px;
    color: var(--colour-1);
  }

  #version {
    margin: 0 10px;
    color: var(--colour-1a);
  }
</style>

<span id="version"></span>
<span class="flex-separator"></span>
<si-dice-roller-shortcut></si-dice-roller-shortcut>
<si-chat-shortcut></si-chat-shortcut>
<span class="flex-separator"></span>
<span id="copyright"></span>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$popupTimeoutId = null;

    this.$diceRollerBtn = this._shadow.querySelector("si-dice-roller-shortcut");
    this.$chatBtn = this._shadow.querySelector("si-chat-shortcut");
    this.$popupPanel = this._shadow.querySelector("si-footer-popup-panel");
    this.$copyright = this._shadow.getElementById("copyright");
    this.$version = this._shadow.getElementById("version");

    this.$copyright.innerHTML = `Copyright &#169; 2024 - ${new Date().getFullYear()}`;
    this.$version.innerText = `v. 0.0.43`;
  }

  static get observedAttributes() { return []; }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$chatBtn.addEventListener("mouseenter", this.chatHoverStart.bind(this));
    this.$chatBtn.addEventListener("mouseleave", this.chatHoverEnd.bind(this));
    this.$diceRollerBtn.addEventListener("mouseenter", this.diceHoverStart.bind(this));
    this.$diceRollerBtn.addEventListener("mouseleave", this.diceHoverEnd.bind(this));
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$chatBtn.removeEventListener("mouseenter", this.chatHoverStart);
    this.$chatBtn.removeEventListener("mouseleave", this.chatHoverEnd);
    this.$diceRollerBtn.removeEventListener("mouseenter", this.diceHoverStart);
    this.$diceRollerBtn.removeEventListener("mouseleave", this.diceHoverEnd);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  /**
   *
   * @param {Event} event
   */
  async chatHoverEnd(event) {
    event.stopImmediatePropagation();
  }

  /**
   *
   * @param {Event} event
   */
  async chatHoverStart(event) {
    event.stopImmediatePropagation();
  }

  /**
   *
   * @param {Event} event
   */
  async diceHoverEnd(event) {
    event.stopImmediatePropagation();
  }

  /**
   *
   * @param {Event} event
   */
  async diceHoverStart(event) {
    event.stopImmediatePropagation();
  }
}

window.customElements.define('si-footer', Component);