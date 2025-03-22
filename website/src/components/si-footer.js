import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  div {
    height: 100%;
    align-items: center;
    padding: 0 10px;
  }

  #copyright {
    color: var(--colour-1);
  }

  #version {
    color: var(--colour-1a);
  }
</style>

<div class="flex-line">
  <span id="version"></span>
  <span class="flex-separator"></span>
  <span id="copyright"></span>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$copyright = this._shadow.getElementById("copyright");
    this.$version = this._shadow.getElementById("version");

    this.$copyright.innerHTML = `Copyright &#169; 2024 - ${new Date().getFullYear()}`;
    this.$version.innerText = `v. 0.0.9`;
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

window.customElements.define('si-footer', Component);