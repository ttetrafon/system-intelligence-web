export function clearChildren(parent) {
  while(parent.firstChild) {
    parent.removeChild(parent.lastChild);
  }
}
export function clearChildrenOfType(parent, tag) {
  for (let i = parent.children.length - 1; i >= 0; i--) {
    if ((parent.children[i].nodeName).toLowerCase() === tag) parent.children[i].remove();
  }
}

export function emitCustomEvent(that, eventName, eventDetails) {
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

export function toggleSpinningCircle(that, state) {
  emitCustomEvent(that, "toggle-spinning-circle", { state: state });
}

function createElement(node) {
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
/**
 *
 * @param {json} tree
 * @param {Node} parent
 */
export function buildHtmlFromStructure(tree, parent) {
  clearChildren(parent);
  tree.forEach(node => parent.appendChild(createElement(node)));
}
