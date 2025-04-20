import './style.css'
import './components/button-text-image.js';
import './components/editable-page.js';
import './components/input-field.js';
import './components/loading-circle.js';
import './components/selector-field.js';
import './components/si-chat-panel.js';
import './components/si-chat-shortcut.js';
import './components/si-contents.js';
import './components/si-contents-page.js';
import './components/si-dice-roller-panel.js';
import './components/si-dice-roller-shortcut.js';
import './components/si-footer.js';
import './components/si-header.js';
import './components/si-search-bar.js';
import './components/si-secondary-panel.js';
import './components/si-tabs-panel.js';
import './components/svg-wrapper.js';
import './services/spinning-circle.js';
import state from './services/state.js';
import { eventNames } from './data/enums.js';
import { Navigator } from './services/navigator.js';

const navigator = new Navigator('#main-container');

//////////////////
///   NAVBAR   ///
//////////////////
const nav = document.querySelector("nav");
let navClosed = false;
if (window.innerWidth < 1024) {
  nav.classList.toggle("hidden", true);
  navClosed = true;
}
window.addEventListener("resize", () => {
  console.log(window.innerWidth);
  if (window.innerWidth <= 1024) {
    nav.classList.toggle("hidden", true);
    navClosed = true;
  }
  else {
    nav.classList.toggle("hidden", false);
    navClosed = false;
  }
});
document.addEventListener(eventNames.MAIN_MENU_TOGGLE.description, (event) => {
  event.stopImmediatePropagation();
  navClosed = !navClosed;
  nav.classList.toggle("hidden", navClosed);
});
nav.addEventListener("click", (event) => {
  event.stopImmediatePropagation();
  if (!navClosed) {
    navClosed = true;
    nav.classList.toggle("hidden", true);
  }
});
document.addEventListener(eventNames.MAIN_MENU_CLOSE.description, (event) => {
  event.stopImmediatePropagation();
  if (window.innerWidth <= 1024) {
    navClosed = true;
    nav.classList.add("hidden");
  }
});
