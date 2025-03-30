import { eventNames } from "../data/enums.js";

export async function clearChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}
export async function clearChildrenOfType(parent, tag) {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if ((parent.children[i].nodeName).toLowerCase() === tag) parent.children[i].remove();
  }
}
export async function clearChildrenOfClass(parent, className) {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if (parent.children[i].classList.contains(className)) parent.children[i].remove();
  }
}

/**
 *
 * @param {HTMLElement} self
 * @param {HTMLElement} parent
 */
export async function findSelfIndexInParent(self, parent) {
  let element = self;
  let index = 0;
  while (element.previousElementSibling) {
    element = element.previousElementSibling;
    index++;
  }
  return index;
}

/**
 * Creates options within a select element.
 * @param {HTMLElement} selector
 * @param {Array<Object>} options
 * @param {string} valueKey
 * @param {string} textKey
 */
export async function populateSelectorOptions(selector, options, valueKey, textKey) {
  if (!options) return;
  options.forEach(option => {
    let opt = document.createElement("option");
    opt.value = option[valueKey]
    opt.innerText = option[textKey];
    selector.appendChild(opt);
  });
}
/**
 * Sets the date in the input to today by default.
 * @param {HTMLElement} dateInput
 */
export async function setDateInputAsToday(dateInput) {
  const today = new Date();

  // Format the date as yyyy-mm-dd
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  dateInput.value = `${ year }-${ month }-${ day }`;
}

/**
 *
 * @param {HTMLElement} details
 * @param {HTMLElement} summary
 * @param {Object} detailControls
 */
export async function makeDetailsPanelOpenHoverable(context, details, summary, detailControls) {
  details.addEventListener("mouseenter", toggleDetailsVisibility.bind(context, details, detailControls, true));
  details.addEventListener("mouseleave", toggleDetailsVisibility.bind(context, details, detailControls, false));
  summary.addEventListener("click", summaryClicked.bind(context, details, detailControls));
}
/**
 *
 * @param {HTMLElement} details
 * @param {HTMLElement} summary
 */
export async function unmakeDetailsPanelOpenHoverable(details, summary) {
  details.removeEventListener("mouseenter", toggleDetailsVisibility);
  details.removeEventListener("mouseleave", toggleDetailsVisibility);
  summary.removeEventListener("click", summaryClicked);
}
/**
 *
 * @param {HTMLElement} details
 * @param {Object} detailControls
 * @param {Event} event
 */
function summaryClicked(details, detailControls, event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  if (detailControls.detailsOpenFromHover) {
    detailControls.detailsForcedOpen = true;
    detailControls.detailsOpenFromHover = false;
  }
  else {
    if (details.open) {
      details.removeAttribute("open");
      detailControls.detailsForcedOpen = false;
    }
    else {
      details.setAttribute("open", "");
      detailControls.detailsForcedOpen = true;
    }
  }
}
/**
 *
 * @param {HTMLElement} details
 * @param {Object} detailControls
 * @param {Boolean} mouseHover
 * @param {Event} event
 * @returns
 */
function toggleDetailsVisibility(details, detailControls, mouseHover, event) {
  event.stopImmediatePropagation();
  if (detailControls.detailsForcedOpen) return;

  if (mouseHover) {
    detailControls.detailsOpenFromHover = true;
    details.setAttribute("open", "");
  }
  else {
    detailControls.detailsOpenFromHover = false;
    details.removeAttribute("open")
  }
}

/**
 *
 * @param {HTMLElement} that
 * @param {String} eventName
 * @param {Object} eventDetails
 */
export async function emitCustomEvent(that, eventName, eventDetails) {
  that.dispatchEvent(new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: eventDetails
  }));
};
export async function toggleSpinningCircle(that, state) {
  emitCustomEvent(that, eventNames.TOGGLE_SPINNING_CIRCLE.description, {
    bubbles: true,
    composed: true,
    state: state
  });
}
export async function emitNavigationEvent(that, target) {
  emitCustomEvent(that, eventNames.NAVIGATE.description, {
    bubbles: true,
    composed: true,
    target: target
  });
}
export async function emitDialogEvent(that, webComponent, data, confirmCb, cancelCb) {
  emitCustomEvent(that, eventNames.DIALOG_OPEN.description, {
    bubbles: true,
    composed: true,
    element: webComponent,
    data: data,
    confirmCb: confirmCb,
    cancelCb: cancelCb
  });
}
export async function emitDialogConfirmEvent(that, data) {
  emitCustomEvent(that, eventNames.DIALOG_CONFIRM.description, {
    bubbles: true,
    composed: true,
    data: data
  });
}
export async function emitDialogCancelEvent(that) {
  emitCustomEvent(that, eventNames.DIALOG_CANCEL.description, {
    bubbles: true,
    composed: true
  });
}
/**
 * @param {HTMLElement} that
 * @param {String} route
 */
export async function emitSubPageContainerEvent(that, route) {
  setTimeout(() => {
    emitCustomEvent(that, eventNames.SUB_PAGE_CONTAINER.description, {
      bubbles: true,
      composed: true,
      container: that,
      route: route
    });
  }, 0);
}
