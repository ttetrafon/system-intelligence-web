const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles-cs-printable.css';
</style>

<div class="flex-row">
  <input type="checkbox" class="hidden" />
  <h6></h6>
  <span class="entry-line"></span>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'closed' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.$label = this._shadowRoot.querySelector("h6");
    this.$span = this._shadowRoot.querySelector("span");
    this.$checkbox = this._shadowRoot.querySelector("input");
  }

  static get observedAttributes() { return ['label', 'checkbox', 'skill']; }

  get label() { return this.getAttribute('label'); }
  get checkbox() { return this.getAttribute('checkbox'); }
  get skill() { return this.getAttribute('skill'); }

  set label(value) { this.setAttribute('label', value); }
  set checkbox(value) { this.setAttribute('checkbox', value); }
  set skill(value) { this.setAttribute('skill', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch (name) {
      case "label":
        if (this.label == "_") {
          this.$label.classList.add("entry-line");
          this.$span.classList.remove("entry-line");
          this.$span.classList.add("entry-line-small");
        }
        else {
          this.$label.innerText = this.label;
        }
        break;
      case "checkbox":
        switch (this.checkbox) {
          case "invisible":
            this.$checkbox.classList.add("invisible");
            this.$checkbox.classList.remove("hidden");
            break;
          case "hidden":
            this.$checkbox.classList.add("hidden");
            this.$checkbox.classList.remove("invisible");
            break;
          default:
            this.$checkbox.classList.remove("hidden");
            this.$checkbox.classList.remove("invisible");
            break;
        }
        break;
      case "skill":
        switch(this.skill) {
          case "complex":
            this.$label.classList.add("complex");
            break;
          default:
            this.$label.classList.remove("complex");
            break;
        }
        break;
    }
  }
}

window.customElements.define('cs-simple-entry-line', Component);