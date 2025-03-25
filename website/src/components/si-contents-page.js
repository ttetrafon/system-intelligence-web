import { eventNames } from '../data/enums';
import { emitCustomEvent } from '../helper/dom';
import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: block;
    border-radius: 5px;
  }

  #container {
    margin-top: 5px;
    border-radius: 10px;
    padding: 0 10px;
    white-space: nowrap;
    align-items: center;
    height: 1.25em;
  }
  #container:hover {
    z-index: 10;
  }

  #drag-handle {
    cursor: move;
  }

  span {
    white-space: nowrap;
    cursor: pointer;
  }

  .contents-item-controls {
    display: none;
  }
  #container:hover .contents-item-controls {
    display: block;
  }
</style>

<div id="container" class="flex-line">
  <svg-wrapper id="page-image"></svg-wrapper>
  <span id="page"></span>
  <button-text-image class="contents-item-controls" id="edit-button"
    label="Edit Page"
    image="edit"
    hide-text=true
    event-name=${ eventNames.CONTENTS_ITEM_EDIT_PLAIN.description }
  ></button-text-image>
  <button-text-image class="contents-item-controls" id="delete-button"
    label="Delete Page"
    image="delete"
    hide-text=true
    event-name=${ eventNames.CONTENTS_ITEM_DELETE_PLAIN.description }
  ></button-text-image>
  <svg-wrapper class="contents-item-controls hidden" id="drag-handle"
    label="Move Page"
    image="drag_indicator"
  ></svg-wrapper>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$container = this._shadow.getElementById("container");
    this.$pageImage = this._shadow.getElementById("page-image");
    this.$page = this._shadow.getElementById("page");
    this.$dragger = this._shadow.getElementById("drag-handle");
    this.$editBtn = this._shadow.getElementById("edit-button");
    this.$deleteBtn = this._shadow.getElementById("delete-button");
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'image', 'indentation']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get indentation() { return JSON.parse(this.getAttribute('indentation')); }
  get label() { return this.getAttribute('label'); }

  set indentation(value) { this.setAttribute('indentation', value); }
  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case 'indentation':
        this.$page.style.paddingLeft = `${ this.indentation * 15 }px`;
        break;
      case 'label':
        this.$page.innerText = this.label;
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$editBtn.addEventListener(eventNames.CONTENTS_ITEM_EDIT_PLAIN.description, this.editBtnClicked.bind(this));
    this.$deleteBtn.addEventListener(eventNames.CONTENTS_ITEM_DELETE_PLAIN.description, this.deleteBtnClicked.bind(this));
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$editBtn.removeEventListener(eventNames.CONTENTS_ITEM_EDIT_PLAIN.description, this.editBtnClicked);
    this.$deleteBtn.removeEventListener(eventNames.CONTENTS_ITEM_DELETE_PLAIN.description, this.deleteBtnClicked);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  /**
  *
  * @param {Event} event
  */
  deleteBtnClicked(event) {
    event.stopImmediatePropagation();
    emitCustomEvent(this.$deleteBtn, eventNames.CONTENTS_ITEM_DELETE.description, { uuid: this.id });
  }

  /**
   *
   * @param {Event} event
   */
  editBtnClicked(event) {
    event.stopImmediatePropagation();
    console.log("... edit item!");
  }
}

window.customElements.define('si-contents-item', Component);