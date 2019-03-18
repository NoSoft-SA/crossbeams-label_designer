(function Shortcuts() {
  const updateCtrlShftKey = (event) => {
    drawEnv.shifted = event.shiftKey;
    drawEnv.controlled = event.ctrlKey;
  };

  const moveTargetShortcut = (event) => {
    const value = (drawEnv.shifted || drawEnv.controlled) ? 10 : 1;
    const shape = MyLabel.selectedShape();
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
      default:
        break;
    }
    Canvas.drawCanvas();
  };

  const deleteShortcut = (event) => {
    if (event.keyCode === 46) { // delete key
      event.preventDefault();
      const shape = MyLabel.selectedShape();
      if (shape) {
        shape.remove();
        Canvas.drawCanvas();
      }
    }
  };

  const moveOrDelete = (event) => {
    const validKeycode = [37, 39, 38, 40].includes(event.keyCode);
    if (validKeycode) {
      event.preventDefault();
      const shape = MyLabel.selectedShape();
      if (shape) {
        moveTargetShortcut(event);
      }
    } else {
      deleteShortcut(event);
    }
  };

  const routeClick = (shortButtonName) => {
    document.querySelector(`.label-designer-${shortButtonName}-button`).click();
  };

  const routeClickTo = {
    89: 'redo', // y
    90: 'undo', // z
    67: 'copy', // c
    86: 'paste', // v
  };

  const routeClicks = (event) => {
    event.preventDefault();
    const action = routeClickTo[event.keyCode];
    routeClick(action);
  };

  document.addEventListener('keyup', (event) => {
    updateCtrlShftKey(event);
  });

  document.addEventListener('keydown', (event) => {
    updateCtrlShftKey(event);
    if ([37, 39, 38, 40, 46, 89, 90, 67, 86].includes(event.keyCode)) {
      const validTarget = !(event.target.nodeName === 'TEXTAREA');
      if (validTarget) {
        moveOrDelete(event);
        if (drawEnv.controlled === true) {
          routeClicks(event);
        }
      }
    }
  });
}());
