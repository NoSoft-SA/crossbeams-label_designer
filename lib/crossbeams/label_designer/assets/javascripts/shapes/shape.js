class ExternalShape {
  constructor(imageParams = undefined, label = undefined) {
    this.shapeType = this.constructor.name;
    this.initGroup(imageParams);
    this.addGroupFunctions();
    this.drawConstructor(imageParams, label);
  }

  reinitialise(konvaGroup, shape) {
    this.name = shape.name;
    this.group = konvaGroup;
    this.group.shape = this;
    this.addGroupFunctions();

    this.outerBox = ((this.lineType()) ? undefined : Library.getChildOfType('Rect', this.group));
    if (this.imageType()) {
      this.image = Library.getChildOfType(this.name, this.group);
      this.imageSource = shape.imageSource;
      this.addAnchors();
    } else if (this.variableBoxType() || this.textBoxType()) {
      this.textBox = Library.getChildOfType('Text', this.group);
      this.savedTextSettings = shape.savedTextSettings;
      if (this.variableBoxType()) {
        this.savedVariableSettings = shape.savedVariableSettings;
      }
    } else {
      this.drawnShape = Library.getChildOfType(shape.name, this.group);
    }
    if (this.outerBox) {
      this.outerBox.moveToTop();
    }
    this.removeAnchors();
    this.addAnchors();
    return this;
  }
  select() {
    this.selected = true;
    this.group.moveToTop();
    this.group.draggable(true);
    if (!this.lineType() && this.outerBox && !this.rectType()) {
      this.outerBox.show();
    }
    this.highlightOn();
    this.showAnchors();
    Library.toggleOptions();
    if (this.variableBoxType() || this.textBoxType()) {
      Library.populateForm(this);
    }
  }
  deselect() {
    this.selected = false;
    this.group.draggable(false);
    if (!this.rectType() && !this.lineType() && !this.variableBoxType()) {
      this.outerBox.hide();
    }
    this.highlightOff();
    this.hideAnchors();
    Library.toggleOptions();
  }
  showAnchors() {
    this.getAnchors().forEach((node) => {
      node.show();
    });
  }
  hideAnchors() {
    this.getAnchors().forEach((node) => {
      node.hide();
    });
  }
  getAnchors() {
    const anchors = [];
    this.group.getChildren((node) => {
      if (node.getClassName() === 'Circle') {
        anchors.push(node);
      }
    });
    return anchors;
  }
  remove(force = false) {
    var executed = false;
    if (this.variableBoxType() && !force) {
      if (confirm("Are you sure you want to delete this variable and all it's options")) {
        executed = true;
        [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
          if (object) { object.destroy(); }
        });
        myLabel.removeShape(this);
      }
    } else {
      executed = true;
      [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
        if (object) { object.destroy(); }
      });
      myLabel.removeShape(this);
    }
    if (this.variableBoxType()) { myLabel.setCanvasMinimums(); }
    if (executed) { Library.afterUndoable(); }
  }
  rotate() {
    if (this.variableBoxType()) {
      this.savePosition();
      this.group.rotate(90);
      if (this.preventOverlap()) {
        alert('Overlapping variables prevent rotation.');
      }
      this.outOfBorder();
    } else {
      this.group.rotate(90);
    }
    Canvas.drawCanvas();
    Library.afterUndoable();
  }
  highlightOn() {
    if (this.rectType() || this.lineType()) {
      this.drawnShape.shadowColor('black');
      this.drawnShape.shadowBlur(20);
      this.drawnShape.shadowOpacity(0.9);
    } else {
      this.outerBox.show();
      // TODO: fix highlighting
      // this.outerBox.shadowColor('black');
      // this.outerBox.shadowBlur(20);
      // this.outerBox.shadowOpacity(0.9);
    }
    Canvas.drawCanvas();
  }
  highlightOff() {
    if (this.rectType() || this.lineType()) {
      console.log(this.constructor.name);
      this.drawnShape.shadowBlur(0);
    } else {
      // TODO: fix highlighting
      // this.outerBox.shadowBlur(0);
      if (!this.variableBoxType()) {
        this.outerBox.hide();
      }
    }
    Canvas.drawCanvas();
  }
  addAnchor(group, x, y, name) {
    const shape = group.shape;
    const stage = group.getStage();
    const layer = group.getLayer();
    const anchor = new Konva.Circle({
      x,
      y,
      stroke: '#666',
      fill: '#ddd',
      strokeWidth: 1,
      radius: 4,
      name,
      draggable: true,
      dragOnTop: false,
    });
    anchor.on('dragmove', function () {
      shape.resizeShape(this);
      layer.draw();
    });
    anchor.on('mousedown touchstart', function () {
      shape.savePosition();
      group.setDraggable(false);
      this.moveToTop();
    });
    anchor.on('dragend', () => {
      shape.resetGroupPosition();
      shape.preventOverlap();
      group.setDraggable(true);
      layer.draw();
    });
    anchor.on('mouseover', function () {
      // add hover styling
      const layer = this.getLayer();
      let cursorName;
      if (name.includes('Point')) {
        cursorName = 'default';
      } else {
        cursorName = name.includes('top') ? 'n' : 's';
        cursorName += name.includes('Left') ? 'w-resize' : 'e-resize';
      }
      Library.setCursorName(cursorName);
      this.setStrokeWidth(2);
      layer.draw();
    });
    anchor.on('mouseout', function () {
      const layer = this.getLayer();
      Library.setCursorName('default');
      this.setStrokeWidth(1);
      layer.draw();
    });
    group.add(anchor);
  }
  addAnchors(event) {
    if (this.lineType()) {
      const points = this.drawnShape.points();
      this.addAnchor(this.group, points[0], points[1], 'startPoint');
      this.addAnchor(this.group, points[2], points[3], 'endPoint');
    } else {
      this.addAnchor(
        this.group,
        this.outerBox.x(),
        this.outerBox.y(),
        'topLeft'
      );
      this.addAnchor(
        this.group,
        (this.outerBox.x() + this.outerBox.width()),
        this.outerBox.y(),
        'topRight'
      );
      this.addAnchor(
        this.group,
        (this.outerBox.x() + this.outerBox.width()),
        (this.outerBox.y() + this.outerBox.height()),
        'bottomRight'
      );
      this.addAnchor(
        this.group,
        this.outerBox.x(),
        (this.outerBox.y() + this.outerBox.height()),
        'bottomLeft'
      );
    }
    Canvas.drawCanvas();
  }
  removeAnchors() {
    this.getAnchors().forEach((object) => {
      object.destroy();
    });
  }
  resizeShape(activeAnchor) {
    const group = this.group;
    const anchorX = activeAnchor.getX();
    let anchorY = activeAnchor.getY();

    if (this.lineType()) {
      const endPoint = group.get('.endPoint')[0];
      const startPoint = group.get('.startPoint')[0];
      switch (activeAnchor.getName()) {
        case 'startPoint':
          var newX = ((drawEnv.shifted === true) ? this.drawnShape.points()[2] : anchorX);
          var newY = ((drawEnv.controlled === true) ? this.drawnShape.points()[3] : anchorY);
          startPoint.setX(newX);
          startPoint.setY(newY);
          this.drawnShape.points()[0] = newX;
          this.drawnShape.points()[1] = newY;
          break;
        case 'endPoint':
          var newX = ((drawEnv.shifted === true) ? this.drawnShape.points()[0] : anchorX);
          var newY = ((drawEnv.controlled === true) ? this.drawnShape.points()[1] : anchorY);
          endPoint.setX(newX);
          endPoint.setY(newY);
          this.drawnShape.points()[2] = newX;
          this.drawnShape.points()[3] = newY;
          break;
      }
    } else {
      const topLeft = group.get('.topLeft')[0];
      const topRight = group.get('.topRight')[0];
      const bottomRight = group.get('.bottomRight')[0];
      const bottomLeft = group.get('.bottomLeft')[0];

      // #TODO: Keep aspect ratio of image
      if (this.resizeAllowed(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY)) {
        if (drawEnv.shifted || drawEnv.controlled) {
          if (activeAnchor.getName().includes('top') > -1) {
            anchorY = (bottomRight.getY() - Math.abs(topRight.getX() - topLeft.getX()));
          } else {
            anchorY = (Math.abs(topRight.getX() - topLeft.getX()) + topLeft.getY());
          }
          activeAnchor.setY(anchorY);
        }
        switch (activeAnchor.getName()) {
          // update anchor positions
          case 'topLeft':
            topRight.setY(anchorY);
            bottomLeft.setX(anchorX);
            break;
          case 'topRight':
            topLeft.setY(anchorY);
            bottomRight.setX(anchorX);
            break;
          case 'bottomRight':
            bottomLeft.setY(anchorY);
            topRight.setX(anchorX);
            break;
          case 'bottomLeft':
            bottomRight.setY(anchorY);
            topLeft.setX(anchorX);
            break;
        }
        const width = topRight.getX() - topLeft.getX();
        const height = bottomLeft.getY() - topLeft.getY();
        if (width && height) {
          [this.outerBox, this.image, this.textBox, this.drawnShape].forEach((object) => {
            const newHeight = (drawEnv.shifted || drawEnv.controlled) ? Math.abs(width) : Math.abs(height);
            if (object) {
              const position = topLeft.position();
              if (object.getClassName() === 'Ellipse') {
                object.position({
                  x: (topLeft.getX() + width / 2),
                  y: (topLeft.getY() + height / 2),
                });
              } else {
                object.position(topLeft.position());
              }
              object.width(width);
              object.height(newHeight);
            }
          });
        }
      } else {
        switch (activeAnchor.getName()) {
          // update anchor positions
          case 'topLeft':
            activeAnchor.setX(bottomRight.getX() - 10);
            activeAnchor.setY(bottomRight.getY() - 10);
            break;
          case 'topRight':
            activeAnchor.setX(bottomLeft.getX() + 10);
            activeAnchor.setY(bottomLeft.getY() - 10);
            break;
          case 'bottomRight':
            activeAnchor.setX(topLeft.getX() + 10);
            activeAnchor.setY(topLeft.getY() + 10);
            break;
          case 'bottomLeft':
            activeAnchor.setX(topRight.getX() - 10);
            activeAnchor.setY(topRight.getY() + 10);
            break;
        }
      }
    }
  }
  resizeAllowed(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY) {
    if (
      topLeft.getX() < bottomRight.getX() &&
      topLeft.getY() < bottomRight.getY() &&
      bottomLeft.getX() < topRight.getX() &&
      bottomLeft.getY() > topRight.getY()
    ) {
      return true;
    }
    return false;
  }
  resetGroupPosition() {
    // snap contents back to 0,0 after resize
    const contentX = ((this.outerBox) ? this.outerBox.x() : this.drawnShape.x());
    const contentY = ((this.outerBox) ? this.outerBox.y() : this.drawnShape.y());

    const translateables = [this.textBox, this.drawnShape, this.image];
    this.getAnchors().forEach((anchor) => {
      translateables.push(anchor);
    });
    if (this.name !== 'Rect') {
      translateables.push(this.outerBox);
    }
    translateables.forEach((object) => {
      if (object) {
        object.move({ x: -1 * contentX, y: -1 * contentY });
      }
    });
    this.group.move({ x: contentX, y: contentY });
  }
  savePosition() {
    // Right now this function is only for overlapping of variables
    if (this.variableBoxType()) {
      const group = this.group;
      const topLeft = group.get('.topLeft')[0];
      const topRight = group.get('.topRight')[0];
      const bottomRight = group.get('.bottomRight')[0];
      const bottomLeft = group.get('.bottomLeft')[0];

      this.savedPosition = {
        theta: group.rotation(),
        groupX: group.x(),
        groupY: group.y(),
        width: this.outerBox.width(),
        height: this.outerBox.height(),
        anchorPositions: {
          topLeft: topLeft.position(),
          topRight: topRight.position(),
          bottomLeft: bottomLeft.position(),
          bottomRight: bottomRight.position(),
        },
      };
    }
  }
  resetToSavedPosition() {
    // Right now this function is only for overlapping of variables
    if (this.savedPosition) {
      const group = this.group;
      const topLeft = group.get('.topLeft')[0];
      const topRight = group.get('.topRight')[0];
      const bottomRight = group.get('.bottomRight')[0];
      const bottomLeft = group.get('.bottomLeft')[0];
      // rotation
      group.rotation(this.savedPosition.theta);
      // dragging and resizing
      group.x(this.savedPosition.groupX);
      group.y(this.savedPosition.groupY);
      // resizing
      this.outerBox.width(this.savedPosition.width);
      this.outerBox.height(this.savedPosition.height);
      this.textBox.width(this.savedPosition.width);
      this.textBox.height(this.savedPosition.height);
      // resetAnchors
      topLeft.position(this.savedPosition.anchorPositions.topLeft);
      topRight.position(this.savedPosition.anchorPositions.topRight);
      bottomLeft.position(this.savedPosition.anchorPositions.bottomLeft);
      bottomRight.position(this.savedPosition.anchorPositions.bottomRight);
    }
  }
  preventOverlap() {
    if ((this.variableBoxType()) && overlap(this.outerBox)) {
      this.resetToSavedPosition();
      return true;
    }
    return false;
  }
  outOfBorder() {
    if (this.variableBoxType()) {
      const pos = Library.actualPosition(this.group);
      const height = $('#canvas_height').val();
      const width = $('#canvas_width').val();

      if (pos.x0 <= 0 || pos.y0 <= 0 || pos.x1 >= width || pos.y1 >= height) {
        this.outerBox.stroke('red');
        return true;
      }
      this.outerBox.stroke('black');
      return false;

      Canvas.drawCanvas();
    }
  }
  saveVariableSettings() {
    // Variables only
    if (this.variableBoxType()) {
      const pos = Library.actualPosition(this.group);
      const form = $('form.variable-info-form');
      this.savedVariableSettings = {
        variableId: this.shapeId,
        variableType: form.find('#vars').val(),
        orientation: (this.group.rotation() % 360),
        position: pos,
        startX: pos.x0,
        startY: pos.y0,
        width: (pos.x1 - pos.x0),
        height: (pos.y1 - pos.y0),
        fontSizePx: this.textBox.fontSize(),
        fontSizePt: this.fontSizePt(this.textBox.fontSize()),
        alignment: this.textBox.align(),
        fontFamily: this.savedTextSettings.fontFamily,
        bold: this.savedTextSettings.bold,
        italic: this.savedTextSettings.italic,
        underline: (this.textBox.textDecoration() === 'underline'),
        isBarcode: form.find('#barcode_bool').val(),
        barcodeMargin: form.find('#barcode_margin').val(),
        barcodeSymbology: form.find('#barcode_symbology').val(),
      };
    }
  }




  updateText(attribute, value) {
    this.updateTextSettings(attribute, value);
    this.updateDisplayFont();
  }
  updateTextSettings(attribute, value) {
    this.savedTextSettings[attribute] = value;
  }
  updateDisplayFont() {
    const fontOptions = {
      font: this.getFontFamily(),
      styleOption: this.getFontOption()
    };
    this.textBox.fontFamily(this.displayFont(fontOptions));
    Canvas.drawCanvas();
  }
  getFontFamily() {
    const fontFamily = this.savedTextSettings.fontFamily;
    return (fontFamily.startsWith('A') ? 'arial' : (fontFamily.startsWith('C') ? 'cour' : 'tnr'));
  }
  getFontOption() {
    const settings = this.savedTextSettings;
    let fontOption;
    if (settings.bold && settings.italic) {
      fontOption = 'boldItalic';
    } else {
      fontOption = (settings.bold ? 'bold' : (settings.italic ? 'italic' : 'normal'));
    }
    return fontOption;
  }
  fontSizePt(fontSizePx) {
    const fontSize = {
      8: 6,
      9: 7,
      11: 8,
      12: 9,
      13: 10,
      15: 11,
      16: 12,
      17: 13,
      19: 14,
      21: 15,
      22: 16,
      23: 17,
      24: 18,
      25: 19,
      26: 20,
      28: 21,
      29: 22,
      31: 23,
      32: 24,
      33: 25,
      35: 26,
      36: 27,
      37: 28,
      39: 29,
      40: 30,
      47: 35,
      53: 40,
      60: 45,
      67: 50,
    };
    return fontSize[fontSizePx];
  }
  displayFont(fontOptions) {
    const fontFamilies = {
      arial: {
        normal: 'Arial',
        bold: 'ArialB',
        italic: 'ArialI',
        boldItalic: 'ArialBI'
      },
      cour: {
        normal: 'Cour',
        bold: 'CourB',
        italic: 'CourI',
        boldItalic: 'CourBI'
      },
      tnr: {
        normal: 'TNR',
        bold: 'TNRB',
        italic: 'TNRI',
        boldItalic: 'TNRBI'
      }
    }
    return fontFamilies[fontOptions.font][fontOptions.styleOption];
  }





  imageType() { return false; }
  rectType() { return false; }
  lineType() { return false; }
  variableBoxType() { return false; }
  textBoxType() { return false; }
  ellipseType() { return false; }
  static create(type, params = undefined, label = undefined) {
    let newShape;
    switch (type) {
      case 'Image':
        newShape = new ImageShape(params, label);
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
      case 'VariableBox':
        newShape = new VariableBoxShape();
        break;
    }
    return newShape;
  }
  drawConstructor() {
    DrawApp.setCurrentElement(this);
    Canvas.container().onmousemove = this.drawShape;
    return this;
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
      Library.afterUndoable();
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
    label.selectShape(this);
    this.addAnchors();
  }
  static getShapeByElem(elem) {
    const group = elem.findAncestor('Group');
    return group.shape;
  }
}

class ImageShape extends ExternalShape {
  constructor(imageParams, label) {
    super(imageParams, label);
  }
  imageType() { return true; }
  initGroup(imageParams) {
    this.image = new Konva.Image({
      x: 0,
      y: 0,
      image: imageParams.imageObject,
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
  drawConstructor(imageParams, label) {
    this.draw(imageParams);
    this.afterDraw(label);
    return this;
  }
  draw(imageParams) {
    this.imageSource = imageParams.imageObject.src;
    Canvas.imageLayer().add(this.group);
    Canvas.drawCanvas();
  }
}

class RectShape extends ExternalShape {
  constructor() {
    super();
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
    this.outerBox = rect;
    this.drawnShape = rect;
    this.group = group;
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
  }
  lineType() { return true; }
  initGroup() {
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
    group.add(this.drawnShape);
    group.addName('line');
    group.shape = this;
    this.drawnShape = line;
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
      Library.afterUndoable();
      Canvas.drawCanvas();
    });
  }
  afterDraw(label) {
    label.add(this);
    label.selectShape(this);
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
