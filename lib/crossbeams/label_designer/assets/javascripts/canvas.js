Canvas = (function() {
  'use strict'

  let containerName = 'paper';
  let currentStage, currentImageLayer, currentVariableLayer;

  // TODO: px/mm We want to get this from the config and set px per mm with it
  // note that this needs to be taken into account when we create the canvas
  let sizeMultiple = 10;

  const initialise = (width=700, height=500) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
  }
  const resetCanvas = (width, height) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
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
  const doResizeCanvas = (width, height) => {
    if (width >= 0) { setCanvasWidth(width); }
    if (height >= 0) { setCanvasHeight(height); }
  }
  const setCanvasWidth = (width) => {
    currentStage.width(width);
    container().width = width;
  }
  const setCanvasHeight = (height) => {
    currentStage.height(height);
    container().height = height;
  }
  const container = () => {
    return document.querySelector(`[id=${containerName}]`);
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

  return {
    initialise,
    resetCanvas,
    doResizeCanvas,
    container,
    clearCanvas,
    drawCanvas,
    stage,
    imageLayer,
    variableLayer
  };

})();
