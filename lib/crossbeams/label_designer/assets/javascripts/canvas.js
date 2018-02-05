Canvas = (function () {
  const containerName = 'paper';
  let currentStage,
    currentImageLayer,
    currentVariableLayer;
  let currentScale;

  const initialise = (width = 700, height = 500) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
  };
  const resetCanvas = (width, height) => {
    setupKonvaStage(width, height);
    doResizeCanvas(width, height);
    return currentStage; // TODO: remove side-effect
  };
  const setupKonvaStage = (width, height) => {
    currentStage = new Konva.Stage({
      container: containerName,
      width,
      height,
    });
    currentImageLayer = new Konva.Layer({
      name: 'image',
      fill: 'white',
    });
    currentVariableLayer = new Konva.Layer({
      name: 'variable',
    });
    currentImageLayer.draw();
    currentVariableLayer.draw();
    currentStage.add(currentImageLayer, currentVariableLayer);
    currentStage.draw();
  };
  const doResizeCanvas = (width, height) => {
    if (width >= 0) { setCanvasWidth(width); }
    if (height >= 0) { setCanvasHeight(height); }
  };
  const setCanvasWidth = (width) => {
    currentStage.width(width);
    container().width = width;
  };
  const setCanvasHeight = (height) => {
    currentStage.height(height);
    container().height = height;
  };
  const container = () => document.querySelector(`[id=${containerName}]`);
  const drawCanvas = () => {
    setScale(currentScale);
    currentStage.draw();
  };
  const stage = () => currentStage;
  const imageLayer = () => currentImageLayer;
  const variableLayer = () => currentVariableLayer;

  const reinitCanvas = (stage) => {
    currentStage = stage;
    currentImageLayer = stage.getChildren(function (node) {
      return node.attrs.name === 'image';
    })[0];
    currentVariableLayer = stage.getChildren(function (node) {
      return node.attrs.name === 'variable';
    })[0];
    currentStage.draw();
  };

  const setScale = (scale) => {
    if (currentScale != scale) {
      currentScale = scale;
      currentStage.width(MyLabelSize.width * scale);
      currentStage.height(MyLabelSize.height * scale);
      currentStage.scale({ x: scale, y: scale });
      updateRuler(scale);
      // TODO: We still need to stretch out the ruler on zooming
      // Add ctrl+mousewheel listener
    }
  };
  const zoomPercentageSelect = document.querySelector('#zoom_percentage');
  const zoomIn = () => {
    const newIndex = zoomPercentageSelect.selectedIndex + 1;
    zoomPercentageSelect.selectedIndex = (newIndex > 16) ? 16 : newIndex;
    zoomPercentageSelect.dispatchEvent(new Event('change'));
  };
  const zoomOut = () => {
    const newIndex = zoomPercentageSelect.selectedIndex - 1;
    zoomPercentageSelect.selectedIndex = (newIndex < 0) ? 0 : newIndex;
    zoomPercentageSelect.dispatchEvent(new Event('change'));
  };
  const zoomReset = () => {
    const zoomPercentageOption = document.querySelector('#zoom_percentage option[value="1.0"]');
    zoomPercentageSelect.selectedIndex = zoomPercentageOption.index;
    zoomPercentageSelect.dispatchEvent(new Event('change'));
  };
  zoomPercentageSelect.addEventListener('change', () => {
    const zoomPercentageValue = zoomPercentageSelect.options[zoomPercentageSelect.selectedIndex].value;
    Canvas.setScale(zoomPercentageValue);
    Canvas.drawCanvas();
  });
  document.querySelector('.zoom-in').addEventListener('click', () => {
    Canvas.zoomIn();
  });
  document.querySelector('.zoom-out').addEventListener('click', () => {
    Canvas.zoomOut();
  });
  document.querySelector('.zoom-reset').addEventListener('click', () => {
    Canvas.zoomReset();
  });

  const updateRuler = (scale) => {
    const newRulerScale = parseFloat(pxPerMm * 10 * scale);

    document.querySelector('.left-ruler').setAttribute('style', `background-size: 20px ${newRulerScale}px !important;`);
    document.querySelector('.top-ruler').setAttribute('style', `background-size:${newRulerScale}px 20px !important;`);
    document.querySelectorAll('.top-ruler label').forEach((elem) => {
      elem.setAttribute('style', `width:${newRulerScale}px !important;`);
    });
    document.querySelectorAll('.left-ruler label').forEach((elem) => {
      elem.setAttribute('style', `height:${newRulerScale}px!important;display:inline-block;`);
    });
  };

  return {
    initialise,
    resetCanvas,
    doResizeCanvas,
    container,
    drawCanvas,
    stage,
    imageLayer,
    variableLayer,
    setScale,
    zoomIn,
    zoomOut,
    zoomReset,
    containerName,
    reinitCanvas,
  };
}());
