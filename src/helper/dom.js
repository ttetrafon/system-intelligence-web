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

export function toggleSpinningCircle(that, state) {
  emitCustomEvent(that, "toggle-spinning-circle", { state: state });
}
