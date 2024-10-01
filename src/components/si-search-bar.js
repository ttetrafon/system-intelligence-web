const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  @import './styles.css';

  div {
    width: 300px;
  }

  input {
    padding: 5px;
    text-align: center;
    color: var(--colour-5);
    width: 100%;
    border-radius: 10px;
  }
</style>

<div>
  <input type="text" placeholder="Start typing to search..."/>
</div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));


  }

  static get observedAttributes() { return ['label']; }

  get label() { return this.getAttribute('label'); }

  set label(value) { this.setAttribute('label', value); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch(name) {
    }
  }
}

window.customElements.define('si-search-bar', Component);