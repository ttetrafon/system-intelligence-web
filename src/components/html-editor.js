import { buildHtmlFromStructure } from '../helper/dom.js';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';

  .text-editor-header {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    gap: 7px;
  }

  .separator {
    flex-grow: 1;
    flex-shrink: 1;
  }

  section {
    padding: 10px;
    border-radius: 5px;
    background-color: whitesmoke;
    border: 1px solid black;
    min-width: 500px;
  }

  button {
    background-color: darkslategray;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 2px;
  }
  button:hover {
    background-color: darkgrey;
  }

  button img {
    width: 25px;
    aspect-ratio: 1;
  }

  .editor {
    width: 100%;
    margin-top: 10px;
    min-height: 50px;
    padding: 10px;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    box-shadow: 0 0 2px darkslategray inset;
    border-radius: 5px;
  }
</style>

<div class="text-editor-header">
  <!-- <button id="" title=""><img src="./img" /></button> -->
  <span class="separator"></span>
  <button id="heading1" title="Heading 1"><img src="./img/html-editor/format_h1_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="heading2" title="Heading 2"><img src="./img/html-editor/format_h2_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="heading3" title="Heading 3"><img src="./img/html-editor/format_h3_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="heading4" title="Heading 4"><img src="./img/html-editor/format_h4_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="heading5" title="Heading 5"><img src="./img/html-editor/format_h5_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="heading6" title="Heading 6"><img src="./img/html-editor/format_h6_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="text" title="Text"><img src="./img/html-editor/text_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="quote" title="Quote"><img src="./img/html-editor/format_quote_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <span class="separator"></span>
  <button id="bold" title="Bold"><img src="./img/html-editor/format_bold_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="italic" title="Italic"><img src="./img/html-editor/format_italic_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="underline" title="Underline"><img src="./img/html-editor/format_underlined_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <span class="separator"></span>
  <button id="unordered-list" title="Unordered List"><img src="./img/html-editor/format_list_bulleted_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="ordered-list" title="Ordered List"><img src="./img/html-editor/format_list_numbered_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <span class="separator"></span>
  <button id="link" title="Link"><img src="./img/html-editor/link_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="image" title="Image"><img src="./img/html-editor/image_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <span class="separator"></span>
  <button id="justify-left" title="Justify Left"><img src="./img/html-editor/format_align_left_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="justify-center" title="Justify Center"><img src="./img/html-editor/format_align_center_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="justify-right" title="Justify Right"><img src="./img/html-editor/format_align_right_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <button id="justify-full" title="Justify Full"><img src="./img/html-editor/format_align_justify_24dp_FILL0_wght400_GRAD0_opsz24.svg" /></button>
  <span class="separator"></span>
</div>
<div id="editor" class="editor">
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$structure = [];

    this.$editor = this._shadow.querySelector(".editor");
  }

  static get observedAttributes() { return ['data', 'label']; }

  get data() { return this.getAttribute('data'); }
  get label() { return this.getAttribute('label'); }

  set data(value) { this.setAttribute('data', value); }
  set label(value) { this.setAttribute('label', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case "data":
        this.$structure = JSON.parse(this.data);
        console.log("this.$structure:", this.$structure);
        buildHtmlFromStructure(this.$structure, this.$editor);
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
    this.$editor.addEventListener("keydown", (event) => {
      event.preventDefault();
      console.log(event.key);
    });
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }

}

window.customElements.define('html-editor', Component);