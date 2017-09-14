Shortcuts = (function() {
  'use strict'

  document.addEventListener('keyup', (event) => {
    updateCtrlShftKey(event);
  });

  document.addEventListener('keydown', (event) => {
    updateCtrlShftKey(event);
    if ([37, 39, 38, 40, 46, 89, 90, 67, 86].includes(event.keyCode)) {
      moveOrDelete(event);
      if (drawEnv.controlled === true) {
        routeClicks(event);
      }
    }
  });

  const moveOrDelete = (event) => {
    const validKeycode = [37, 39, 38, 40].includes(event.keyCode);
    const validTarget = !(event.target.nodeName === 'TEXTAREA');
    if (validKeycode && validTarget) {
      event.preventDefault();
      const shape = MyLabel.selectedShape();
      if (shape) {
        moveTargetShortcut(event);
      }
    } else {
      deleteShortcut(event);
    }
  }

  const moveTargetShortcut = (event) => {
    const value = (drawEnv.shifted || drawEnv.controlled) ? 10 : 1;
    switch (event.keyCode) {
      case 37: // left arrow
        shape.group.move({ x: -1 * value, y: 0 });
        break;
      case 39: // right arrow
        shape.group.move({ x: value, y: 0 });
        break;
      case 38: // up arrow
        shape.group.move({ x: 0, y: -1 * value });
        break;
      case 40: // down arrow
        shape.group.move({ x: 0, y: value });
        break;
    }
    Canvas.drawCanvas();
  }

  const updateCtrlShftKey = (event) => {
    drawEnv.shifted = event.shiftKey;
    drawEnv.controlled = event.ctrlKey;
  }

  const routeClick = (shortButtonName) => {
    document.querySelector(`.label-designer-${shortButtonName}-button`).click();
  }

  const deleteShortcut = (event) => {
    if (46 === event.keyCode) { // delete key
      event.preventDefault();
      const shape = MyLabel.selectedShape();
      if (shape) {
        shape.remove();
        Canvas.drawCanvas();
      }
    }
  }

  const routeClicks = (event) => {
    event.preventDefault();
    switch (event.keyCode) {
      case 89: // y
        routeClick('redo');
        break;
      case 90: // z
        routeClick('undo');
        break;
      case 67: // c
        routeClick('copy');
        break;
      case 86: // v
        routeClick('paste');
        break;
    }
  }

})();
