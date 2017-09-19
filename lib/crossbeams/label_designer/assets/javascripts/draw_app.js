DrawApp = (function() {
  'use strict'

  let currentElem = new Konva.Node();
  let drawing = 'none';

  Canvas.container().addEventListener('mousedown', function (event) {
    DrawApp.drawStart(event, MyLabel);
  });
  Canvas.container().addEventListener('mouseup', function (event) {
    DrawApp.drawEnd(MyLabel);
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
  const initLine = () => {
    const line = new Konva.Line({
      points: [0, 0],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      fillEnabled: false,
    });
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(line);
    group.addName('line');
    return group;
  }
  const initEllipse = () => {
    const rect = initRectangle();
    rect.dash([5, 2]);
    rect.strokeWidth(1);
    const ellipse = new Konva.Ellipse({
      x: Positioner.startX(),
      y: Positioner.startY(),
      radius: {
        x: 0,
        y: 0,
      },
      fill: '',
      stroke: 'black',
      strokeWidth: 2,
      fillEnabled: false,
    });
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(ellipse);
    group.add(rect);
    group.addName('ellipse');
    return group;
  }
  const initRect = () => {
    const rect = initRectangle();
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(rect);
    group.addName('rect');
    return group;
  }
  const initRectangle = () => {
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 2,
      fillEnabled: false,
    });
    return rect;
  }
  const initText = () => {
    const text = new Konva.Text({
      x: 0,
      y: 0,
      text: 'Insert text...',
      fontSize: 21,
      fontFamily: 'Arial',
      fill: 'black',
      width: 0,
      padding: 0,
      align: 'left',
    });
    return text;
  }
  const initTextBox = () => {
    const text = initText();
    const rect = initRectangle();
    rect.dash([5, 2]);
    rect.strokeWidth(1);
    text.padding(5);

    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(text);
    group.add(rect);
    group.addName('textBox');
    return group;
  }
  const initVariableBox = () => {
    const text = initText();
    const rect = initRectangle();
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(text);
    group.add(rect);
    rect.stroke('#188FA7');
    group.addName('variableBox');
    return group;
  }
  const initImage = (imageObj, width, height) => {
    const image = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width,
      height,
    });
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width,
      height,
      fill: '',
      stroke: 'black',
      strokeWidth: 2,
    });
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(image);
    group.add(rect);
    group.addName('image');
    return group;
  }
  const drawShape = (event) => {
    const shape = DrawApp.currentElement();
    if (shape) {
      Positioner.updateCurrentCoords(event);
      // These values can be positive or negative
      const distanceX = Positioner.currentX() - Positioner.startX();
      const distanceY = Positioner.currentY() - Positioner.startY();

      if (shape.name === 'Line') {
        shape.group.position({ x: Positioner.startX(), y: Positioner.startY() });
        const newX = (drawEnv.shifted ? 0 : distanceX);
        const newY = (drawEnv.controlled ? 0 : distanceY);
        shape.drawnShape.points([0, 0, newX, newY]);
      } else {
        shape.group.position({
          x: ((distanceX < 0) ? (Positioner.startX() + distanceX) : Positioner.startX()),
          y: ((distanceY < 0) ? (Positioner.startY() + distanceY) : Positioner.startY()),
        });
        const width = Math.abs(distanceX);
        const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distanceY));
        [shape.outerBox, shape.textBox, shape.drawnShape].forEach((object) => {
          if (object) {
            if (object.getClassName() === 'Ellipse') {
              object.x(width / 2);
              object.y(height / 2);
            }
            object.width(width);
            object.height(height);
          }
        });
      }

      if (shape.variableBoxType()) {
        Canvas.variableLayer().add(shape.group);
      } else {
        Canvas.imageLayer().add(shape.group);
      }
      MyLabel.selectShape(shape);
      Canvas.drawCanvas();
    }
  }


  return {
    currentElement,
    setCurrentElement,
    drawType,
    setDrawType,
    drawStart,
    drawEnd,
    clearTool,
    activateTool,
    initLine,
    initEllipse,
    initRect,
    initRectangle,
    initText,
    initTextBox,
    initVariableBox,
    initImage,
    drawShape
  };

})();
