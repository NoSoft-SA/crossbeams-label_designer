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
  openLabel() {
    const labelConfig = <%= @label_config %>;
    const labelSizes = <%= @label_sizes %>;
    const sizeConfig = labelSizes[labelConfig.labelDimension];

    let myLabelSize = {
      width: ((sizeConfig.width !== undefined) ? sizeConfig.width*10 : 700),
      height: ((sizeConfig.height !== undefined) ? sizeConfig.height*10 : 500)
    }
    if (labelConfig){
      const width = myLabelSize.width;
      const height = myLabelSize.height;

      if (labelConfig.labelState === 'preview') {
        // return preview only
      } else {
        // Load initial label
        Canvas.resetCanvas(width, height);

        if (labelConfig.labelState === 'new') {
          this.initialise(width, height, labelConfig.labelName, labelConfig.id, undefined);
        } else {
          this.initialise(undefined, undefined, (labelConfig.labelName || undefined), (labelConfig.id || undefined), labelConfig.labelJSON);
        }
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
    this.name = labelParams.name;
    this.nextShapeId = 0;
  }
  setAsCurrent() {
    this.currentLabel = true;
  }
  unset() {
    this.currentLabel = false;
  }
  ensureLabelDimensions() {
    const container = Canvas.container();
    this.labelWidth = container.width();
    this.labelHeight = container.height();
  }
  newShape(type, imageParams = undefined) {
    const shape = [(`${type}Shape`)](imageParams);
    shape.shapeId = this.nextId();
    this.add(shape);
    return shape;
  }
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
  get savedName() {
    return `${this.name}`.toLowerCase().replace(/[^a-zA-Z0-9 \-]/g, '').replace(/ /g, '_');
  }
  imageName() {
    return `${this.savedName()}.png`;
  }
  nextId() {
    nextShapeId += 1;
    return nextShapeId;
  }
  variableSet() {
    this.filter(shape => shape.variableBoxType());
  }
  imageSet() {
    this.filter(shape => !shape.variableBoxType());
  }
}


// labelParams = {
//   id: id,
//   name: name,
//   labelWidth: width,
//   labelHeight: height,
//   minLabelWidth: 0,
//   minLabelHeight: 0
// }



  const Label = function Label() {
    let nextShapeId = 0;
    return {
      openLabel(labelConfig = undefined) {
        // This should not be inside label
        if (labelConfig){
          const width = myLabelSize.width;
          const height = myLabelSize.height;

          if (labelConfig.labelState === 'preview') {
            // return preview only
          } else {
            // Load initial label
            Canvas.resetCanvas(width, height);

            if (labelConfig.labelState === 'new') {
              this.initialise(width, height, labelConfig.labelName, labelConfig.id, undefined);
            } else {
              this.initialise(undefined, undefined, (labelConfig.labelName || undefined), (labelConfig.id || undefined), labelConfig.labelJSON);
            }
            Canvas.drawCanvas();
          }
        } else {
          throw "ERROR: Invalid label config.";
        }
      },
      initialise(width = undefined, height = undefined, name = undefined, id = undefined, labelJSON = undefined) {
        if (labelJSON) {
          this.loadFromJson(labelJSON);
          this.id = id;
          this.name = name;
        } else {
          this.id = id;
          this.name = name;
          this.shapes = [];
          this.labelWidth = width;
          this.labelHeight = height;
          this.minLabelWidth = 0;
          this.minLabelHeight = 0;

          this.stage = Canvas.stage();
          Canvas.doResizeCanvas(width, height);
          this.bindStageListeners();
        }
        Canvas.drawCanvas();
      },
      setCanvasMinimums() {
        const widthRestrictionSet = [];
        const heightRestrictionSet = [];

        Canvas.variableLayer().getChildren().forEach((group) => {
          const object = actualPosition(group);
          widthRestrictionSet.push(object.x1);
          heightRestrictionSet.push(object.y1);
        });

        this.minLabelWidth = (Math.max(...widthRestrictionSet) + 1); // +1 for safety
        this.minLabelHeight = (Math.max(...heightRestrictionSet) + 1);

        Canvas.setMinimums(this.minLabelWidth, this.minLabelHeight);
      },
      bindStageListeners() {
        this.stage.on('mouseover', (evt) => {
          if (getCursorName() === 'default') {
            setCursorName('pointer');
          }
          const shape = myLabel.getShapeByElem(evt.target);
          shape.highlightOn();
        });
        this.stage.on('mouseout', (evt) => {
          setCursorName('default');
          const shape = myLabel.getShapeByElem(evt.target);
          if (!shape.selected) { shape.highlightOff(); }
        });
        this.stage.on('click', (evt) => {
          const shape = myLabel.getShapeByElem(evt.target);
          myLabel.selectShape(shape);
        });
      },
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
        this.bindStageListeners();

        const newShapes = [];
        newLabel.shapes.forEach((shape) => {
          const newShape = new Shape();
          const newGroup = Konva.Node.create(shape.group);

          if (shape.name === 'VariableBox') {
            Canvas.variableLayer().add(newGroup);
          } else {
            Canvas.imageLayer().add(newGroup);
          }

          newShape.reinitialise(newGroup, shape);
          newShapes.push(newShape);
        });

        this.shapes = newShapes;
        const shape = this.shapes[(this.shapes.length - 1)];
        this.selectShape(shape);
        this.stage.draw();
      },
      exportToJSON() {
        this.ensureLabelDimensions();
        let labelJSON;
        labelJSON = {
          labelName: this.saveName(),
          label: JSON.stringify(this),
          XMLString: this.generateXMLFile(),
          imageString: this.toImageDataURL(),
          labelWidth: this.labelWidth,
          labelHeight: this.labelHeight
        };
        return labelJSON;
      },
      toImageDataURL() {
        const shape = this.selectedShape();
        if (shape){shape.deselect()};
        let dataURL;
        Canvas.stage().removeChildren();
        Canvas.stage().add(Canvas.imageLayer());
        dataURL = Canvas.stage().toDataURL('image/png');
        Canvas.stage().add(Canvas.variableLayer());
        myLabel.selectShape(shape);
        return dataURL;
      },
      generateXMLFile() {
        let XMLString = `<?xml version="1.0" encoding="UTF-8"?><label_schema>` +
        `<image_description><image_filename>${ this.imageName()
        }</image_filename><image_width>${ this.labelWidth
        }</image_width><image_height>${ this.labelHeight
        }</image_height><variable_count>${ Canvas.variableLayer().getChildren().length
        }</variable_count></image_description><variables>`;

        Canvas.variableLayer().getChildren((variableGrouping) => {
          const shape = variableGrouping.shape;
          const info = shape.savedVariableSettings;

          const variableString = `<variable><id>${ info.variableId
          }</id><variable_type>${ info.variableType
          }</variable_type><orientation>${ info.orientation
          }</orientation><startx>${ info.startX
          }</startx><starty>${ info.startY
          }</starty><width>${ info.width
          }</width><height>${ info.height
          }</height><fontsize_px>${ info.fontSizePx
          }</fontsize_px><fontsize_pt>${ info.fontSizePt
          }</fontsize_pt><align>${ info.alignment
          }</align><fontfamily>${ info.fontFamily
          }</fontfamily><bold>${ info.bold
          }</bold><italic>${ info.italic
          }</italic><underline>${ info.underline
          }</underline><barcode>${ info.isBarcode
          }</barcode><barcode_margin_px>${ info.barcodeMargin
          }</barcode_margin_px><barcode_symbology>${ info.barcodeSymbology
          }</barcode_symbology></variable>`;

          XMLString += variableString;
        });

        XMLString += '</variables></label_schema>';
        return XMLString;
      },
    };
  };
