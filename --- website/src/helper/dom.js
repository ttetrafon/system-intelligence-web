export async function clearChildren(parent) {
  while(parent.firstChild) {
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
 * @param {Array[Object]} options
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

  dateInput.value = `${year}-${month}-${day}`;
}

export async function emitCustomEvent(that, eventName, eventDetails) {
  that.dispatchEvent(new CustomEvent(eventName, {
    bubbles: true,
    composed: true,
    detail: eventDetails
  }));
};
export function emitNavigationEvent(that, type, target) {
  emitCustomEvent(that, "navigation", {
    type: type,
    target: target
  });
}
export function emitSideInfoEvent(target) {
  emitCustomEvent(document, "toggle-info", {
    target: target
  });
}
export async function toggleSpinningCircle(that, state) {
  emitCustomEvent(that, "toggle-spinning-circle", { state: state });
}

/**
 *
 * @param {json} tree
 * @param {Node} parent
 */
export async function buildHtmlFromStructure(tree, parent) {
  clearChildren(parent);
  for (i = 0; i < tree.length; i++) {
    let node = await createElement(tree[i]);
    parent.appendChild(node);
  }
}
async function createElement(node) {
  // Create text nodes
  if (node.element === "#text") {
    return document.createTextNode(node.contents);
  }

  // Create the main element
  const el = document.createElement(node.element);

  // Add attributes
  if (node.id) {
    el.id = node.id;
  }
  if (node.attributes) {
    node.attributes.forEach(attr => el.setAttribute(attr.attribute, (typeof attr.value == "object" ? JSON.stringify(attr.value) : attr.value)));
  }

  // Handle contents (recursively if necessary)
  if (Array.isArray(node.contents)) {
    node.contents.forEach(childNode => el.appendChild(createElement(childNode)));
  }
  else if (node.contents && typeof node.contents === "string") {
    el.textContent = node.contents;
  }

  return el;
}
