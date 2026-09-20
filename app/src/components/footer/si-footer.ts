import { Logger } from "../../../library/lib/services/logger";

const templateSiFooter: HTMLTemplateElement = document.createElement('template');
const componentNameSiFooter: string = "si-footer";

templateSiFooter.innerHTML = /*html*/`
<style>
  :host {
    display: block;
    width: 100%;
  }
</style>

<div>...</div>
`;

class SiFooter extends HTMLElement {
  _shadow: ShadowRoot;
  _initialised: boolean = false;
  _l: Logger | undefined;

  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(templateSiFooter.content.cloneNode(true));
  }

  static get observedAttributes() { return ['label', 'data']; }

  get data() { return JSON.parse(this.getAttribute('data') ?? "{}"); }
  get label() { return this.getAttribute('label'); }

  set data(value: string) { this.setAttribute('data', value); }
  set label(value: string | null) { this.setAttribute('label', value ?? ""); }

  attributeChangedCallback(name: string, oldVal: string, newVal: any) {
    this._l?.debug(`---> attributeChangedCallback(${name}, ${oldVal}, ${newVal})`, componentNameSiFooter);
    if (oldVal == newVal) return;
    switch (name) {
      default:
        break;
    }
  }
  connectedCallback() {
    if (!this._initialised) {
      // ... initial setup
      this._initialised = true;
    }

    this._l = Logger.getInstance();
  }
  disconnectedCallback() {
  }
  adoptedCallback() {
  }
}

window.customElements.define(componentNameSiFooter, SiFooter);