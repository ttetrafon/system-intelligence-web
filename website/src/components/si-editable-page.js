import isEqual from 'lodash/isEqual';
import styles from '../styles/style.css?inline';
import state from '../services-library/state.js';
import siState from '../services/si-state.js';

import { eventNames } from '../data-library/enums.js';
import { buildElement, buildHtmlFromStructure, buildStructureFromHtml, findSelfIndexInParent, getCaretPosition, getTotalCharacterCount, putElementAfter, putElementBefore, setCaretPosition, setCaretPositionAtEnd } from '../helper-library/dom.js';
import { Command_Editor_UpdateDocument } from '../model/command.js';

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
      event-name=${ eventNames.EDITOR_FORMAT_H1.description }
    ></button-text-image>
    <button-text-image
      id="heading2"
      label="Heading 2"
      hide-text=true
      image="format_h2"
      event-name=${ eventNames.EDITOR_FORMAT_H2.description }
    ></button-text-image>
    <button-text-image
      id="heading3"
      label="Heading 3"
      hide-text=true
      image="format_h3"
      event-name=${ eventNames.EDITOR_FORMAT_H3.description }
    ></button-text-image>
    <button-text-image
      id="heading4"
      label="Heading 4"
      hide-text=true
      image="format_h4"
      event-name=${ eventNames.EDITOR_FORMAT_H4.description }
    ></button-text-image>
    <button-text-image
      id="heading5"
      label="Heading 5"
      hide-text=true
      image="format_h5"
      event-name=${ eventNames.EDITOR_FORMAT_H5.description }
    ></button-text-image>
    <button-text-image
      id="heading6"
      label="Heading 6"
      hide-text=true
      image="format_h6"
      event-name=${ eventNames.EDITOR_FORMAT_H6.description }
    ></button-text-image>

    <hr/>

    <button-text-image
      id="text"
      label="Text"
      hide-text=true
      image="text_fields"
      event-name=${ eventNames.EDITOR_FORMAT_P.description }
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
      "ctrl+o",
      "enter",
      "shift+enter"
    ];
    this.$lastFocusedElement = null;
  }

  // Attributes need to be observed to be tied to the lifecycle change callback.
  static get observedAttributes() { return ['label', 'nav-data', 'saved-on']; }

  // Attribute values are always strings, so we need to convert them in their getter/setters as appropriate.
  get navData() { return JSON.parse(this.getAttribute('nav-data')); }
  get label() { return this.getAttribute('label'); }
  get savedOn() { return this.getAttribute('saved-on'); }

  set navData(value) { this.setAttribute('nav-data', value); }
  set label(value) { this.setAttribute('label', value); }
  set savedOn(value) { this.setAttribute('saved-on', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    // Attribute value changes can be tied to any type of functionality through the lifecycle methods.
    // console.log(`---> attributeChangedCallback(${ name }, ${ oldVal }, ${ newVal })`);
    if (oldVal == newVal) return;
    switch (name) {
      case "nav-data":
        this.getGameplayData();
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
    state.unsubscribeFromObservable(this.navData.pageData, this.navData.pageData);
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
  async containerKeyCaptured(event) {
    event.stopImmediatePropagation();
    // console.log(`---> containerKeyCaptured()`, event);
    let composedKey = `${ event.ctrlKey ? 'Ctrl+' : '' }${ event.shiftKey ? 'Shift+' : '' }${ event.altKey ? 'Alt+' : '' }${ event.metaKey ? 'Meta+' : '' }${ event.key }`.toLowerCase();
    // console.log("composedKey:", composedKey, this.preventDefaultOnKeys, this.preventDefaultOnKeys.includes(composedKey));

    if (this.preventDefaultOnKeys.includes(composedKey)) {
      event.preventDefault();

      switch (composedKey) {
        case "enter":
          this.newLine();
          break;
      }
    }
  }

  /**
   *
   * @param {String} element: h1, h2, h3, h4, h5, h6, p
   * @param {Event} event
   */
  async createLine(element, data, event) {
    if (event) event.stopImmediatePropagation();
    let el = document.createElement(element);
    el.setAttribute("contenteditable", true);
    if (data) {
      // TODO ...
    }
    else {
      el.id = crypto.randomUUID();
    }
    this.$container.appendChild(el);
    el.focus();
  }

  /**
   *
   * @param {String} subscriber
   * @param {String} property
   * @param {Object} newValue
   */
  async dataUpdated(subscriber, property, newValue) {
    // console.log(`---> dataUpdated(${ subscriber }, ${ property }, ${ JSON.stringify(newValue) })`);
    if (['version'].includes(property)) return;

    if (property == 'order') {
      console.log("order updated!", newValue);
      for (let pos = 0; pos < newValue.length; pos++) {
        let idAtPos = newValue[pos];

        let element = this._shadow.getElementById(`id::${ idAtPos }`);
        let elementPos = await findSelfIndexInParent(element);

        if (idAtPos != elementPos) {
          // an element's actual position can only be later than in the order - if it were earlier, another element out of position would have been found already
          // so all needed is to move the 'lost' element from its current position to the correct one
          const children = this.$container.children;
          const referenceNode = idAtPos > children.length ? children.item(idAtPos) : null;
          this.$container.insertBefore(element, referenceNode);
        }
      }
      return;
    }

    let correspondingElement = this._shadow.getElementById(`id::${ property }`);
    // console.log("correspondingElement:", correspondingElement);
    if (correspondingElement) {
      // If there is an element with the id from the prop, compare it's structure (recursively) and update elements as needed.
      // The check should be performed so local updates are not reapplied.
      // console.log("... found corresponding element");
      const existingStructure = await buildStructureFromHtml(correspondingElement);
      // console.log("existing structure:", existingStructure);
      // console.log("new structure:", newValue);
      const changed = !isEqual(newValue, existingStructure[property]);
      // console.log("changed?", changed);
      if (changed) {
        const replacerElement = buildElement(newValue);
        correspondingElement.parentNode.replaceChild(replacerElement, correspondingElement);
      }
    }
  }

  /**
   * When an element loses focus:
   * - if empty: delete it
   * - if not empty:
   *     - build data structure from contents
   *     - compare with existing data structure
   *     - send an update command to the server if contents updated
   * @param {Event} event
   */
  async elementBlurred(event) {
    event.stopImmediatePropagation();
    // build structure
    let structure = await buildStructureFromHtml(event.target);
    // console.log("structure:", structure);

    // compare each node with its structured data, and send update command if needed
    let keys = Object.keys(structure);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let storedValue = await state.getValueFromObservable(this.navData.pageData, key);
      // TODO: the new structure needs to be rebuilt properly as a tree for complex elements...
      let changed = !isEqual(structure[key], storedValue);

      if (changed) {
        let documentVersion = await state.getValueFromObservable(this.navData.pageData, "version");
        let command = new Command_Editor_UpdateDocument(documentVersion, this.navData.pageData, structure);
        await siState.publishEditablePageCommand(command);
      }
    };
  }

  /**
   *
   * @param {Event} event
   */
  async elementFocused(event) {
    event.stopImmediatePropagation();
    if (this.$lastFocusedElement) this.$lastFocusedElement.classList.remove("focused");

    this.$lastFocusedElement = event.target;
    if (this.$lastFocusedElement) this.$lastFocusedElement.classList.add("focused");
    // console.log("this.$lastFocusedElement:", this.$lastFocusedElement);
  }

  /**
   *
   * @param {Boolean} add
   */
  async editEventListeners(add) {
    if (add) {
      this.$container.addEventListener("focusin", this.elementFocused.bind(this));
      this.$container.addEventListener("focusout", this.elementBlurred.bind(this));
      this.$container.addEventListener("keydown", this.containerKeyCaptured.bind(this));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H1.description, this.updateLineFormat.bind(this, "h1"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H2.description, this.updateLineFormat.bind(this, "h2"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H3.description, this.updateLineFormat.bind(this, "h3"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H4.description, this.updateLineFormat.bind(this, "h4"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H5.description, this.updateLineFormat.bind(this, "h5"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_H6.description, this.updateLineFormat.bind(this, "h6"));
      this.$editControls.addEventListener(eventNames.EDITOR_FORMAT_P.description, this.updateLineFormat.bind(this, "p"));
    }
    else {
      this.$container.removeEventListener("focusin", this.elementFocused);
      this.$container.addEventListener("focusout", this.containerKeyCaptured);
      this.$container.removeEventListener("keydown", this.containerKeyCaptured);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H1.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H2.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H3.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H4.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H5.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_H6.description, this.updateLineFormat);
      this.$editControls.removeEventListener(eventNames.EDITOR_FORMAT_P.description, this.updateLineFormat);
      this.$lastFocusedElement = null;
    }

  }

  /**
   *
   * @param {Boolean} edit
   * @param {Event} event
  */
  async editPage(edit, event) {
    if (event) event.stopImmediatePropagation();
    this.$overControls.classList.toggle("hidden", edit);
    this.$editControls.classList.toggle("hidden", !edit);
    this.editEventListeners(edit);

    this.$container.childNodes.forEach(element => {
      element.setAttribute("contenteditable", edit);
    });

    if (this.$container.children.length > 0) {
      // TODO: make this an option between firstChild/lastChild in user settings
      this.$container.lastChild.focus();
      setCaretPositionAtEnd(this.$container.lastChild);
    }
  }

  async getGameplayData() {
    let data = await siState.getGameplayData(this.navData.pageData);
    await buildHtmlFromStructure(data, this.$container);

    state.subscribeToObservable(this.navData.pageData, this.navData.pageData, this.dataUpdated.bind(this));

    // TODO: make the page editable by default as a user-setting
    await this.editPage(true);
  }

  async newLine() {
    // on a newline
    // - get the current element type (p, li)
    let currentElementType = this.$lastFocusedElement.nodeName;

    // - get the caret position, total number of characters in the element, and any current selection
    let caretPosition = getCaretPosition(this.$lastFocusedElement);
    let totalLength = getTotalCharacterCount(this.$lastFocusedElement);
    console.log(`caret position: ${ caretPosition }/${ totalLength }`);

    // - create a new element depending on the previous one and the current caret position
    //   - if caret at end: h# -> p, p -> p
    //   - if caret at start: create same element above
    //   - if caret at middle: create same element below, and move text after caret and move it at the new line
    //   - if there was a selection, remove a selection and do as above
    let newElement;
    let newElementType = currentElementType;
    const newId = crypto.randomUUID();
    const order = await state.getValueFromObservable(this.navData.pageData, "order");
    const currentElementOrderPosition = order.indexOf(this.$lastFocusedElement.id.split("::")[1]);
    if (caretPosition == 0) {
      console.log("... prepending element!");
      newElement = document.createElement(newElementType);
      newElement.id = `id::${newId}`;
      newElement.setAttribute("contenteditable", true);
      await putElementBefore(newElement, this.$lastFocusedElement);

      let newElementOrderPosition = Math.max(currentElementOrderPosition - 1, 0);
      order.splice(newElementOrderPosition, 0, newId);
      await state.updateObservable(this.navData.pageData, "order", order);
    }
    else if (caretPosition == totalLength) {
      console.log("... appending element!");
      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(currentElementType.toLowerCase())) {
        newElementType = "p";
      }
      newElement = document.createElement(newElementType);
      newElement.id = `id::${newId}`;
      newElement.setAttribute("contenteditable", true);
      await putElementAfter(newElement, this.$lastFocusedElement);
      this.$lastFocusedElement = newElement;
      this.$lastFocusedElement.focus();

      let newElementOrderPosition = currentElementOrderPosition + 1;
      if (newElementOrderPosition > order.length) {
        order.push(newId);
      }
      else {
        order.splice(newElementOrderPosition, 0, newId);
      }
      await state.updateObservable(this.navData.pageData, "order", order);
    }
    else {
      // TODO: ... (selection/range/document fragment)
    }

    // - send command to create the new line and/or update the current line if there is some text there... including the new order...

  }

  /**
   * Swaps in place the element-type for the selected line(s).
   * @param {String} elementType
   * @param {Event} event
   */
  async updateLineFormat(elementType, event) {
    // console.log(`---> updateLineFormat(${ elementType })`);
    event.stopImmediatePropagation();

    if (this.$lastFocusedElement) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      let cursorPosition = 0;
      if (range && this.$lastFocusedElement.contains(range.startContainer)) {
        const preCaretRange = document.createRange();
        preCaretRange.selectNodeContents(this.$lastFocusedElement);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        cursorPosition = preCaretRange.toString().length;
      }

      const newElement = document.createElement(elementType);
      newElement.innerHTML = this.$lastFocusedElement.innerHTML;
      newElement.id = this.$lastFocusedElement.id;
      newElement.classList = this.$lastFocusedElement.classList;
      newElement.setAttribute("contenteditable", true);
      this.$container.replaceChild(newElement, this.$lastFocusedElement);
      this.$lastFocusedElement = newElement;
      this.$lastFocusedElement.focus();

      if (cursorPosition) {
        setCaretPosition(selection, this.$lastFocusedElement, cursorPosition);
      }
    }
    else {
      this.createLine(elementType);
    }
  }
}

window.customElements.define('si-editable-page', Component);