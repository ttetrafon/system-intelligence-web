import styles from '../style.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${styles}

  h3 {
    color: var(--colour-1);
    text-align: center;
    font-size: 1rem;
  }

  hr {
    color: var(--colour-1);
  }

  div {
    width: 100%;
    overflow-y: auto;
    overflow-x: clip;
    padding: 10px;
  }
</style>

<h3>Table of Contents</h3>
<hr>
<div container></div>
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

window.customElements.define('si-contents', Component);