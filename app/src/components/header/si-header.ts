import { Logger } from "../../../library/lib/services/logger";

const templateSiHeader: HTMLTemplateElement = document.createElement('template');
const componentNameSiHeader: string = "si-header";

templateSiHeader.innerHTML = /*html*/`
<style>
  :host {
    display: block;
    width: 100%;
  }
</style>

<div>...</div>
`;

class SiHeader extends HTMLElement {
  _shadow: ShadowRoot;
  _initialised: boolean = false;
  _l: Logger | undefined;

  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(templateSiHeader.content.cloneNode(true));
  }

  static get observedAttributes() { return ['label', 'data']; }

  get data() { return JSON.parse(this.getAttribute('data') ?? "{}"); }
  get label() { return this.getAttribute('label'); }

  set data(value: string) { this.setAttribute('data', value); }
  set label(value: string | null) { this.setAttribute('label', value ?? ""); }

  attributeChangedCallback(name: string, oldVal: string, newVal: any) {
    this._l?.debug(`---> attributeChangedCallback(${name}, ${oldVal}, ${newVal})`, componentNameSiHeader);
    if (oldVal == newVal) return;
    switch (name) {
      default:
        break;
    }
  }
  connectedCallback() {
    if (!this._initialised) {
      this._initialised = true;
    }

    this._l = Logger.getInstance();
  }
  disconnectedCallback() {
  }
  adoptedCallback() {
  }
}

window.customElements.define(componentNameSiHeader, SiHeader);