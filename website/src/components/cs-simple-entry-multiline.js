const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles-cs-printable.css';
</style>

<div class="flex-row">
  <input type="checkbox" class="hidden" />
  <h6></h6>
  <div id="container" class="flex-column flex-item-resizable"></div>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$label = this._shadow.querySelector("h6");
    this.$containers = this._shadow.getElementById("container");
    this.$checkbox = this._shadow.querySelector("input");
  }

  static get observedAttributes() { return ['label', 'lines', 'checkbox']; }

  get label() { return this.getAttribute('label'); }
  get lines() {
    let l = this.getAttribute('lines');
    return l ? parseInt(l) : 1;
  }
  get checkbox() { return this.getAttribute('checkbox', 'skill'); }
  get skill() { return this.getAttribute('skill'); }

  set label(value) { this.setAttribute('label', value); }
  set lines(value) { this.setAttribute('lines', value); }
  set checkbox(value) { this.setAttribute('checkbox', value); }
  set skill(value) { this.setAttribute('skill', value); }

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
      case "checkbox":
        switch(this.checkbox) {
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

window.customElements.define('cs-simple-entry-multiline', Component);