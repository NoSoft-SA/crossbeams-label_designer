const DrawApp = (function() {
  'use strict'

  let currentElem = new Konva.Node();
  let drawing = 'none';

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
      // label.newShape(type);
      label.newShape(drawing);
    }
  }
  const drawEnd = (label) => {
    Canvas.container().onmousemove = null;
    // if (drawing !== 'none') {
    //   const shape = this.currentElement();
    //   shape.addAnchors();
    //   if (shape.variableBoxType()) {
    //     if (overlap(shape.outerBox)) {
    //       shape.remove(true);
    //     } else {
    //       label.setCanvasMinimums();
    //       shape.saveVariableSettings();
    //     }
    //   }
    //   UndoRedoModule.registerUndoEvent(label);
    //   // Library.afterUndoable();
    // }
    if (noDrawType()) {
      const shape = DrawApp.currentElement();
      shape.afterDraw(label);
      Library.afterUndoable();
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
