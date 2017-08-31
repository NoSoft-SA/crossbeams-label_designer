DrawApp = (function() {
  'use strict'

  let currentElem = new Konva.Node();
  let drawing = 'none';

  Canvas.container().addEventListener('mousedown', function (event) {
    DrawApp.drawStart(event, myLabel);
  });
  Canvas.container().addEventListener('mouseup', function (event) {
    DrawApp.drawEnd(myLabel);
  });
  document.querySelectorAll('[data-drawtype]').forEach(function(elem) {
    elem.addEventListener('click', function () {
      DrawApp.setDrawType((DrawApp.activateTool(this) === true) ? this.dataset.drawtype : 'none');
    });
  });
  document.querySelector('[data-pointer]').addEventListener('click', function () {
    DrawApp.clearTool();
  });

  const currentElement = () => {
    return currentElem;
  }
  const setCurrentElement = (value) => {
    currentElem = value;
  }
  const drawType = () => {
    return drawing;
  }
  const setDrawType = (value) => {
    drawing = value;
  }
  const drawStart = (event, label) => {
    Positioner.updateStartCoords(event);
    if (noDrawType()) {
      label.newShape(drawing);
    }
  }
  const drawEnd = (label) => {
    Canvas.container().onmousemove = null;
    if (drawing !== 'none') {
      const shape = label.selectedShape();
      shape.addAnchors();
      if (shape.variableBoxType()) {
        if (Library.overlap(shape.outerBox)) {
          shape.remove(true);
        } else {
          VariableSettings.openDialog(shape);
        }
      }
      UndoRedoModule.registerUndoEvent();
    }
    clearTool();
  }
  const noDrawType = () => {
    return drawing !== 'none';
  }
  const clearTool = () => {
    drawing = 'none';
    currentElem = new Konva.Node();
    document.querySelectorAll('[data-drawtype]').forEach(function(elem) {
      elem.dataset.chosen = false;
    });
  }
  const activateTool = (toolHandle) => {
    let activate;
    DrawApp.clearTool();
    if (toolHandle.dataset.chosen === 'true') {
      activate = false;
    } else {
      toolHandle.dataset.chosen = true;
      activate = true;
    }
    return activate;
  }

  return {
    currentElement,
    setCurrentElement,
    drawType,
    setDrawType,
    drawStart,
    drawEnd,
    clearTool,
    activateTool
  };

})();
