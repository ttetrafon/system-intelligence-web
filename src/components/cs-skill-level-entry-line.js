const template = document.createElement('template');

template.innerHTML = /*html*/`
  <style>
    @import './styles-cs-printable.css';
  </style>

<div class="flex-row">
  <h6></h6>
  <span class="entry-line"></span>
  <span>[</span>
  <span class="entry-line-small"></span>
  <span>/</span>
  <span class="entry-line-small"></span>
  <span>]</span>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'closed' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.$label = this._shadowRoot.querySelector("h6");
  }

  static get observedAttributes() { return ['label']; }

  get label() { return this.getAttribute('label'); }

  set label(value) { this.setAttribute('label', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch(name) {
      case "label":
        this.$label.innerText = this.label;
    }
  }
}

window.customElements.define('cs-skill-level-entry-line', Component);