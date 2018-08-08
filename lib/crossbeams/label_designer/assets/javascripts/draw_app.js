DrawApp = (function () {
  let currentElem = new Konva.Node();
  let drawing = 'none';

  Canvas.container().addEventListener('mousedown', (event) => {
    DrawApp.drawStart(event);
  });
  Canvas.container().addEventListener('mouseup', (event) => {
    DrawApp.drawEnd();
  });
  document.querySelectorAll('[data-drawtype]').forEach((elem) => {
    elem.addEventListener('click', function () {
      DrawApp.setDrawType((DrawApp.activateTool(this) === true) ? this.dataset.drawtype : 'none');
    });
  });
  document.querySelector('[data-pointer]').addEventListener('click', () => {
    DrawApp.clearTool();
  });

  const currentElement = () => currentElem;
  const setCurrentElement = (value) => {
    currentElem = value;
  };
  const drawType = () => drawing;
  const setDrawType = (value) => {
    drawing = value;
  };
  const drawStart = (event) => {
    Positioner.updateStartCoords(event);
    if (noDrawType()) {
      MyLabel.newShape(drawing);
    }
  };
  const drawEnd = () => {
    Canvas.container().onmousemove = null;
    if (drawing !== 'none') {
      const shape = DrawApp.currentElement();
      if ( shape.valid() ) {
        shape.addAnchors();
        if (shape.variableBoxType()) {
          if (Library.overlap(shape.outerBox)) {
            shape.remove(true);
          } else {
            VariableSettings.openDialog(shape);
          }
        }
        UndoRedoModule.registerUndoEvent();
      } else {
        shape.remove(true);
      }
    }
    clearTool();
  };
  const noDrawType = () => drawing !== 'none';
  const clearTool = () => {
    drawing = 'none';
    currentElem = new Konva.Node();
    document.querySelectorAll('[data-drawtype]').forEach((elem) => {
      elem.dataset.chosen = false;
    });
  };
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
  };
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
  };
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
  };
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
  };
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
  };
  const initText = () => {
    const text = new Konva.Text({
      x: 0,
      y: 0,
      text: 'Insert text...',
      fontSize: fontDefaultPx,
      fontFamily: 'Arial',
      fill: 'black',
      width: 0,
      padding: 0,
      align: 'left',
    });
    return text;
  };
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
  };
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
  };
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
  };
  const drawShape = (event) => {
    const shape = DrawApp.currentElement();
    if (shape) {
      Positioner.updateCurrentCoords(event);
      // These values can be positive or negative
      const distanceX = Positioner.currentX() - Positioner.startX();
      const distanceY = Positioner.currentY() - Positioner.startY();

      if (shape.attrs.name === 'Line') {
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
        shape.setBoxDimensions(width, height);
      }

      if (shape.variableBoxType()) {
        Canvas.variableLayer().add(shape.group);
      } else {
        Canvas.imageLayer().add(shape.group);
      }
      MyLabel.selectShape(shape);
      Canvas.drawCanvas();
    }
  };

  const savePosition = (shape) => {
    if (shape) {
      const group = shape.group;
      const theta = shape.attrs.rotationAngle;
      const rotationPoint = {x: group.x(), y: group.y()}

      shape.temporary = {
        theta: theta,
        rotPoint: rotationPoint,
        groupX: shape.attrs.startX,
        groupY: shape.attrs.startY,
        width: shape.attrs.width,
        height: shape.attrs.height,
      };
    }
  };

  const setToTemporaryPosition = (shape) => {
    if (shape && shape.temporary) {
      if (shape.temporary.theta === 0) {
        shape.removeAnchors();
        const group = shape.group;
        group.rotation(0);
        group.x(shape.temporary.groupX);
        group.y(shape.temporary.groupY);
        shape.setBoxDimensions(shape.temporary.width, shape.temporary.height);

        shape.addAnchors();
      } else {
        shape.removeAnchors();
        const group = shape.group;

        // If rotated
        // find current rotation point position
        //  shape.getAnchors()[0]
        //  actual position
        //   { group.x, group.y }
        const currentRotPoint = { x: group.x(), y: group.y() };
        // find new rotation point position
        //  find point on preview box based on rotation angle
        //  90 -> top right point
        //  180 -> bottom right point
        //  270 -> bottom left point
        //  Actual position
        //   shape.temporary.rotPoint
        const newRotPoint = shape.temporary.rotPoint;
        const theta = shape.temporary.theta;

        // // calculate width/height based on rotation point
        // //  90 / 270: w == h
        // //  0 / 180: w == w, h == h
        let width = shape.temporary.width;
        let height = shape.temporary.height;

        if (theta === 90 || theta === 270){
          width = shape.temporary.height;
          height = shape.temporary.width;
         }

        // keep current rotation angle,
        //  set rotation to 0
        const rotation = group.rotation();
        group.rotation(0);

        //  move to correct rotation point position
        const moveWithX = newRotPoint.x - currentRotPoint.x;
        const moveWithY = newRotPoint.y - currentRotPoint.y;
        const moveWith = { x: moveWithX, y: moveWithY };
        shape.group.move(moveWith);
        //  resize to correct size

        shape.setBoxDimensions(width, height);

        // set rotation to kept rotation angle
        group.rotation(rotation);

        shape.addAnchors();
        // shape.resetRotationPoint();
      }
      return true;
    }
  };

  const ensureSquared = (shape) => {
    shape.attrs.squareConstraint = true;
    shape.removeAnchors();
    shape.setBoxDimensions(shape.attrs.width, shape.attrs.height);
    shape.addAnchors();
    Canvas.drawCanvas();
  };

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
    drawShape,
    savePosition,
    setToTemporaryPosition,
    ensureSquared,
  };
}());
