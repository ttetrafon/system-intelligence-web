import { eventNames } from '../data/enums.js';
import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }

  :host {
    display: block;
    position: relative;
  }

  #over-controls {
    height: 2em;
    position: absolute;
    top: 5px;
    right: 5px;
  }

  #edit-controls {
    position: sticky;
    top: 0;
    justify-content: space-evenly;
    background-color: var(--colour-primary);
    border-bottom: var(--border-light);
    gap: 10px;
  }

  .edit-controls-section {
    height: 2em;
    align-items: center;
  }
  .edit-controls-section hr {
    height: 75%;
    margin: 0 5px;
  }

  .flex-separator-small {
    min-width: 5px;
  }

  .flex-separator-medium {
    min-width: 15px;
  }

  .flex-separator, .flex-separator-medium {
    min-width: 25px;
  }

  #page-contents {
    padding: 5px 10px;
  }

  #page-contents *[contenteditable=true] {
    cursor: text;
  }

  .focused {
    box-shadow: var(--box-shadow-neutral);
  }

  @media (prefers-color-scheme: light) {
    #edit-controls {
      background-color: var(--colour-quaternary);
      border-bottom: var(--border-dark);
    }
  }
</style>

<section id="over-controls" class="flex-line">
  <button-text-image
    id="edit-page"
    label="Edit Page"
    hide-text=true
    image="edit"
    event-name=${ eventNames.PAGE_EDIT.description }
  ></button-text-image>
</section>

<section id="edit-controls" class="flex-multi-line hidden">
  <div class="edit-controls-section flex-line">
    <button-text-image
      id="heading1"
      label="Heading 1"
      hide-text=true
      image="format_h1"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="heading2"
      label="Heading 2"
      hide-text=true
      image="format_h2"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="heading3"
      label="Heading 3"
      hide-text=true
      image="format_h3"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="heading4"
      label="Heading 4"
      hide-text=true
      image="format_h4"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="heading5"
      label="Heading 5"
      hide-text=true
      image="format_h5"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="heading6"
      label="Heading 6"
      hide-text=true
      image="format_h6"
      event-name=""
    ></button-text-image>

    <hr/>

    <button-text-image
      id="text"
      label="Text"
      hide-text=true
      image="text_fields"
      event-name=${ eventNames.PAGE_EDIT_PARAGRAPH.description }
    ></button-text-image>
    <button-text-image
      id="note"
      label="Note"
      hide-text=true
      image="notes"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="quote"
      label="Quote"
      hide-text=true
      image="format_quote"
      event-name=""
    ></button-text-image>

    <hr/>

    <button-text-image
      id="unordered-list"
      label="Unordered List"
      hide-text=true
      image="format_list_bulleted"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="ordered-list"
      label="Ordered List"
      hide-text=true
      image="format_list_numbered"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="checklist"
      label="Checklist"
      hide-text=true
      image="checklist"
      event-name="checklist"
    ></button-text-image>
  </div>

  <div class="edit-controls-section flex-line">
    <button-text-image
      id="bold"
      label="Bold"
      hide-text=true
      image="format_bold"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="italic"
      label="Italic"
      hide-text=true
      image="format_italic"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="underline"
      label="Underline"
      hide-text=true
      image="format_underlined"
      event-name=""
    ></button-text-image>

    <hr/>

    <button-text-image
      id="align-left"
      label="Align Left"
      hide-text=true
      image="format_align_left"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="align-centre"
      label="Align Centre"
      hide-text=true
      image="format_align_center"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="align-right"
      label="Align Right"
      hide-text=true
      image="format_align_right"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="align-justify"
      label="Justify"
      hide-text=true
      image="format_align_justify"
      event-name=""
    ></button-text-image>

    <hr/>

    <button-text-image
      id="indent_increase"
      label="Increase Indent"
      hide-text=true
      image="format_indent_increase"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="indent-decrease"
      label="Decrease Indent"
      hide-text=true
      image="format_indent_decrease"
      event-name=""
    ></button-text-image>
  </div>

  <div class="edit-controls-section flex-line">
    <button-text-image
      id="link"
      label="Insert Link"
      hide-text=true
      image="link"
      event-name=""
    ></button-text-image>
    <button-text-image
      id="image"
      label="Insert Image"
      hide-text=true
      image="image"
      event-name=""
    ></button-text-image>
  </div>
</section>
<article id="page-contents"></article>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    // The mode can be set to 'open' if we need the document to be able to access the shadow-dom internals.
    // Access happens through ths `shadowroot` property in the host.
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$overControls = this._shadow.getElementById("over-controls");
    this.$editControls = this._shadow.getElementById("edit-controls");
    this.$container = this._shadow.querySelector("article");

    this.preventDefaultOnKeys = [
      "ctrl+shift+i",
      "ctrl+o"
    ]
    this.$lastFocusedElement = null;

    // TODO: instead of this, make the page editable by default as a user-setting
    setTimeout(() => {
      this.$overControls.classList.toggle("hidden", true);
      this.$editControls.classList.toggle("hidden", false);
      this.editEventListeners(true);
      // if (this.$container.children.length == 0) {
      //   let el = document.createElement("p");
      //   el.setAttribute("contenteditable", true);
      //   el.id = crypto.randomUUID();
      //   this.$container.appendChild(el);
      //   el.focus();
      // }
    }, 500);
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'nav-data']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get navData() { return JSON.parse(this.getAttribute('nav-data')); }
  get label() { return this.getAttribute('label'); }

  set navData(value) { this.setAttribute('nav-data', value); }
  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    if (oldVal == newVal) return;
    switch (name) {
      case "nav-data":

        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$overControls.addEventListener(eventNames.PAGE_EDIT.description, this.editPage.bind(this, true));
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
    this.$overControls.removeEventListener(eventNames.PAGE_EDIT.description, this.editPage);
    this.editEventListeners(false);
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

  /**
   *
   * @param {Event} event
   */
  containerKeyCaptured(event) {
    event.stopImmediatePropagation();
    console.log(`---> containerKeyCaptured()`, event);
    let composedKey = `${event.ctrlKey ? 'Ctrl+' : ''}${event.shiftKey ? 'Shift+' : ''}${event.altKey ? 'Alt+' : ''}${event.metaKey ? 'Meta+' : ''}${event.key}`.toLowerCase();
    // console.log("composedKey:", composedKey, this.preventDefaultOnKeys, this.preventDefaultOnKeys.includes(composedKey));

    if (this.preventDefaultOnKeys.includes(composedKey)) {
      event.preventDefault();
    }
  }

  /**
   *
   * @param {String} element: h1, h2, h3, h4, h5, h6, p
   * @param {Event} event
   */
  createLine(element, data, event) {
    event.stopImmediatePropagation();
    let el = document.createElement(element);
    el.setAttribute("contenteditable", true);
    if (data) {

    }
    else {
      el.id = crypto.randomUUID();
    }
    this.$container.appendChild(el);
    el.focus();
  }

  /**
   *
   * @param {Event} event
   */
  elementFocused(event) {
    event.stopImmediatePropagation();
    if (this.$lastFocusedElement) this.$lastFocusedElement.classList.remove("focused");

    this.$lastFocusedElement = event.target;
    if (this.$lastFocusedElement) this.$lastFocusedElement.classList.add("focused");
    console.log("this.$lastFocusedElement:", this.$lastFocusedElement);
  }

  /**
   *
   * @param {Boolean} add
   */
  editEventListeners(add) {
    if (add) {
      this.$container.addEventListener("focusin", this.elementFocused.bind(this));
      this.$container.addEventListener("keydown", this.containerKeyCaptured.bind(this));
      this.$editControls.addEventListener(eventNames.PAGE_EDIT_PARAGRAPH.description, this.createLine.bind(this, "p", null));
    }
    else {
      this.$container.removeEventListener("focusin", this.elementFocused);
      this.$container.removeEventListener("keydown", this.containerKeyCaptured);
      this.$editControls.removeEventListener(eventNames.PAGE_EDIT_PARAGRAPH.description, this.createLine);
      this.$lastFocusedElement = null;
    }

    this.$container.childNodes.forEach(element => {
      element.setAttribute("contenteditable", edit);
    });
  }

  /**
   *
   * @param {Boolean} edit
   * @param {Event} event
   */
  editPage(edit, event) {
    event.stopImmediatePropagation();
    console.log("edit page:", edit);
    this.$overControls.classList.toggle("hidden", edit);
    this.$editControls.classList.toggle("hidden", !edit);
    this.editEventListeners(edit);
    this.$container.focus();
  }
}

window.customElements.define('editable-page', Component);