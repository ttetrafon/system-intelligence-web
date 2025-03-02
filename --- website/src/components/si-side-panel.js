const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';

  section {
    align-items: stretch;
  }
</style>

<section class="flex-column">

</section>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.querySelector("section");

    this.$displayedInfoPanels = {}; // "string (): HTMLElement"
  }

  static get observedAttributes() { return ['label']; }

  get label() { return this.getAttribute('label'); }

  set label(value) { this.setAttribute('label', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    document.addEventListener("toggle-info", this.toggleInfoEvent.bind(this));
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    document.removeEventListener("toggle-info", this.toggleInfoEvent);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  async toggleInfoCard(target) {
    if (this.$displayedInfoPanels.hasOwnProperty(target)) {
      this.$displayedInfoPanels[target].remove();
      delete this.$displayedInfoPanels[target];
    }
    else {
      let infoCard = document.createElement("si-info-card");
      infoCard.setAttribute("target", target);
      this.$container.appendChild(infoCard);
      this.$displayedInfoPanels[target] = infoCard;
    }
  }

  toggleInfoEvent(event) {
    event.stopPropagation();
    console.log(`toggle-info received: ${JSON.stringify(event.detail)}`);
    let target = event.detail.target;
    this.toggleInfoCard(target);
  }
}

window.customElements.define('si-side-panel', Component);