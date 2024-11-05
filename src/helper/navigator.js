import { clearChildren } from "./dom.js";
import { pages } from '../data/enums.js';

const pageDict = {
  [pages.ATTRIBUTES]: "si-attributes",
  [pages.HOME]: "si-dashboard"
};
let currentPage = pages.HOME; // TODO: move this into State

const main = document.getElementById("main-page-container");

/**
 * Navigation to a page happens by replacing main's contents as needed.
 * @param {String} page
 */
function navigateToPage(page) {
  if (!page || (page == currentPage)) return;
  console.log(`navigating to page: ${page}`);
  // replace the main component
  clearChildren(main);
  // keep track of where we are at the moment
  currentPage = page;
  // replace the main component
  let p = document.createElement(pageDict[page]);
  main.appendChild(p);
}

// Handle navigation events
document.addEventListener("navigation", (event) => {
  event.stopPropagation();
  // event details contain { type (page/modal), target }
  console.log("navigation event:", event.detail);
  switch (event.detail.type) {
    case "page":
      navigateToPage(event.detail.target);
      break;
    case "modal":
      break;
    case "tab":
      break;
    default:
      console.error(`navigation type ${event.detail.type} not defined!`);
  }
});
