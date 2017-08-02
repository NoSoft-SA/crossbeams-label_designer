class ExternalShape {
  constructor(imageParams = undefined) {
    this.initGroup(imageParams = undefined);
    this.addGroupFunctions();
  }



  select() {
    this.selected = true;
    // this.group.moveToTop();
    // this.group.draggable(true);
    // if (!this.lineType() && this.outerBox && !this.rectType()) {
    //   this.outerBox.show();
    // }
    // this.highlightOn();
    // this.showAnchors();
    // toggleOptions();
    // if (this.variableBoxType() || this.textBoxType()) {
    //   populateForm(this);
    // }
  }



















  imageType() { return false; }
  rectType() { return false; }
  lineType() { return false; }
  variableBoxType() { return false; }
  textBoxType() { return false; }
  ellipseType() { return false; }
  static create(type, params=undefined) {
    let newShape;
    switch (type) {
      case 'Image':
        newShape = new ImageShape(params);
        break;
      case 'Rect':
        newShape = new RectShape();
        break;
      case 'Line':
        newShape = new LineShape();
        break;
      case 'Ellipse':
        newShape = new EllipseShape();
        break;
      case 'TextBox':
        newShape = new TextBoxShape();
        break;
      case 'variableBox':
        newShape = new VariableBoxShape();
        break;
    console.log('create returns', newShape);
    return newShape;
    }
  }
  initGroup() {
    this.group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
  }
  initRectangle() {
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
  initText() {
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
  addGroupFunctions() {
    this.group.on('dragend', function () {
      afterUndoable();
      Canvas.drawCanvas();
    });
  }
  drawShape(event) {
    const shape = DrawApp.currentElement();
    if (shape) {
      Positioner.updateCurrentCoords(event);
      const distance = {
        // These values can be positive or negative
        x: Positioner.currentX() - Positioner.startX(),
        y: Positioner.currentY() - Positioner.startY()
      }
      shape.drawGroupPosition(distance);
      shape.draw(distance);
      // labelSet.currentLabel().add(shape);
      // labelSet.currentLabel().selectShape(shape);
      Canvas.drawCanvas();
    }
  }
  drawGroupPosition(distance) {
    this.group.position({
      x: ((distance.x < 0) ? (Positioner.startX() + distance.x) : Positioner.startX()),
      y: ((distance.y < 0) ? (Positioner.startY() + distance.y) : Positioner.startY()),
    });
  }
  afterDraw(label) {
    label.add(this);
    this.addAnchors();
  }
  static getShapeByElem(elem) {
    const group = elem.findAncestor('Group');
    return group.shape;
  }
}

class ImageShape extends ExternalShape {
  constructor(type, imageParams) {
    // imageParams = {imageObject, width, height}
    super(imageParams);
    this.imageSource = imageParams.imageObj.src;

    // TODO: remove the following
    Canvas.imageLayer().add(this.group);
    this.addAnchors();
    myLabel.selectShape(this);
    Canvas.drawCanvas();
    return this;
  }
  imageType() { return true; }
  initGroup(imageParams) {
    this.image = new Konva.Image({
      x: 0,
      y: 0,
      image: imageParams.imageObj,
      width: imageParams.width,
      height: imageParams.height,
    });
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: imageParams.width,
      height: imageParams.height,
      fill: '',
      stroke: 'black',
      strokeWidth: 2,
    });
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(this.image);
    group.add(rect);
    group.addName('image');
    group.shape = this;
    this.group = group;
    this.outerBox = rect;
  }
}

class RectShape extends ExternalShape {
  constructor() {
    super();

    // TODO: remove
    DrawApp.setCurrentElement(this);
    console.log(DrawApp.currentElement());
    Canvas.container().onmousemove = this.drawShape;
    return this;
  }
  rectType() { return true; }
  initGroup() {
    const rect = this.initRectangle();
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(rect);
    group.addName('rect');
    group.shape = this;
    this.group = group;
    this.outerBox = rect;
    this.drawnShape = rect;
  }
  draw(distance) {
    const width = Math.abs(distance.x);
    const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distance.y));
    this.outerBox.width(width);
    this.outerBox.height(height);

    Canvas.imageLayer().add(this.group);
  }
}

class LineShape extends ExternalShape {
  constructor() {
    super();

    // TODO: remove
    DrawApp.setCurrentElement(this);
    Canvas.container().onmousemove = this.drawShape;
    return this;
  }
  lineType() { return true; }
  initGroup() {
    this.drawnShape = new Konva.Line({
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
    group.add(this.drawnShape);
    group.addName('line');
    group.shape = this;
    this.group = group;
  }
  draw(distance) {
    const newX = (drawEnv.shifted ? 0 : distance.x);
    const newY = (drawEnv.controlled ? 0 : distance.y);
    this.drawnShape.points([0, 0, newX, newY]);
    Canvas.imageLayer().add(this.group);
  }
  drawGroupPosition(distance) {
    this.group.position({ x: Positioner.startX(), y: Positioner.startY() });
  }
}

class EllipseShape extends ExternalShape {
  constructor() {
    super();

    // TODO: remove
    DrawApp.setCurrentElement(this);
    Canvas.container().onmousemove = this.drawShape;
    return this;
  }
  ellipseType() { return true; }
  initGroup() {
    const rect = this.initRectangle();
    rect.dash([5, 2]);
    rect.strokeWidth(1);
    this.drawnShape = new Konva.Ellipse({
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
    group.add(this.drawnShape);
    group.add(rect);
    group.addName('ellipse');
    group.shape = this;
    this.group = group;
    this.outerBox = rect;
  }
  draw(distance) {
    const width = Math.abs(distance.x);
    const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distance.y));
    this.drawnShape.x(width / 2);
    this.drawnShape.y(height / 2);
    this.outerBox.width(width);
    this.outerBox.height(height);

    Canvas.imageLayer().add(this.group);
  }
}

class TextBoxShape extends ExternalShape {
  constructor() {
    super();

    // TODO: remove
    DrawApp.setCurrentElement(this);
    Canvas.container().onmousemove = this.drawShape;
    return this;
  }
  textBoxType() { return true; }
  initGroup() {
    const text = this.initText();
    const rect = this.initRectangle();
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
    group.shape = this;
    this.textBox = text;
    this.outerBox = rect;
    this.group = group;
    this.savedTextSettings = {
      fontFamily: 'Arial',
      bold: false,
      italic: false,
    }
  }
  draw(distance) {
    const width = Math.abs(distance.x);
    const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distance.y));
    this.outerBox.width(width);
    this.outerBox.height(height);
    this.textBox.width(width);
    this.textBox.height(height);
    Canvas.imageLayer().add(this.group);
  }
}

class VariableBoxShape extends ExternalShape {
  constructor() {
    super();

    // TODO: remove
    DrawApp.setCurrentElement(this);
    Canvas.container().onmousemove = this.drawShape;
    return this;
  }
  variableBoxType() { return true; }
  initGroup() {
    const text = this.initText();
    const rect = this.initRectangle();
    const group = new Konva.Group({
      x: 0,
      y: 0,
      fillEnabled: false,
    });
    group.add(text);
    group.add(rect);
    group.addName('variableBox');
    group.shape = this;
    this.textBox = text;
    this.outerBox = rect;
    this.group = group;
    this.savedTextSettings = {
      fontFamily: 'Arial',
      bold: false,
      italic: false,
    }
  }
  draw(distance) {
    const width = Math.abs(distance.x);
    const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distance.y));
    this.outerBox.width(width);
    this.outerBox.height(height);
    this.textBox.width(width);
    this.textBox.height(height);
    Canvas.variableLayer().add(this.group);
  }
  addGroupFunctions() {
    this.group.on('mousedown touchstart', function () {
      this.shape.savePosition();
    });
    this.group.on('dragend', function () {
      this.shape.preventOverlap();
      this.shape.outOfBorder();
      this.shape.saveVariableSettings();
      myLabel.setCanvasMinimums();
      afterUndoable();
      Canvas.drawCanvas();
    });
  }
  afterDraw(label) {
    label.add(this);
    this.addAnchors();
    // TODO: put this back
    if (overlap(this.outerBox)) {
      this.remove(true);
    } else {
      label.setCanvasMinimums();
      this.saveVariableSettings();
    }
  }
}
