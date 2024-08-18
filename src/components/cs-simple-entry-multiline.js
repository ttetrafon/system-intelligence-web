const template = document.createElement('template');

template.innerHTML = /*html*/`
  <style>
    @import './styles-cs-printable.css';
  </style>

<div class="flex-row">
  <h6></h6>
  <div id="container" class="flex-column flex-item-resizable"></div>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'closed' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.$label = this._shadowRoot.querySelector("h6");
    this.$containers = this._shadowRoot.getElementById("container");
  }

  static get observedAttributes() { return ['label', 'lines']; }

  get label() { return this.getAttribute('label'); }
  get lines() {
    let l = this.getAttribute('lines');
    return l ? parseInt(l) : 1;
  }

  set label(value) { this.setAttribute('label', value); }
  set lines(value) { this.setAttribute('lines', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch(name) {
      case "label":
        this.$label.innerText = this.label;
        break;
      case "lines":
        for (let i = 0; i < this.lines; i++) {
          let span = document.createElement("span");
          span.classList.add("entry-line");
          this.$containers.appendChild(span);
        }
        break;
    }
  }
}

window.customElements.define('cs-simple-entry-multiline', Component);