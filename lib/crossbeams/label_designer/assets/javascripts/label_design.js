(function () {
  document.querySelector('#stroke-width').onchange = function () {
    MyLabel.selectedShape().drawnShape.strokeWidth(this.value);
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  };
  document.querySelector('[data-action=remove]').addEventListener('click', () => {
    MyLabel.selectedShape().remove();
  });
  document.querySelector('[data-action=rotate]').addEventListener('click', () => {
    MyLabel.selectedShape().rotate();
    VariableSettings.update('rotation');
  });
  document.querySelector('.btn-download-image').addEventListener('click', (event) => {
    event.preventDefault();
    const href = MyLabel.toImageDataURL();
    document.querySelector('#btn-download-image').href = href;
    document.querySelector('#btn-download-image').click();
  });

  $('.btn-save-label').on('click', () => {
    MyLabel.fixIds();
    const keyValues = MyLabel.exportToJSON(labelConfig.labelName);
    const form = new FormData();
    for (const attr in keyValues) {
      if (Object.prototype.hasOwnProperty.call(keyValues, attr)) {
        form.append(attr, keyValues[attr]);
      }
    }
    form.append('_csrf', document.querySelector('meta[name="_csrf"]').content);
    fetch(labelConfig.savePath, {
      method: 'post',
      credentials: 'same-origin',
      body: form,
    })
      .then(response => response.json())
      .then((data) => {
        if (data.redirect) {
          drawEnv.changesMade = false;
          window.location = data.redirect;
        } else if (data.flash) {
          if (data.flash.notice) {
            Jackbox.success(data.flash.notice);
          }
          if (data.flash.error) {
            if (data.exception) {
              Jackbox.error(data.flash.error, { time: 20 });
              if (data.backtrace) {
                console.log('EXCEPTION:', data.exception, data.flash.error);
                console.log('==Backend Backtrace==');
                console.info(data.backtrace.join('\n'));
              }
            } else {
              Jackbox.error(data.flash.error);
            }
          }
        }
      })
      .catch((data) => {
        if (data.response && data.response.status === 500) {
          data.response.json().then((body) => {
            if (body.flash.error) {
              if (body.exception) {
                if (body.backtrace) {
                  console.log('EXCEPTION:', body.exception, body.flash.error);
                  console.log('==Backend Backtrace==');
                  console.info(body.backtrace.join('\n'));
                }
              } else {
                Jackbox.error(body.flash.error);
              }
            } else {
              document.getElementById(crossbeamsUtils.activeDialogContent()).innerHTML = body;
            }
          });
        }
        Jackbox.error(`An error occurred ${data}`, { time: 20 });
      });
  });

  function populateForm(shape) {
    if (shape) {
      document.querySelector('button.bold').dataset.selected = shape.attrs.bold;
      document.querySelector('button.italic').dataset.selected = shape.attrs.italic;
      document.querySelector('button.underline').dataset.selected = (shape.textBox.textDecoration() === 'underline');

      document.querySelectorAll('[data-alignment]').forEach((elem) => {
        elem.dataset.selected = false;
      });
      document.querySelector(`[data-alignment=${MyLabel.selectedShape().textBox.align()}`).dataset.selected = true;

      const fontFamilyOption = document.querySelector(`#font-family option[value='${shape.attrs.fontFamily}']`);
      document.querySelector('#font-family').selectedIndex = fontFamilyOption.index;

      const fontSizeOption = document.querySelector(`#font-size option[value='${shape.textBox.fontSize()}']`);
      document.querySelector('#font-size').selectedIndex = fontSizeOption.index;

      document.querySelector('#stroke-width').selectedIndex = 0;
      const textInputBox = document.querySelector('#textinput');
      textInputBox.innerHTML = shape.textBox.text();
      textInputBox.value = shape.textBox.text();

      TextSettings.focusTextbox();
    }
  }

  function toggleOptions() {
    Clipboard.updateCopyPasteButtons(MyLabel);
    const shape = MyLabel.selectedShape();

    const textPopup = document.querySelector('.text-popup');
    textPopup.dataset.disabled = true;
    const textInputBox = document.querySelector('#textinput');
    textInputBox.blur();

    const varSettingsButton = document.querySelector('.btn-variable-settings');
    const removeAction = document.querySelector('[data-action=remove]');
    const rotateAction = document.querySelector('[data-action=rotate]');
    const strokeWidthSelector = document.querySelector('#stroke-width');

    if (shape) {
      varSettingsButton.setAttribute('style', 'display:none;');
      rotateAction.removeAttribute('disabled');
      removeAction.removeAttribute('disabled');

      switch (shape.attrs.name) {
        case 'VariableBox':
          textInputBox.title = 'Insert text here for demo purposes only. ' +
            'This will not be saved or displayed in the final label design.';
          textPopup.dataset.disabled = false;
          textInputBox.placeholder = 'Demo text';
          varSettingsButton.removeAttribute('style');
          textInputBox.innerHTML = shape.textBox.text();
          TextSettings.focusTextbox();
          break;
        case 'TextBox':
          textInputBox.title = 'Insert text here';
          textInputBox.placeholder = 'Insert text';
          textPopup.dataset.disabled = false;
          textInputBox.innerHTML = shape.textBox.text();
          TextSettings.focusTextbox();
          break;
        default:
          if (shape.outerBox) {
            const strokeWidthOption = document.querySelector(`#stroke-width option[value='${shape.outerBox.strokeWidth()}']`);
            document.querySelector('#stroke-width').selectedIndex = (strokeWidthOption !== null) ? strokeWidthOption.index : 0;
          }
          strokeWidthSelector.removeAttribute('disabled');
          break;
      }
    } else {
      varSettingsButton.setAttribute('style', 'display:none;');
      rotateAction.setAttribute('disabled', 'disabled');
      removeAction.setAttribute('disabled', 'disabled');
      strokeWidthSelector.setAttribute('disabled', 'disabled');
    }
  }

  Shape = function Shape() {
    return {
      initialise(name, imageID, keep) {
        let imageObj;
        let width;
        let height;

        this.setDefaults(name);

        if (imageID) {
          const img = MyImages.findByID(imageID);
          imageObj = img.object;
          // eslint-disable-next-line prefer-destructuring
          width = img.width;
          // eslint-disable-next-line prefer-destructuring
          height = img.height;
          this.attrs.aspectRatio = parseFloat(height) / parseFloat(width);
          this.attrs.keepAspectRatio = keep;
        }
        if (name === 'VariableBox') {
          MyLabel.variables.push(this);
        }
        this.group = DrawApp[`init${name}`](imageObj, width, height);
        this.group.shape = this;
        this.group.id(this.shapeId);
        this.addGroupFunctions();
        this.outerBox = ((name === 'Line') ? undefined : Library.getChildOfType('Rect', this.group));
        DrawApp.setCurrentElement(this);

        if (name === 'Image') {
          this.image = Library.getChildOfType(name, this.group);
          this.imageID = imageID;
          Canvas.imageLayer().add(this.group);
          this.addAnchors();
          MyLabel.selectShape(this);
          Canvas.drawCanvas();
          UndoRedoModule.registerUndoEvent();
        } else {
          if (name === 'VariableBox' || name === 'TextBox') {
            this.textBox = Library.getChildOfType('Text', this.group);
          } else {
            this.drawnShape = Library.getChildOfType(name, this.group);
          }
          Canvas.container().onmousemove = DrawApp.drawShape;
        }
      },
      reinitialise(konvaGroup, shape) {
        // Commented out so that I can see if I can remove this yet
        // if (shape.attrs) {
        //   this.attrs = shape.attrs;
        // } else {
        //   this.setDefaults(shape.name);
        //   if (shape.textSettings) {
        //     for (const prop in shape.textSettings) {
        //       this.attrs[prop] = shape.textSettings[prop];
        //     }
        //   }
        //   if (shape.variableSettings) {
        //     for (const prop in shape.variableSettings) {
        //       this.attrs[prop] = shape.variableSettings[prop];
        //     }
        //   }
        // }

        // Always add new default attrs
        const newAttrs = shape.attrs;
        for (const prop in this.defaultAttrs()) {
          if (Object.prototype.hasOwnProperty.call(this.defaultAttrs(), prop)) {
            if (!(prop in newAttrs)) {
              newAttrs[prop] = this.defaultAttrs(prop);
            }
          }
        }
        // TODO:
        // move shapeId to attrs, lets see if we can eventually build the shape
        // from the attrs only, then we don't have to save all this JSON
        // I don't see this happening soon.
        newAttrs.shapeId = shape.shapeId;

        this.attrs = newAttrs;
        console.log(this.attrs); // KEEP

        this.group = konvaGroup;
        this.group.shape = this;

        if (shape.shapeId) {
          this.group.id(shape.shapeId);
          this.shapeId = shape.shapeId;
        } else {
          const newId = MyLabel.nextId();
          this.group.id(newId);
          this.shapeId = newId;
        }

        this.addGroupFunctions();
        this.outerBox = ((this.lineType()) ? undefined : Library.getChildOfType('Rect', this.group));
        if (this.imageType()) {
          this.image = Library.getChildOfType(this.attrs.name, this.group);
          this.imageID = shape.imageID;
        } else if (this.variableBoxType() || this.textBoxType()) {
          this.textBox = Library.getChildOfType('Text', this.group);
        } else {
          this.drawnShape = Library.getChildOfType(shape.attrs.name, this.group);
        }
        if (this.outerBox) {
          this.outerBox.moveToTop();
        }
        this.removeAnchors();
        this.addAnchors();
      },
      addImageAfterLoad(imageObject) {
        this.image.image(imageObject);
      },
      addGroupFunctions() {
        this.group.on('mousedown touchstart', function () {
          DrawApp.savePosition(this.shape);
        });
        this.group.on('dragend', function () {
          if (this.shape.variableBoxType()) {
            VariableSettings.preventOverlap(this.shape);
            VariableSettings.update('position');
          }
          UndoRedoModule.registerUndoEvent();
          Canvas.drawCanvas();
        });
        this.group.on('dblclick', function () {
          if (this.shape.variableBoxType()) {
            VariableSettings.openDialog();
          } else if (this.shape.textBoxType()) {
            document.querySelector('#textinput').blur();
            document.querySelector('#textinput').focus();
          }
        });
      },
      imageType() {
        return this.attrs.name === 'Image';
      },
      rectType() {
        return this.attrs.name === 'Rect';
      },
      lineType() {
        return this.attrs.name === 'Line';
      },
      variableBoxType() {
        return this.attrs.name === 'VariableBox';
      },
      textBoxType() {
        return this.attrs.name === 'TextBox';
      },
      ellipseType() {
        return this.attrs.name === 'Ellipse';
      },
      select() {
        this.selected = true;
        this.group.moveToTop();
        this.group.draggable(true);
        if (!this.lineType() && this.outerBox && !this.rectType()) {
          this.outerBox.show();
        }
        this.highlightOn();
        this.showAnchors();
        toggleOptions();
        if (this.variableBoxType() || this.textBoxType()) {
          populateForm(this);
        }
      },
      deselect() {
        this.selected = false;
        this.group.draggable(false);
        if (!this.rectType() && !this.lineType() && !this.variableBoxType()) {
          this.outerBox.hide();
        }
        this.highlightOff();
        this.hideAnchors();
        toggleOptions();
      },
      showAnchors() {
        this.getAnchors().forEach((node) => {
          node.show();
        });
      },
      hideAnchors() {
        this.getAnchors().forEach((node) => {
          node.hide();
        });
      },
      getAnchors() {
        const anchors = [];
        this.group.getChildren((node) => {
          if (node.getClassName() === 'Circle') {
            anchors.push(node);
          }
        });
        return anchors;
      },
      remove(force = false) {
        let executed = false;
        if (this.variableBoxType() && !force) {
          if (confirm("Are you sure you want to delete this variable and all it's options")) {
            [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
              if (object) { object.destroy(); }
            });
            executed = MyLabel.removeShape(this);
          }
        } else {
          [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
            if (object) { object.destroy(); }
          });
          executed = MyLabel.removeShape(this);
        }
        if (executed && !force) {
          const shape = MyLabel.shapes[MyLabel.shapes.length - 1];
          if (shape) { shape.select(); }
          UndoRedoModule.registerUndoEvent();
        }
      },
      rotate() {
        if (this.variableBoxType()) {
          DrawApp.savePosition(this);
          this.group.rotate(90);
          if (VariableSettings.preventOverlap(this)) {
            alert('Overlapping variables prevent rotation.');
          } else {
            VariableSettings.update('position');
            VariableSettings.update('rotation');
            DrawApp.savePosition(this);
          }
        } else {
          this.group.rotate(90);
        }
        Canvas.drawCanvas();
        UndoRedoModule.registerUndoEvent();
      },
      highlightOn() {
        if (this.attrs.name === 'Rect' || this.attrs.name === 'Line') {
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
      },
      highlightOff() {
        if (this.rectType() || this.lineType()) {
          this.drawnShape.shadowBlur(0);
        } else if (!this.variableBoxType()) {
          this.outerBox.hide();
        }
        Canvas.drawCanvas();
      },
      setBoxDimensions(width, height) {
        if (!this.lineType()) {
          const newWidth = Math.abs(width);
          let newHeight;
          if (this.attrs.squareConstraint) {
            newHeight = newWidth;
          } else if (this.attrs.keepAspectRatio) {
            newHeight = Math.abs(this.attrs.aspectRatio * newWidth);
          } else {
            newHeight = Math.abs(height);
          }

          const array = [this.outerBox, this.textBox, this.drawnShape, this.image];
          for (const object of array) {
            if (object) {
              if (object.getClassName() === 'Ellipse') {
                object.x(newWidth / 2);
                object.y(newHeight / 2);
              }
              object.width(newWidth);
              object.height(newHeight);
            }
          }
        }
      },
      resetRotationPoint() {
        if (this.lineType()) {
          const [stableAnchor] = this.group.get('.startPoint');
          this.group.offset({
            x: stableAnchor.x(),
            y: stableAnchor.y(),
          });
        }
      },
      setDefaults(name) {
        this.attrs = this.defaultAttrs();
        this.attrs.name = name;
      },
      defaultAttrs(prop = undefined) {
        const attrs = {
          name: undefined,
          variableId: undefined,
          variableType: '0',
          rotationAngle: 0,
          position: {
            x0: 0, x1: 0, y0: 0, y1: 0,
          },
          startX: 0,
          startY: 0,
          width: 0,
          height: 0,
          fontSizePx: 15,
          fontSizePt: 21,
          alignment: 'left',
          fontFamily: 'Arial',
          bold: false,
          italic: false,
          underline: false,
          isBarcode: false,
          showBarcodeText: false,
          barcodeTop: false,
          barcodeWidthFactor: 2.0,
          barcodeMargin: '5',
          barcodeSymbology: 'CODE_39',
          squareConstraint: false,
          keepAspectRatio: false,
          aspectRatio: 1,
          validationError: '',
        };
        if (prop) {
          return attrs[prop];
        }
        return attrs;
      },
      addAnchor(group, x, y, name) {
        const { shape } = group;
        // const stage = group.getStage();
        const layer = group.getLayer();
        const anchor = new Konva.Circle({
          x,
          y,
          stroke: '#666',
          fill: (name === 'startPoint') ? 'red' : '#ddd',
          strokeWidth: 1,
          radius: 4,
          name,
          draggable: (name !== 'startPoint'),
          dragOnTop: false,
        });
        anchor.on('dragmove', () => {
          Resize.resizeStart();
          if (layer) {
            layer.draw();
          }
        });
        anchor.on('mousedown touchstart', function () {
          group.setDraggable(false);
          this.moveToTop();
          Resize.before(this);
        });
        anchor.on('dragend', () => {
          Resize.resizeEnd();
          VariableSettings.preventOverlap(shape);
          group.setDraggable(true);
        });
        anchor.on('mouseover', function () {
          // add hover styling
          const thisLayer = this.getLayer();
          let cursorName;
          if (name.includes('Point')) {
            cursorName = 'default';
          } else {
            cursorName = name.includes('top') ? 'n' : 's';
            cursorName += name.includes('Left') ? 'w-resize' : 'e-resize';
          }
          Library.setCursorName(cursorName);
          this.setStrokeWidth(2);
          thisLayer.draw();
        });
        anchor.on('mouseout', function () {
          // const layer = this.getLayer();
          Library.setCursorName('default');
          this.setStrokeWidth(1);
          // layer.draw();
        });
        group.add(anchor);
      },
      addAnchors() {
        if (this.attrs.name === 'Line') {
          const points = this.drawnShape.points();
          this.addAnchor(this.group, points[0], points[1], 'startPoint');
          this.addAnchor(this.group, points[2], points[3], 'endPoint');
        } else {
          this.addAnchor(
            this.group,
            this.outerBox.x(),
            this.outerBox.y(),
            'topLeft',
          );
          this.addAnchor(
            this.group,
            (this.outerBox.x() + this.outerBox.width()),
            this.outerBox.y(),
            'topRight',
          );
          this.addAnchor(
            this.group,
            (this.outerBox.x() + this.outerBox.width()),
            (this.outerBox.y() + this.outerBox.height()),
            'bottomRight',
          );
          this.addAnchor(
            this.group,
            this.outerBox.x(),
            (this.outerBox.y() + this.outerBox.height()),
            'bottomLeft',
          );
        }
        Canvas.drawCanvas();
      },
      removeAnchors() {
        this.getAnchors().forEach((object) => {
          object.destroy();
        });
      },
      hasGroup() {
        let hasGroup = false;
        if (this.group === undefined) {
          let newGroup;
          if (this.variableBoxType()) {
            [newGroup] = Canvas.variableLayer().getChildren(node => node.id() === this.shapeId);
          } else {
            [newGroup] = Canvas.imageLayer().getChildren(node => node.id() === this.shapeId);
          }
          if (newGroup) {
            this.group = newGroup;
            newGroup.shape = this;
            hasGroup = true;
          } else {
            this.attrs.validationError = 'This shape does not have an assigned group';
          }
        } else {
          hasGroup = (this.group.nodeType === 'Group');
        }
        return hasGroup;
      },
      valid() {
        let valid = true;
        if (this.lineType()) {
          const points = this.drawnShape.points();
          if (points.every(x => x === 0)) {
            valid = false;
            this.attrs.validationError = 'The points on this Line are all Zero';
          }
        } else {
          const box = this.outerBox;
          if ([box.width(), box.height()].every(x => x === 0)) {
            valid = false;
            this.attrs.validationError = 'The width & height of this shape is set to Zero';
          }
        }
        if (!this.hasGroup()) {
          valid = false;
        }
        return valid;
      },
    };
  };

  Label = function Label() {
    let nextShapeId = 0;
    return {
      openLabel(labelConfig = undefined) {
        if (labelConfig) {
          const { width, height } = MyLabelSize;
          if (labelConfig.labelState === 'preview') {
            // return preview only
          } else {
            // Load initial label
            Canvas.resetCanvas(width, height);

            if (labelConfig.labelState === 'new') {
              this.initialise(width, height, undefined);
            } else {
              this.initialise(undefined, undefined, labelConfig.labelJSON);
            }
            Canvas.drawCanvas();
          }
        } else {
          throw 'ERROR: Invalid label config.';
        }
      },
      initialise(width = undefined, height = undefined, labelJSON = undefined) {
        if (labelJSON) {
          this.loadFromJson(labelJSON);
        } else {
          this.orientation = 'portrait';
          this.shapes = [];
          this.variables = [];
          this.multiselects = [];
          this.errorLog = [];
          this.stage = Canvas.stage();
          Canvas.doResizeCanvas(width, height);
          this.bindStageListeners();
        }
        Canvas.drawCanvas();
      },
      bindStageListeners() {
        this.stage.on('mouseover', (evt) => {
          if (Library.getCursorName() === 'default') {
            Library.setCursorName('pointer');
          }
          const shape = MyLabel.getShapeByElem(evt.target);
          if (shape) {
            shape.highlightOn();
          }
        });
        this.stage.on('mouseout', (evt) => {
          Library.setCursorName('default');
          const shape = MyLabel.getShapeByElem(evt.target);
          if (shape && !shape.selected) { shape.highlightOff(); }
        });
        this.stage.on('click', (evt) => {
          const shape = MyLabel.getShapeByElem(evt.target);
          if (shape) {
            MyLabel.selectShape(shape);
          }
          // TODO: multiselect if click and drag and no evt.target
          // group of groups
        });
      },
      loadFromJson(labelJSON) {
        const newLabel = JSON.parse(labelJSON);
        MyImages.loadImages(newLabel.imageKeeperJSON);
        this.orientation = (newLabel.orientation || 'portrait');
        this.shapes = [];
        this.variables = [];
        this.multiselects = [];
        this.errorLog = (newLabel.errorLog || []);
        MyLabel = this;
        this.stage = Konva.Node.create(newLabel.stage, Canvas.containerName);
        Canvas.reinitCanvas(this.stage);
        const newShapes = [];
        const newVariables = [];
        const drawnGroups = this.stage.find('Group');
        newLabel.shapes.forEach((shape) => {
          const newShape = new Shape();
          const [newGroup] = drawnGroups.filter(x => x.id() === shape.shapeId);
          newShape.reinitialise(newGroup, shape);
          newShapes.push(newShape);
          if (shape.attrs.name === 'VariableBox') {
            newVariables.push(newShape);
          }
        });
        this.shapes = newShapes;
        this.variables = newVariables;
        nextShapeId = this.shapes.length;
        const shape = this.shapes[(this.shapes.length - 1)];
        this.selectShape(shape);
        this.bindStageListeners();
        this.stage.draw();
      },
      newShape(type, imageID = undefined, keep = false) {
        const myShape = new Shape();
        myShape.shapeId = this.nextId();
        this.shapes.push(myShape);
        myShape.initialise(type, imageID, keep);
        return myShape;
      },
      nextId() {
        nextShapeId += 1;
        return nextShapeId;
      },
      selectedShape() {
        return this.shapes.find(shape => shape.selected === true);
      },
      getShapeById(id) {
        return this.shapes.find(shape => shape.shapeId === id);
      },
      findByImageID(imageID) {
        return this.shapes.find(shape => shape.imageID === imageID);
      },
      selectShape(shapeToSelect) {
        this.shapes.forEach((shape) => {
          if (shape === shapeToSelect) {
            shape.select();
          } else {
            shape.deselect();
          }
        });
        Canvas.drawCanvas();
      },
      removeShape(shapeToRemove) {
        if (shapeToRemove.variableBoxType()) {
          this.variables.splice(this.variables.indexOf(shapeToRemove), 1);
        }
        this.shapes.splice(this.shapes.indexOf(shapeToRemove), 1);
        Canvas.drawCanvas();
        return true;
      },
      getShapeByElem(elem) {
        const group = elem.findAncestor('Group');
        if (!group) {
          return null;
        }
        let myshape;
        if (group.shape) {
          myshape = group.shape;
        } else if (group.id()) {
          myshape = MyLabel.getShapeById(group.id());
        }
        return myshape;
      },
      updateImageKeeper() {
        this.imageKeeperJSON = MyImages.exportToJSON();
      },
      fixIds() {
        this.removeInvalidShapes();
        for (const shape of this.shapes) {
          const fixedId = this.nextId();
          shape.shapeId = fixedId;
          shape.attrs.shapeId = fixedId;
          shape.group.id(fixedId);
          if (shape.variableBoxType()) {
            shape.attrs.variableId = fixedId;
          }
        }
      },
      exportToJSON() {
        this.removeInvalidShapes();

        Canvas.setScale(1);
        this.updateImageKeeper();
        return {
          labelName: (labelConfig.labelName || undefined),
          labelDimension: labelConfig.labelDimension,
          pixelPerMM: pxPerMm,
          label: JSON.stringify(this),
          XMLString: this.generateXMLFile(),
          imageString: this.toImageDataURL(),
          labelWidth: MyLabelSize.width,
          labelHeight: MyLabelSize.height,
        };
      },
      toImageDataURL() {
        const shape = this.selectedShape();
        if (shape) { shape.deselect(); }
        const stage = Canvas.stage();
        stage.removeChildren();
        stage.add(Canvas.imageLayer());
        const dataURL = stage.toDataURL('image/png');
        stage.add(Canvas.variableLayer());
        MyLabel.selectShape(shape);
        return dataURL;
      },
      generateXMLFile() {
        const variables = Canvas.variableLayer().getChildren();

        let XMLString = '<?xml version="1.0" encoding="UTF-8"?><nsld_schema><labels><label>' +
        `<image_description><image_filename>${Library.imageName()
        }</image_filename><image_width>${MyLabelSize.width
        }</image_width><image_height>${MyLabelSize.height
        }</image_height><variable_count>${variables.length
        }</variable_count><orientation>${MyLabel.orientation
        }</orientation></image_description><variables>`;

        for (const [i, shape] of MyLabel.variables.entries()) {
          const { group, attrs: info } = shape;

          // Use actual position in XML
          const pos = Library.actualPosition(group);

          if (info) {
            const variableString = `<variable><id>${info.variableId
            }</id><variable_field_count>F${i + 1
            }</variable_field_count><variable_type>${info.variableType
            }</variable_type><rotation_angle>${info.rotationAngle
            }</rotation_angle><startx>${pos.x0
            }</startx><starty>${pos.y0
            }</starty><width>${(pos.x1 - pos.x0)
            }</width><height>${(pos.y1 - pos.y0)
            }</height><fontsize_px>${info.fontSizePx
            }</fontsize_px><fontsize_pt>${info.fontSizePt
            }</fontsize_pt><align>${info.alignment
            }</align><fontfamily>${info.fontFamily
            }</fontfamily><bold>${info.bold
            }</bold><italic>${info.italic
            }</italic><underline>${info.underline
            }</underline><barcode>${info.isBarcode
            }</barcode><barcodetext>${info.showBarcodeText
            }</barcodetext><barcodetop>${info.barcodeTop
            }</barcodetop><barcodewidthfactor>${info.barcodeWidthFactor
            }</barcodewidthfactor><barcode_margin_px>${info.barcodeMargin
            }</barcode_margin_px><barcode_symbology>${info.barcodeSymbology
            }</barcode_symbology></variable>`;
            XMLString += variableString;
          }
        }

        XMLString += '</variables></label></labels></nsld_schema>';
        return XMLString;
      },
      removeInvalidShapes() {
        for (const shape of this.shapes) {
          if (!shape.valid()) {
            this.errorLog.push({
              invalidShapeJSON: JSON.stringify(shape),
              invalidGroupJSON: shape.group.toJSON(),
              errorMessage: shape.attrs.validationError,
            });
            shape.remove(true);
          }
        }
      },
    };
  };

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(() => {
    document.querySelector('.labelname').innerHTML = Library.toTitleCase(labelConfig.labelName);
    document.querySelector('.fonts').style = 'display:none';
    Canvas.initialise();

    MyLabel = new Label();

    MyImages = new ImageUploader.ImageKeeper();

    MyLabel.openLabel(labelConfig);

    UndoRedoModule.saveCurrentState();
  });
}());
