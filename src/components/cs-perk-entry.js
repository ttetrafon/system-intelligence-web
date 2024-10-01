const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles-cs-printable.css';
</style>

<div class="flex-row">
  <input type="checkbox" class="hidden" />
  <h6></h6>
  <span>(</span>
  <span id="note"></span>
  <span>)</span>
  <span id="value" class="entry-line-small"></span>
  <span>[</span>
  <span class="entry-line-small"></span>
  <span>/</span>
  <span class="entry-line-small"></span>
  <span>]</span>
</div>
<div class="flex-row">
  <input type="checkbox" class="invisible" />
  <span class="entry-line"></span>
</div>
<div class="flex-row">
  <input type="checkbox" class="invisible" />
  <span class="entry-line"></span>
</div>
<div class="flex-row">
  <input type="checkbox" class="invisible" />
  <span class="entry-line"></span>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'closed' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.$label = this._shadowRoot.querySelector("h6");
    this.$checkbox = this._shadowRoot.querySelector("input");
    this.$note = this._shadowRoot.getElementById("note");
  }

  static get observedAttributes() { return ['label', 'checkbox', 'note']; }

  get checkbox() { return this.getAttribute('checkbox', 'skill'); }
  get label() { return this.getAttribute('label'); }
  get note() { return this.getAttribute('note', 'skill'); }

  set checkbox(value) { this.setAttribute('checkbox', value); }
  set label(value) { this.setAttribute('label', value); }
  set note(value) { this.setAttribute('note', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    // console.log(`--> attributeChangedCallback(${name}, ${JSON.stringify(oldVal)}, ${JSON.stringify(newVal)})`);
    if (oldVal == newVal) return;
    switch(name) {
      case "label":
        if (this.label == "_") {
          this.$label.classList.add("entry-line");
        }
        else {
          this.$label.innerText = this.label;
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
      case "note":
        if (this.note == "_") {
          this.$note.classList.add("entry-line");
        }
        else {
          this.$note.innerText = this.note;
        }
        break;
    }
  }
}

window.customElements.define('cs-perk-entry', Component);