(function () {
  "use strict";

  // TEXT & VARIABLE FORM FUNCTIONS
  $('#textinput').on('input', function (event) {
    myLabel.selectedShape().textBox.text($(this).val());
    Canvas.drawCanvas();
    // UndoRedoModule.registerUndoEvent();
  });
  $('#font-size').on('change', function () {
    myLabel.selectedShape().textBox.fontSize($(this).val());
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  document.querySelector('[id=font-family]').addEventListener('change', function () {
    myLabel.selectedShape().updateText('fontFamily', this.value);
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  document.querySelectorAll('[data-alignment]').forEach(function(elem) {
    elem.addEventListener('click', function() {
      myLabel.selectedShape().textBox.align(this.dataset.alignment);
      VariableSettings.saveVariableSettings(myLabel.selectedShape());
      Canvas.drawCanvas();
      UndoRedoModule.registerUndoEvent();
    });
  });

  $('button.underline').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().textBox.textDecoration('');
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().textBox.textDecoration('underline');
    }
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  $('button.italic').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().updateText('italic', false);
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().updateText('italic', true);
    }
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  $('button.bold').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().updateText('bold', false);
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().updateText('bold', true);
    }
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  $('#textinput').on('change', () => {
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
    UndoRedoModule.registerUndoEvent();
  });

  document.querySelectorAll('input[name="barcode_bool"]').forEach(function(elem) {
    elem.addEventListener('click', function() {
      if (this.value === 'true') {
        document.querySelector('.barcode-options').removeAttribute('style');
      } else {
        document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
      }
    });
  });

  function populateForm(shape) {
    $('button.bold').removeClass('selected');
    $('button.italic').removeClass('selected');
    $('button.underline').removeClass('selected');

    $('#textinput').text(shape.textBox.text());
    $('#font-size').val(shape.textBox.fontSize());
    $('#stroke-width').val(shape.outerBox.strokeWidth());

    $('#font-family').val(shape.savedTextSettings.fontFamily);
    if (shape.savedTextSettings.bold) {
      $('button.bold').addClass('selected');
    }
    if (shape.savedTextSettings.italic) {
      $('button.italic').addClass('selected');
    }
    if (shape.textBox.textDecoration() === 'underline') {
      $('button.underline').addClass('selected');
    }

    $('#textinput').trigger('focus');
  }

  // TOOLBAR FUNCTIONS
  $('#stroke-width').on('change', function () {
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  });
  $("button[name='remove']").click(() => {
    myLabel.selectedShape().remove();
  });
  $('button.rotate').click(() => {
    myLabel.selectedShape().rotate();
    VariableSettings.saveVariableSettings(myLabel.selectedShape());
  });


  // TOOLBAR FUNCTIONS
  function toggleOptions() {
    Clipboard.updateCopyPasteButtons(myLabel);
    const shape = myLabel.selectedShape();
    if (shape) {
      document.querySelector('.text-popup').dataset.disabled = true;
      document.querySelector('.btn-variable-settings').setAttribute('style', 'display:none;');
      $('[name=rotate]').removeAttr('disabled');
      $('[name=remove]').removeAttr('disabled');

      switch (shape.name) {
        case 'VariableBox':
          $('#textinput').attr('title', 'Insert text here for demo purposes only. ' +
            'This will not be saved or displayed in the final label design.');
          $('#textinput').attr('placeholder', 'Demo text');
          document.querySelector('.text-popup').dataset.disabled = false;
          document.querySelector('.btn-variable-settings').removeAttribute('style');
          break;
        case 'TextBox':
          $('#textinput').attr('title', 'Insert text here');
          $('#textinput').attr('placeholder', 'Insert text');
          document.querySelector('.text-popup').dataset.disabled = false;
          break;
        default:
          $('#stroke-width').removeAttr('disabled');
          break;
      }
      // make sure forms are populated
    } else {
      document.querySelector('.text-popup').dataset.disabled = true;
      document.querySelector('.btn-variable-settings').setAttribute('style', 'display:none;');
      $('[name=rotate]').removeAttr('disabled');
      $('[name=remove]').removeAttr('disabled');
      $('#stroke-width').removeAttr('disabled');
      // reset forms
    }
  }

  // UPLOAD IMAGE SHAPES
  $("button[name='image']").click(() => {
    imageDialog.dialog('open');
  });
  var imageDialog = $('#image-dialog-form').dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      'Upload new image': addImage,
      Cancel() {
        imageDialog.dialog('close');
      },
    },
    close() {
      imageDialog.find('form')[0].reset();
    },
  });
  imageDialog.find('input:file').change(function () {
    if (this.files.length > 0) {
      imageDialog.find('notice').addClass('hidden');
    } else {
      imageDialog.find('notice').removeClass('hidden');
    }
  });
  function addImage() {
    const files = imageDialog.find('input:file')[0].files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
          const img = new Image();
          img.src = event.target.result;

          img.onload = function () {
            const myShape = myLabel.newShape('Image', img, this.width, this.height);
            imageDialog.dialog('close');
            imageDialog.find('notice').addClass('hidden');
          };
        };
      }
    } else {
      imageDialog.find('notice').removeClass('hidden');
    }
  }

  // label actions
  document.querySelector('.btn-variable-settings').addEventListener('click', () => {
    const shape = myLabel.selectedShape()
    if (shape.variableBoxType()) {
      VariableSettings.openDialog(shape);
    } else {
      this.setAttribute('style', 'display:none;');
    }
  });
  $('.btn-options').click(() => {
    LabelOptions.openDialog();
  });
  $('.btn-download-image').click(() => {
    event.preventDefault();
    const href = myLabel.toImageDataURL();
    $('#btn-download-image').attr('href', href);
    $('#btn-download-image:first')[0].click();
  });
  $('.btn-save-label').on('click', () => {
    $.ajax({
      url: labelConfig.savePath,
      dataType: 'json',
      type: 'POST',
      data: myLabel.exportToJSON(labelConfig.labelName),
      success(data) {
        if (data.redirect) {
          window.location = data.redirect;
        } else {
          alert('Your Label has been saved successfully');
        }
      },
      error(data) {
        alert('Sorry, but something went wrong');
      },
    });
  });

  const Shape = function Shape() {
    return {
      initialise(name, imageObj, width, height) {
        this.name = name;
        this.group = this[`init${name}`](imageObj, width, height);
        this.group.shape = this;
        this.addGroupFunctions();
        this.outerBox = ((name === 'Line') ? undefined : Library.getChildOfType('Rect', this.group));
        DrawApp.setCurrentElement(this);

        if (name === 'Image') {
          this.image = Library.getChildOfType(name, this.group);
          this.imageSource = imageObj.src;
          Canvas.imageLayer().add(this.group);
          this.addAnchors();
          myLabel.selectShape(this);
          Canvas.drawCanvas();
        } else {
          if (name === 'VariableBox' || name === 'TextBox') {
            this.textBox = Library.getChildOfType('Text', this.group);
            this.setDefaultTextSettings();
          } else {
            this.drawnShape = Library.getChildOfType(name, this.group);
          }
          Canvas.container().onmousemove = this.drawShape;
        }
      },
      reinitialise(konvaGroup, shape) {
        this.name = shape.name;
        this.group = konvaGroup;
        this.group.shape = this;
        this.addGroupFunctions();
        this.outerBox = ((this.lineType()) ? undefined : Library.getChildOfType('Rect', this.group));
        if (this.imageType()) {
          this.image = Library.getChildOfType(this.name, this.group);
          this.imageSource = shape.imageSource;
          const img = new Image;
          img.onload = function () {
            Canvas.drawCanvas();
          };
          this.image.image(img);
          img.src = shape.imageSource;
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
      },
      loadFromJSON(shapeJSON) {
        const shape = JSON.parse(shapeJSON);
        const newGroup = Konva.Node.create(shape.group);
        if (shape.name === 'VariableBox') {
          Canvas.variableLayer().add(newGroup);
        } else {
          Canvas.imageLayer().add(newGroup);
        }
        this.reinitialise(newGroup, shape);
        return this;
      },
      addGroupFunctions() {
        this.group.on('mousedown touchstart', function () {
          this.shape.savePosition();
        });
        this.group.on('dragend', function () {
          if (this.shape.variableBoxType()) {
            this.shape.preventOverlap();
            VariableSettings.saveVariableSettings(this.shape);
          }
          UndoRedoModule.registerUndoEvent();
          Canvas.drawCanvas();
        });
      },
      imageType() {
        return this.name === 'Image';
      },
      rectType() {
        return this.name === 'Rect';
      },
      lineType() {
        return this.name === 'Line';
      },
      variableBoxType() {
        return this.name === 'VariableBox';
      },
      textBoxType() {
        return this.name === 'TextBox';
      },
      ellipseType() {
        return this.name === 'Ellipse';
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
        if (executed) { UndoRedoModule.registerUndoEvent(); }
      },
      rotate() {
        if (this.variableBoxType()) {
          this.savePosition();
          this.group.rotate(90);
          if (this.preventOverlap()) {
            alert('Overlapping variables prevent rotation.');
          }
        } else {
          this.group.rotate(90);
        }
        Canvas.drawCanvas();
        UndoRedoModule.registerUndoEvent();
      },
      highlightOn() {
        if (this.name === 'Rect' || this.name === 'Line') {
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
        if (this.name === 'Rect' || this.name === 'Line') {
          this.drawnShape.shadowBlur(0);
        } else {
          // TODO: fix highlighting
          // this.outerBox.shadowBlur(0);
          if (this.name !== 'VariableBox') {
            this.outerBox.hide();
          }
        }
        Canvas.drawCanvas();
      },
      initLine(event) {
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
      },
      initEllipse(event) {
        const rect = this.initRectangle();
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
      },
      initRect(event) {
        const rect = this.initRectangle();
        const group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false,
        });
        group.add(rect);
        group.addName('rect');
        return group;
      },
      initRectangle(event) {
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
      },
      initText(event) {
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
      },
      initTextBox(event) {
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
        return group;
      },
      initVariableBox(event) {
        const text = this.initText();
        const rect = this.initRectangle();
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
      },
      initImage(imageObj, width, height) {
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
      },
      drawShape(event) {
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
          myLabel.selectShape(shape);
          Canvas.drawCanvas();
        }
      },
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
      },
      addAnchors(event) {
        if (this.name === 'Line') {
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
      },
      removeAnchors() {
        this.getAnchors().forEach((object) => {
          object.destroy();
        });
      },
      resizeShape(activeAnchor) {
        const group = this.group;
        const anchorX = activeAnchor.getX();
        let anchorY = activeAnchor.getY();

        if (this.name === 'Line') {
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
      },
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
      },
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
      },
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
      },
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
      },
      preventOverlap() {
        if ((this.variableBoxType()) && Library.overlap(this.outerBox)) {
          this.resetToSavedPosition();
          return true;
        }
        return false;
      },
      setDefaultTextSettings() {
        this.savedTextSettings = {
          fontFamily: 'Arial',
          bold: false,
          italic: false,
        }
      },
      updateText(attribute, value) {
        this.updateTextSettings(attribute, value);
        this.updateDisplayFont();
      },
      updateTextSettings(attribute, value) {
        this.savedTextSettings[attribute] = value;
      },
      updateDisplayFont() {
        const fontOptions = {
          font: this.getFontFamily(),
          styleOption: this.getFontOption()
        };
        this.textBox.fontFamily(this.displayFont(fontOptions));
        Canvas.drawCanvas();
      },
      getFontFamily() {
        const fontFamily = this.savedTextSettings.fontFamily;
        return (fontFamily.startsWith('A') ? 'arial' : (fontFamily.startsWith('C') ? 'cour' : 'tnr'));
      },
      getFontOption() {
        const settings = this.savedTextSettings;
        let fontOption;
        if (settings.bold && settings.italic) {
          fontOption = 'boldItalic';
        } else {
          fontOption = (settings.bold ? 'bold' : (settings.italic ? 'italic' : 'normal'));
        }
        return fontOption;
      },
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
      },
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
    };
  };

  const Label = function Label() {
    let nextShapeId = 0;
    return {
      openLabel(labelConfig = undefined) {
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
          if (id) { this.id = id; }
          if (name) { this.name = name; }
        } else {
          if (id) { this.id = id; }
          if (name) { this.name = name; }
          this.shapes = [];
          this.stage = Canvas.stage();
          Canvas.doResizeCanvas(width, height);
          this.bindStageListeners();
        }
        Canvas.drawCanvas();
      },
      saveName() {
        let savedName
        if (this.name) {
          savedName = this.name.toLowerCase().replace(/[^a-zA-Z0-9 \-]/g, '').replace(/ /g, '_');
        }
        return savedName;
      },
      imageName() {
        return `${this.saveName()}.png`;
      },
      bindStageListeners() {
        this.stage.on('mouseover', (evt) => {
          if (Library.getCursorName() === 'default') {
            Library.setCursorName('pointer');
          }
          const shape = myLabel.getShapeByElem(evt.target);
          shape.highlightOn();
        });
        this.stage.on('mouseout', (evt) => {
          Library.setCursorName('default');
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
        myLabel = this;
        this.stage = Canvas.resetCanvas(myLabelSize.width, myLabelSize.height);
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
      newShape(type, imageObj = null, width = null, height = null) {
        const myShape = new Shape();
        myShape.shapeId = this.nextId();
        this.shapes.push(myShape);
        myShape.initialise(type, imageObj, width, height);
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
        this.shapes.splice(this.shapes.indexOf(shapeToRemove), 1);
        Canvas.drawCanvas();
      },
      getShapeByElem(elem) {
        const group = elem.findAncestor('Group');
        return group.shape;
      },
      exportToJSON(labelname = undefined) {
        let labelJSON;
        labelJSON = {
          labelName: labelname,
          label: JSON.stringify(this),
          XMLString: this.generateXMLFile(),
          imageString: this.toImageDataURL(),
          labelWidth: myLabelSize.width,
          labelHeight: myLabelSize.height
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
        const variables = Canvas.variableLayer().getChildren();

        let XMLString = `<?xml version="1.0" encoding="UTF-8"?><label_schema>` +
        `<image_description><image_filename>${ this.imageName()
        }</image_filename><image_width>${ myLabelSize.width
        }</image_width><image_height>${ myLabelSize.height
        }</image_height><variable_count>${ variables.length
        }</variable_count><orientation>${ drawEnv.orientation
        }</orientation></image_description><variables>`;

        for (const [i, group] of variables.entries()) {
          const shape = group.shape;
          const info = shape.savedVariableSettings;

          if (info) {
            const variableString = `<variable><id>${ info.variableId
            }</id><variable_field_count>F${ i+1
            }</variable_field_count><variable_type>${ info.variableType
            }</variable_type><rotation_angle>${ info.rotationAngle
            }</rotation_angle><startx>${ info.startX
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
          }
        }

        XMLString += '</variables></label_schema>';
        return XMLString;
      },
    };
  };

  function ready(fn) {
    if (document.readyState != 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(() => {
    document.querySelector('.labelname').innerHTML = Library.toTitleCase(labelConfig.labelName);

    Canvas.initialise();

    myLabel = new Label();
    myLabel.openLabel(labelConfig);

    UndoRedoModule.saveCurrentState();

  });
}());
