import { contentsSubpages } from '../data/data.js';
import { eventNames } from '../data/enums.js';
import { emitCustomEvent, emitNavigationEvent, makeDetailsPanelOpenHoverable, unmakeDetailsPanelOpenHoverable } from '../helper/dom.js';
import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: block;
    border-radius: 5px;
  }

  summary {
    margin-top: 5px;
    border-radius: 10px;
    padding: 0 10px;
    white-space: nowrap;
    align-items: center;
    height: 1.25em;
  }

  #drag-handle {
    cursor: move;
  }

  svg-wrapper {
    margin-right: 5px;
  }

  a {
    white-space: nowrap;
    cursor: pointer;
  }
  a:hover {
    text-decoration: underline;
  }

  #subpages {
    margin-top: 3px;
    padding: 5px;
    gap: 8px;
  }
</style>

<details>
  <summary class="flex-line">
    <svg-wrapper id="page-image" class="hidden"></svg-wrapper>
    <a id="page"></a>
  </summary>
  <div id="subpages" class="flex-column hidden"></div>
</details>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$details = this._shadow.querySelector("details");
    this.$summary = this._shadow.querySelector("summary");
    this.$pageImage = this._shadow.getElementById("page-image");
    this.$page = this._shadow.getElementById("page");
    this.$subpages = this._shadow.getElementById("subpages");

    this.indentationBasisPx = 15;

    this.$hasSub = false;
    this.$detailsControls = {
      detailsForcedOpen: false,
      detailsOpenFromHover: false
    };
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['image', 'indentation', 'label', 'link']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get image() { return this.getAttribute('image'); }
  get indentation() { return JSON.parse(this.getAttribute('indentation')); }
  get label() { return this.getAttribute('label'); }
  get link() { return `/${this.getAttribute('link')}`; }

  set image(value) { this.setAttribute('image', value); }
  set indentation(value) { this.setAttribute('indentation', value); }
  set label(value) { this.setAttribute('label', value); }
  set link(value) { this.setAttribute('link', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case 'image':
        this.$pageImage.classList.remove("hidden");
        this.$pageImage.setAttribute("image", this.image);
        break;
      case 'indentation':
        this.$details.style.paddingLeft = `${ this.indentation * this.indentationBasisPx }px`;
        for (let i = 0; i < this.$subpages.children.length; i++) {
          this.setSubpageIndentation(this.$subpages.children[i]);
        }
        break;
      case 'label':
        this.$page.innerText = this.label;
        this.$summary.setAttribute("title", this.label);
        this.setupSubs();
        break;
      case 'link':
        this.$page.setAttribute("href", this.link);
        this.$page.addEventListener("click", this.linkClicked.bind(this));
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    if (this.$hasSub) {
      unmakeDetailsPanelOpenHoverable(this, this.$details, this.$summary);
      this.$page.removeEventListener("click", this.linkClicked);
    }
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  /**
   *
   * @param {Event} event
   */
  linkClicked(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    emitNavigationEvent(this.$page, this.link);
    emitCustomEvent(document, eventNames.MAIN_MENU_CLOSE.description);
  }

  /**
   *
   * @param {HTMLElement} subpage
   */
  setSubpageIndentation(subpage) {
    switch (subpage.tagName) {
      case "SI-CONTENTS-PAGE":
        subpage.setAttribute("indentation", (this.indentation ? this.indentation : 0) + 1);
        break;
      case "HR":
        subpage.style.marginLeft = `${ ((this.indentation ? this.indentation : 0) + 1) * (this.indentationBasisPx + 5) }px`;
        break;
    }
  }

  setupSubs() {
    if (!this.label) return;

    let subs = structuredClone(contentsSubpages[this.label]);
    if (!subs) return;

    let subsLength = subs.length;
    this.$hasSub = subsLength > 0;
    this.$subpages.classList.toggle("hidden", !this.$hasSub);

    for (let i = 0; i < subsLength; i++) {
      let elType = subs[i].element;
      let el = document.createElement(elType);

      switch (elType) {
        case "si-contents-page":
          el.setAttribute("label", subs[i].label);
          if (subs[i].image) el.setAttribute("image", subs[i].image);
          break;
      }
      this.setSubpageIndentation(el);

      this.$subpages.appendChild(el);
    }

    if (this.$hasSub) {
      makeDetailsPanelOpenHoverable(this, this.$details, this.$summary, this.$detailsControls);
    }
  }
}

window.customElements.define('si-contents-page', Component);