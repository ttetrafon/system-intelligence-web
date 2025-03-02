import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  div {
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: space-between;
  }
</style>

<div class="flex-line">
  <span id="flex-separator"></span>
  <si-search-bar></si-search-bar>
  <span id="flex-separator"></span>
</div>
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

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch(name) {
      default:
        break;
    }
  }
}

window.customElements.define('si-header', Component);