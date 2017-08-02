class ExternalLabelSet extends Array {
  constructor(...items) {
    super(...items);
  }
  add(label) {
    this.push(label);
  }
  currentLabel() {
    return this.find(label => label.currentLabel === true);
  }
  setCurrentLabel(labelToSelect) {
    this.forEach(label => {(label === labelToSelect) ? label.setAsCurrent() : label.unset();} );
  }
  openLabel(labelConfig) {
    if (labelConfig){
      const labelSizes = <%= @label_sizes %>;
      const sizeConfig = labelSizes[labelConfig.labelDimension];
      let myLabelSize = {
        width: ((sizeConfig.width !== undefined) ? sizeConfig.width*10 : 700),
        height: ((sizeConfig.height !== undefined) ? sizeConfig.height*10 : 500)
      }

      if (labelConfig.labelState === 'preview') {
        // return preview only
      } else {
        Canvas.resetCanvas(myLabelSize.width, myLabelSize.height);
        const newLabel = labelConfig.labelState === 'new';
        const labelParams = {
          id: labelConfig.id,
          name: labelConfig.labelName,
          width: (newLabel ? myLabelSize.width : undefined),
          height: (newLabel ? myLabelSize.height: undefined),
          labelJSON: (newLabel ? undefined : labelConfig.labelJSON)
        }
        const label = new ExternalLabel(labelParams);
        this.add(label);
        this.setCurrentLabel(label);
        Canvas.drawCanvas();
      }
    } else {
      throw "ERROR: Invalid label config.";
    }
  }
}

class ExternalLabel extends Array {
  constructor(labelParams, ...items) {
    super(...items);
    this.currentLabel = true;
    if (labelParams.labelJSON) {
      this.loadFromJson(labelParams.labelJSON);
      this.id = labelParams.id;
      this.name = labelParams.name;
    } else {
      this.id = labelParams.id;
      this.name = labelParams.name;
      this.shapes = [];
      this.labelWidth = labelParams.width;
      this.labelHeight = labelParams.height;
      this.minLabelWidth = 0;
      this.minLabelHeight = 0;

      this.stage = Canvas.stage();
      Canvas.doResizeCanvas(labelParams.width, labelParams.height);
      Canvas.bindStageListeners();
    }
    Canvas.drawCanvas();
  }
  loadFromJson(labelJSON) {
    const newLabel = JSON.parse(labelJSON);
    this.name = newLabel.name;
    this.shapes = [];
    this.labelWidth = newLabel.labelWidth;
    this.labelHeight = newLabel.labelHeight;
    this.minLabelWidth = 0;
    this.minLabelHeight = 0;

    myLabel = this;
    this.stage = Canvas.resetCanvas(this.labelWidth, this.labelHeight);
    Canvas.bindStageListeners();

    const newShapes = [];
    newLabel.shapes.forEach(function(shape) {
      const newShape = new Shape();
      console.log('ln 86 new Shape')
      const newGroup = Konva.Node.create(shape.group);

      if (shape.name === 'VariableBox') {
        Canvas.variableLayer().add(newGroup);
      } else {
        Canvas.imageLayer().add(newGroup);
      }

      newShape.reinitialise(newGroup, shape);
      this.add(newShape);
      // newShapes.push(newShape);
    });

    // this.shapes = newShapes;
    const shape = this.shapes[(this.shapes.length - 1)];
    this.selectShape(shape);
    this.stage.draw();
  }
  setAsCurrent() {
    this.currentLabel = true;
  }
  unset() {
    this.currentLabel = false;
  }
  ensureLabelDimensions() {
    const container = Canvas.container();
    this.labelWidth = container.width;
    this.labelHeight = container.height;
  }
  newShape(type, imageParams = undefined) {
    const shape = ExternalShape.create(type, imageParams);
    shape.shapeId = this.nextId();
    this.add(shape);
    console.log('adding shape');
    return shape;
  }

  // newShape(type, imageObj = null, width = null, height = null) {
  //   const myShape = new Shape();
  //   console.log('ln 124 new Shape')
  //   myShape.shapeId = this.nextId();
  //   this.add(shape);
  //   myShape.initialise(type, imageObj, width, height);
  //   return myShape;
  // }
  removeShape(shapeToRemove) {
    this.splice(this.indexOf(shapeToRemove), 1);
    Canvas.drawCanvas();
  }
  getShapeById(id) {
    return this.find(shape => shape.shapeId === id);
  }
  selectedShape() {
    return this.find(shape => shape.selected === true);
  }
  selectShape(shapeToSelect) {
    this.forEach(shape => {(shape === shapeToSelect) ? shape.select() : shape.deselect();} );
    Canvas.drawCanvas();
  }
  add(shape) {
    this.push(shape);
  }
  savedName() {
    return `${this.name}`.toLowerCase().replace(/[^a-zA-Z0-9 \-]/g, '').replace(/ /g, '_');
  }
  imageName() {
    return `${this.savedName()}.png`;
  }
  nextId() {
    this.nextShapeId += 1;
    return this.nextShapeId;
  }
  variableSet() {
    return this.filter(shape => shape.variableBoxType());
  }
  imageSet() {
    return this.filter(shape => !shape.variableBoxType());
  }
  setMinimums() {
    this.minLabelWidth = (parseInt(this.widthRestriction) + 1); // +1 for safety
    this.minLabelHeight = (parseInt(this.heightRestriction) + 1);
  }
  restrictionSet() {
    this.variableSet().map(shape => Lib.actualPosition(shape.group));
  }
  widthRestriction() {
    return Math.max(...this.restrictionSet().map(object => object.x1));
  }
  heightRestriction() {
    return Math.max(...this.restrictionSet().map(object => object.y1));
  }
  setCanvasMinimums() {
    this.setMinimums();
    Canvas.setMinimums(this.minLabelWidth, this.minLabelHeight);
  }

  exportToJSON() {
    this.ensureLabelDimensions();
    let labelJSON;
    labelJSON = {
      labelName: this.savedName(),
      label: JSON.stringify(this),
      XMLString: this.generateXMLFile(),
      imageString: this.toImageDataURL(),
      labelWidth: this.labelWidth,
      labelHeight: this.labelHeight
    };
    return labelJSON;
  }
  toImageDataURL() {
    const shape = this.selectedShape();
    if (shape){shape.deselect()};
    let dataURL;
    Canvas.stage().removeChildren();
    Canvas.stage().add(Canvas.imageLayer());
    dataURL = Canvas.stage().toDataURL('image/png');
    Canvas.stage().add(Canvas.variableLayer());
    this.selectShape(shape);
    return dataURL;
  }
  generateXMLFile() {
    return `${this.buildXMLHeader()}${this.buildXMLBody()}`;
  }
  buildXMLVariable(infoSet) {
    return `<variable><id>${ infoSet.variableId
      }</id><variable_type>${ infoSet.variableType
      }</variable_type><orientation>${ infoSet.orientation
      }</orientation><startx>${ infoSet.startX
      }</startx><starty>${ infoSet.startY
      }</starty><width>${ infoSet.width
      }</width><height>${ infoSet.height
      }</height><fontsize_px>${ infoSet.fontSizePx
      }</fontsize_px><fontsize_pt>${ infoSet.fontSizePt
      }</fontsize_pt><align>${ infoSet.alignment
      }</align><fontfamily>${ infoSet.fontFamily
      }</fontfamily><bold>${ infoSet.bold
      }</bold><italic>${ infoSet.italic
      }</italic><underline>${ infoSet.underline
      }</underline><barcode>${ infoSet.isBarcode
      }</barcode><barcode_margin_px>${ infoSet.barcodeMargin
      }</barcode_margin_px><barcode_symbology>${ infoSet.barcodeSymbology
      }</barcode_symbology></variable>`;
  }
  buildXMLHeader() {
    return `<?xml version="1.0" encoding="UTF-8"?><label_schema>` +
      `<image_description><image_filename>${ this.imageName()
      }</image_filename><image_width>${ this.labelWidth
      }</image_width><image_height>${ this.labelHeight
      }</image_height><variable_count>${ this.variableSet().length
      }</variable_count></image_description><variables>`;
  }
  buildXMLBody() {
    let body = '';
    this.variableSet().map(shape => shape.savedVariableSettings).forEach(info => {
      buildXMLVariable(info);
      body += variableString;
    });
    body += '</variables></label_schema>';
    return body;
  }
}
