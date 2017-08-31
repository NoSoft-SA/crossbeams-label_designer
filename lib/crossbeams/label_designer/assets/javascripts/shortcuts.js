Shortcuts = (function() {
  'use strict'

  // TODO: remove JQuery

  $(document).on('keyup keydown', event => { drawEnv.shifted = event.shiftKey } );
  $(document).on('keyup keydown', event => { drawEnv.controlled = event.ctrlKey } );
  $(document).on('keydown', event => {
    const validKeycode = [37, 39, 38, 40].includes(event.keyCode);
    const validTarget = !(event.target.nodeName === 'TEXTAREA');
    if (validKeycode && validTarget) {
      event.preventDefault();
      const shape = myLabel.selectedShape();
      const value = (drawEnv.shifted || drawEnv.controlled) ? 10 : 1;
      if (shape) {
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
    } else if (46 === event.keyCode) { // delete key
      event.preventDefault();
      const shape = myLabel.selectedShape();
      if (shape) {
        shape.remove();
        Canvas.drawCanvas();
      }

    }
  });

  $(document).on('keydown', event => {
    const validKeycode = [89, 90].includes(event.keyCode);
    if (validKeycode && drawEnv.controlled) {
      if (event.keyCode === 89) {
        document.querySelector('.label-designer-redo-button').click();
      } else {
        document.querySelector('.label-designer-undo-button').click();
      }
    };
  });
  $(document).on('keydown', event => {
    const validKeycode = [67, 86].includes(event.keyCode);
    if (validKeycode && drawEnv.controlled) {
      event.preventDefault();
      if (event.keyCode === 67) {
        document.querySelector('.label-designer-copy-button').click();
      } else {
        document.querySelector('.label-designer-paste-button').click();
      }
    };
  });

})();
