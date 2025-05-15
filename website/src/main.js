import './style.css'
import './components/si-chat-panel.js';
import './components/si-chat-shortcut.js';
import './components/si-contents.js';
import './components/si-contents-page.js';
import './components/si-dice-roller-panel.js';
import './components/si-dice-roller-shortcut.js';
import './components/si-editable-page.js';
import './components/si-footer.js';
import './components/si-header.js';
import './components/si-search-bar.js';
import './components/si-secondary-panel.js';
import './components/si-tabs-panel.js';
import './components-library/404.js';
import './components-library/button-text-image.js';
import './components-library/input-field.js';
import './components-library/loading-circle.js';
import './components-library/selector-field.js';
import './components-library/svg-wrapper.js';
import './services-library/spinning-circle.js';
import { eventNames } from './data-library/enums.js';
import { Navigator } from './services-library/navigator.js';

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
