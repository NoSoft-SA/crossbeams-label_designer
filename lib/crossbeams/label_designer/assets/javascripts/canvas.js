const Canvas = (function() {
  'use strict'

  let containerName = 'paper';
  let sizeMultiple = 10;
  let currentStage, currentImageLayer, currentVariableLayer;

  const initialise = (width=700, height=500) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
    setupResizable();
  }
  const resetCanvas = (width, height) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
    setupResizable();
    return currentStage; // TODO: remove side-effect
  }
  const setupKonvaStage = (width, height) => {
    currentStage = new Konva.Stage({
      container: containerName,
      width: width,
      height: height,
    });
    currentImageLayer = new Konva.Layer({
      name: 'image',
      fill: 'white'
    });
    currentVariableLayer = new Konva.Layer({
      name: 'variable'
    });
    currentImageLayer.draw();
    currentVariableLayer.draw();
    currentStage.add(currentImageLayer, currentVariableLayer);
    currentStage.draw();
  }
  const bindStageListeners = () => {
    currentStage.on('mouseover', (evt) => {
      if (getCursorName() === 'default') {setCursorName('pointer');}
      const shape = ExternalShape.getShapeByElem(evt.target);
      shape.highlightOn();
    });
    currentStage.on('mouseout', (evt) => {
      setCursorName('default');
      const shape = ExternalShape.getShapeByElem(evt.target);
      if (!shape.selected) { shape.highlightOff(); }
    });
    currentStage.on('click', (evt) => {
      const shape = ExternalShape.getShapeByElem(evt.target);
      ExternalLabelSet.currentLabel().selectShape(shape);
    });
  }
  const doResizeCanvas = (width, height) => {
    if (width >= 0) { setCanvasWidth(width); }
    if (height >= 0) { setCanvasHeight(height); }
  }
  const setCanvasWidth = (width) => {
    document.querySelector('#canvas_width').value = width;
    currentStage.width(width);
    resizableElement().width = width;
  }
  const setCanvasHeight = (height) => {
    document.querySelector('#canvas_height').value = height;
    currentStage.height(height);
    resizableElement().height = height;
  }
  const setupResizable = () => {
    removeExistingResizableSettings();
    addResizableSettings();
  }
  const removeExistingResizableSettings = () => {
    const existing = $(`#${containerName}.ui-resizable`);
    if (existing) {
      existing.resizable('destroy');
    }
  }
  const addResizableSettings = () => {
    $(`#${containerName}.resizable`).resizable({
      resize(event, ui) {
        doResizeCanvas(resizableElement().width, resizableElement().height);
      },
      stop(event, ui) {
        // notifyResizeStopObserver();
        // TODO: add observer for this.
        myLabel.labelHeight = resizableElement().height;
        myLabel.labelWidth = resizableElement().width;
        afterUndoable();
      },
    });
  }
  const setMinimums = (minWidth, minHeight) => {
    $(`[id=${containerName}] .resizable`).resizable('option', 'minWidth', minWidth);
    $(`[id=${containerName}] .resizable`).resizable('option', 'minHeight', minHeight);
  }
  const container = () => {
    return document.querySelector(`[id=${containerName}]`);
  }
  const resizableElement = () => {
    return container().getElementsByClassName('.resizable');
  }
  const clearCanvas = () => {
    currentStage.clear();
  }
  const drawCanvas = () => {
    currentStage.draw();
  }
  const stage = () => {
    return currentStage;
  }
  const imageLayer = () => {
    return currentImageLayer;
  }
  const variableLayer = () => {
    return currentVariableLayer;
  }

  // TODO: ResizeObserver
  //  Check if Variables are valid (outOfBorder)
  //   -> Undo Resize of canvas
  //  notifyResizeStopObserver();
  //  // myLabel.labelHeight = resizableElement().height;
  //  // myLabel.labelWidth = resizableElement().width;
  //  // afterUndoable();

  // Must be able to trigger a canvas resize undo
  //  OR trigger undo and remove redo
  //  The only reason we would want to undo a canvas resize is if variables are overlapping,
  // this should be run in a different section and only make a call to here
  return {
    initialise,
    resetCanvas,
    doResizeCanvas,
    setMinimums,
    container,
    resizableElement,
    clearCanvas,
    drawCanvas,
    stage,
    imageLayer,
    variableLayer,
    bindStageListeners
  };

})();
