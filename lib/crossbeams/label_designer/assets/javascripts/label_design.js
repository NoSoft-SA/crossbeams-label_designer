(function () {


  // const labelConfig = <%= @label_config %>;
  // const labelSizes = <%= @label_sizes %>;
  // const sizeConfig = labelSizes[labelConfig.labelDimension];
  // let myLabelSize = {
  //   width: ((sizeConfig.width !== undefined) ? sizeConfig.width*10 : 700),
  //   height: ((sizeConfig.height !== undefined) ? sizeConfig.height*10 : 500)
  // }



  function setupUndoRedo() {
    UndoRedoModule.initialise(myLabel);
    document.querySelector('.label-designer-undo-button').addEventListener('click', () => {
      UndoRedoModule.callUndo();
      Canvas.drawCanvas();
    });
    document.querySelector('.label-designer-redo-button').addEventListener('click', () => {
      UndoRedoModule.callRedo();
      Canvas.drawCanvas();
    });
  }
  function afterUndoable() {
    UndoRedoModule.registerUndoEvent(myLabel);
  }
  function startUpCanvas() {
    Canvas.initialise();
    document.querySelector('#canvas_width').addEventListener('change', function () {
      Canvas.doResizeCanvas(parseInt(this.value), Canvas.resizableElement().height);
      afterUndoable();
    });
    document.querySelector('#canvas_height').addEventListener('change', function () {
      Canvas.doResizeCanvas(Canvas.resizableElement().width, parseInt(this.value));
      afterUndoable();
    });
  }
  function startUpDrawApp() {
    Canvas.container().addEventListener('mousedown', function (event) {
      DrawApp.drawStart(event, myLabel);
    });
    Canvas.container().addEventListener('mouseup', function (event) {
      DrawApp.drawEnd(myLabel);
    });
    document.querySelectorAll('[data-drawtype]').forEach(function(elem) {
      elem.addEventListener('click', function () {
        DrawApp.setDrawType((DrawApp.activateTool(this) === true) ? this.dataset.drawtype : 'none');
      });
    });
    document.querySelector('[data-pointer]').addEventListener('click', function () {
      DrawApp.clearTool();
    });
  }

  document.addEventListener('mousemove', event => {
    const text = Positioner.getCoords(event).map(item => (item < 0 ? 0 : item)).join(', ');
    document.querySelector('span.currentCoords').textContent = `(${text})`;
  });

  $('.labelname').text(toTitleCase(labelConfig.labelName));
  $('.text-popup').hide();
  $('.barcode-options').hide();
  $('.variable-popup').hide();

  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  function setCursorName(cursorName) {
    document.body.style.cursor = cursorName;
  }
  function getCursorName() {
    return document.body.style.cursor;
  }

  $(document).on('keyup keydown', event => { drawEnv.shifted = event.shiftKey } );
  $(document).on('keyup keydown', event => { drawEnv.controlled = event.ctrlKey } );
  $(document).on('keydown', event => {
    const validKeycode = [46, 37, 39, 38, 40].includes(event.keyCode);
    const validTarget = !(event.target.nodeName === 'TEXTAREA' || event.target.id === 'canvas_width' || event.target.id === 'canvas_height' );
    if (validKeycode && validTarget) {
      event.preventDefault();
      const shape = myLabel.selectedShape();
      const value = (drawEnv.shifted || drawEnv.controlled) ? 10 : 1;
      if (shape) {
        switch (event.keyCode) {
          case 46: // delete key
            shape.remove();
            break;
          case 37: // left arrow
            shape.group.move({ x: -1 * value, y: 0 });
            break;
          case 39: // right arrow
            shape.group.move({ x: value, y: 0 });
            break;
          case 38: // up arrow
            shape.group.move({ x: 0, y: -1 * value });
            break;
          case 40: // down arrow
            shape.group.move({ x: 0, y: value });
            break;
        }
        Canvas.drawCanvas();
      }
    }
  });
  $(document).on('keydown', event => {
    const validKeycode = [89, 90].includes(event.keyCode);
    if (validKeycode && drawEnv.controlled) {
      if (event.keyCode === 89) {
        document.querySelector('.label-designer-redo-button').click();
      } else {
        document.querySelector('.label-designer-undo-button').click();
      }
    };
  });

  // TEXT & VARIABLE FORM FUNCTIONS
  $('#textinput').on('input', function (event) {
    myLabel.selectedShape().textBox.text($(this).val());
    Canvas.drawCanvas();
  });
  $('#font-size').on('change', function () {
    myLabel.selectedShape().textBox.fontSize($(this).val());
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    afterUndoable();
  });
  document.querySelector('[id=font-family]').addEventListener('change', function () {
    myLabel.selectedShape().updateText('fontFamily', this.value);
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    afterUndoable();
  });

  document.querySelectorAll('[data-alignment]').forEach(function(elem) {
    elem.addEventListener('click', function() {
      myLabel.selectedShape().textBox.align(this.dataset.alignment);
      myLabel.selectedShape().saveVariableSettings();
      Canvas.drawCanvas();
      afterUndoable();
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
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    afterUndoable();
  });
  $('button.italic').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().updateText('italic', false);
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().updateText('italic', true);
    }
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    afterUndoable();
  });
  $('button.bold').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().updateText('bold', false);
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().updateText('bold', true);
    }
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    afterUndoable();
  });

  // VARIABLE FORM FUNCTIONS
  $('#textinput, #vars, #barcode_margin, #barcode_symbology').on('change', () => {
    myLabel.selectedShape().saveVariableSettings();
    afterUndoable();
  });

  $('#barcode_bool').on('change', function () {
    if ($(this).val() === 'true') {
      $('.barcode-options').show();
    } else {
      $('.barcode-options').hide();
    }
    myLabel.selectedShape().saveVariableSettings();
    afterUndoable();
  });

  function populateForm(shape) {
    $('form.variable-info-form')[0].reset();
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

    if (shape.variableBoxType()) {
      const info = shape.savedVariableSettings;
      if (info) {
        $('#vars').val(info.variableType);
        if (info.isBarcode === 'true') {
          $('#barcode_bool').val(info.isBarcode);
          $('#barcode_symbology').val(info.barcodeSymbology);
          $('#barcode_margin').val(info.barcodeMargin);
          $('.barcode-options').show();
        } else {
          $('.barcode-options').hide();
        }
      }
    }
    $('#textinput').trigger('focus');
  }

  // TOOLBAR FUNCTIONS
  $('#stroke-width').on('change', function () {
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    Canvas.drawCanvas();
    afterUndoable();
  });
  $("button[name='remove']").click(() => {
    myLabel.selectedShape().remove();
  });
  $('button.rotate').click(() => {
    myLabel.selectedShape().rotate();
    myLabel.selectedShape().saveVariableSettings();
  });

  // HELPER FUNCTIONS
  function getChildOfType(type, group) {
    const child = getChildrenOfType(type, group);
    return child[0];
  }
  function getChildrenOfType(type, group) {
    const children = group.getChildren(node => node.getClassName() === type);
    return children;
  }

  // TOOLBAR FUNCTIONS
  function toggleOptions() {
    const shape = myLabel.selectedShape();
    if (shape) {
      $('.text-popup').hide();
      $('.variable-popup').hide();
      $('[name=rotate]').removeAttr('disabled');
      $('[name=remove]').removeAttr('disabled');

      switch (shape.name) {
        case 'VariableBox':
          $('#textinput').attr('title', 'Insert text here for demo purposes only. ' +
            'This will not be saved or displayed in the final label design.');
          $('#textinput').attr('placeholder', 'Demo text');
          $('.text-popup').show();
          $('.variable-popup').show();
          break;
        case 'TextBox':
          $('#textinput').attr('title', 'Insert text here');
          $('#textinput').attr('placeholder', 'Insert text');
          $('.text-popup').show();
          break;
        default:
          $('#stroke-width').removeAttr('disabled');
          break;
      }
      // make sure forms are populated
    } else {
      $('.text-popup').hide();
      $('.variable-popup').hide();

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

  // SAVE & EXPORT LABEL
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
      data: myLabel.exportToJSON(),
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

  // const Shape = function Shape() {
  //   // From Konva objects
  //   // TEXTBOX: text, fontSize, fontFamily, textDecoration, fontStyle,
  //   // PRIMARY: draggable, rotation, addName,
  //   // DRAWN: points, x, y, width, height,
  //   return {
  //     initialise(name, imageObj, width, height) {
  //       this.name = name;
  //       this.group = this[(`init${name}`)](imageObj, width, height);
  //       this.group.shape = this;
  //       this.addGroupFunctions();
  //       this.outerBox = ((name === 'Line') ? undefined : getChildOfType('Rect', this.group));
  //       DrawApp.setCurrentElement(this);

  //       if (name === 'Image') {
  //         this.image = getChildOfType(name, this.group);
  //         this.imageSource = imageObj.src;
  //         Canvas.imageLayer().add(this.group);
  //         this.addAnchors();
  //         myLabel.selectShape(this);
  //         Canvas.drawCanvas();
  //       } else {
  //         if (name === 'VariableBox' || name === 'TextBox') {
  //           this.textBox = getChildOfType('Text', this.group);
  //           this.setDefaultTextSettings();
  //         } else {
  //           this.drawnShape = getChildOfType(name, this.group);
  //         }
  //         Canvas.container().onmousemove = this.drawShape;
  //       }
  //     },
  //     reinitialise(konvaGroup, shape) {
  //       this.name = shape.name;
  //       this.group = konvaGroup;
  //       this.group.shape = this;
  //       this.addGroupFunctions();

  //       this.outerBox = ((this.lineType()) ? undefined : getChildOfType('Rect', this.group));
  //       if (this.imageType()) {
  //         this.image = getChildOfType(this.name, this.group);
  //         this.imageSource = shape.imageSource;
  //         const img = new Image;
  //         img.onload = function () {
  //           Canvas.drawCanvas();
  //         };
  //         this.image.image(img);
  //         img.src = shape.imageSource;
  //         this.addAnchors();
  //       } else if (this.variableBoxType() || this.textBoxType()) {
  //         this.textBox = getChildOfType('Text', this.group);
  //         if (this.variableBoxType()) {
  //           this.savedVariableSettings = shape.savedVariableSettings;
  //         }
  //       } else {
  //         this.drawnShape = getChildOfType(shape.name, this.group);
  //       }
  //       if (this.outerBox) {
  //         this.outerBox.moveToTop();
  //       }
  //       this.removeAnchors();
  //       this.addAnchors();
  //     },
  //     addGroupFunctions() {
  //       this.group.on('mousedown touchstart', function () {
  //         this.shape.savePosition();
  //       });
  //       this.group.on('dragend', function () {
  //         if (this.shape.variableType) {
  //           this.shape.preventOverlap();
  //           this.shape.outOfBorder();
  //           this.shape.saveVariableSettings();
  //           myLabel.setCanvasMinimums();
  //         }
  //         afterUndoable();
  //         Canvas.drawCanvas();
  //       });
  //     },
  //     imageType() {
  //       return this.name === 'Image';
  //     },
  //     rectType() {
  //       return this.name === 'Rect';
  //     },
  //     lineType() {
  //       return this.name === 'Line';
  //     },
  //     variableBoxType() {
  //       return this.name === 'VariableBox';
  //     },
  //     textBoxType() {
  //       return this.name === 'TextBox';
  //     },
  //     ellipseType() {
  //       return this.name === 'Ellipse';
  //     },
  //     select() {
  //       this.selected = true;
  //       this.group.moveToTop();
  //       this.group.draggable(true);
  //       if (!this.lineType() && this.outerBox && !this.rectType()) {
  //         this.outerBox.show();
  //       }
  //       this.highlightOn();
  //       this.showAnchors();
  //       toggleOptions();
  //       if (this.variableBoxType() || this.textBoxType()) {
  //         populateForm(this);
  //       }
  //     },
  //     deselect() {
  //       this.selected = false;
  //       this.group.draggable(false);
  //       if (!this.rectType() && !this.lineType() && !this.variableBoxType()) {
  //         this.outerBox.hide();
  //       }
  //       this.highlightOff();
  //       this.hideAnchors();
  //       toggleOptions();
  //     },
  //     showAnchors() {
  //       this.getAnchors().forEach((node) => {
  //         node.show();
  //       });
  //     },
  //     hideAnchors() {
  //       this.getAnchors().forEach((node) => {
  //         node.hide();
  //       });
  //     },
  //     getAnchors() {
  //       const anchors = [];
  //       this.group.getChildren((node) => {
  //         if (node.getClassName() === 'Circle') {
  //           anchors.push(node);
  //         }
  //       });
  //       return anchors;
  //     },
  //     remove(force = false) {
  //       var executed = false;
  //       if (this.variableBoxType() && !force) {
  //         if (confirm("Are you sure you want to delete this variable and all it's options")) {
  //           executed = true;
  //           [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
  //             if (object) { object.destroy(); }
  //           });
  //           myLabel.removeShape(this);
  //         }
  //       } else {
  //         executed = true;
  //         [this.outerBox, this.textBox, this.drawnShape, this.group].forEach((object) => {
  //           if (object) { object.destroy(); }
  //         });
  //         myLabel.removeShape(this);
  //       }
  //       if (this.variableBoxType()) { myLabel.setCanvasMinimums(); }
  //       if (executed) { afterUndoable(); }
  //     },
  //     rotate() {
  //       if (this.variableBoxType()) {
  //         this.savePosition();
  //         this.group.rotate(90);
  //         if (this.preventOverlap()) {
  //           alert('Overlapping variables prevent rotation.');
  //         }
  //         this.outOfBorder();
  //       } else {
  //         this.group.rotate(90);
  //       }
  //       Canvas.drawCanvas();
  //       afterUndoable();
  //     },
  //     highlightOn() {
  //       if (this.name === 'Rect' || this.name === 'Line') {
  //         this.drawnShape.shadowColor('black');
  //         this.drawnShape.shadowBlur(20);
  //         this.drawnShape.shadowOpacity(0.9);
  //       } else {
  //         this.outerBox.show();
  //         // TODO: fix highlighting
  //         // this.outerBox.shadowColor('black');
  //         // this.outerBox.shadowBlur(20);
  //         // this.outerBox.shadowOpacity(0.9);
  //       }
  //       Canvas.drawCanvas();
  //     },
  //     highlightOff() {
  //       if (this.name === 'Rect' || this.name === 'Line') {
  //         this.drawnShape.shadowBlur(0);
  //       } else {
  //         // TODO: fix highlighting
  //         // this.outerBox.shadowBlur(0);
  //         if (this.name !== 'VariableBox') {
  //           this.outerBox.hide();
  //         }
  //       }
  //       Canvas.drawCanvas();
  //     },
  //     initLine(event) {
  //       const line = new Konva.Line({
  //         points: [0, 0],
  //         stroke: 'black',
  //         strokeWidth: 2,
  //         lineCap: 'round',
  //         lineJoin: 'round',
  //         fillEnabled: false,
  //       });
  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(line);
  //       group.addName('line');
  //       return group;
  //     },
  //     initEllipse(event) {
  //       const rect = this.initRectangle();
  //       rect.dash([5, 2]);
  //       rect.strokeWidth(1);
  //       const ellipse = new Konva.Ellipse({
  //         x: Positioner.startX(),
  //         y: Positioner.startY(),
  //         radius: {
  //           x: 0,
  //           y: 0,
  //         },
  //         fill: '',
  //         stroke: 'black',
  //         strokeWidth: 2,
  //         fillEnabled: false,
  //       });
  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(ellipse);
  //       group.add(rect);
  //       group.addName('ellipse');
  //       return group;
  //     },
  //     initRect(event) {
  //       const rect = this.initRectangle();
  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(rect);
  //       group.addName('rect');
  //       return group;
  //     },
  //     initRectangle(event) {
  //       const rect = new Konva.Rect({
  //         x: 0,
  //         y: 0,
  //         width: 0,
  //         height: 0,
  //         fill: '',
  //         stroke: 'black',
  //         strokeWidth: 2,
  //         fillEnabled: false,
  //       });
  //       return rect;
  //     },
  //     initText(event) {
  //       const text = new Konva.Text({
  //         x: 0,
  //         y: 0,
  //         text: 'Insert text...',
  //         fontSize: 21,
  //         fontFamily: 'Arial',
  //         fill: 'black',
  //         width: 0,
  //         padding: 0,
  //         align: 'left',
  //       });
  //       return text;
  //     },
  //     initTextBox(event) {
  //       const text = this.initText();
  //       const rect = this.initRectangle();
  //       rect.dash([5, 2]);
  //       rect.strokeWidth(1);
  //       text.padding(5);

  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(text);
  //       group.add(rect);
  //       group.addName('textBox');
  //       return group;
  //     },
  //     initVariableBox(event) {
  //       const text = this.initText();
  //       const rect = this.initRectangle();
  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(text);
  //       group.add(rect);
  //       group.addName('variableBox');
  //       return group;
  //     },
  //     initImage(imageObj, width, height) {
  //       const image = new Konva.Image({
  //         x: 0,
  //         y: 0,
  //         image: imageObj,
  //         width,
  //         height,
  //       });
  //       const rect = new Konva.Rect({
  //         x: 0,
  //         y: 0,
  //         width,
  //         height,
  //         fill: '',
  //         stroke: 'black',
  //         strokeWidth: 2,
  //       });
  //       const group = new Konva.Group({
  //         x: 0,
  //         y: 0,
  //         fillEnabled: false,
  //       });
  //       group.add(image);
  //       group.add(rect);
  //       group.addName('image');
  //       return group;
  //     },
  //     drawShape(event) {
  //       const shape = DrawApp.currentElement();
  //       if (shape) {
  //         Positioner.updateCurrentCoords(event);
  //         // These values can be positive or negative
  //         const distanceX = Positioner.currentX() - Positioner.startX();
  //         const distanceY = Positioner.currentY() - Positioner.startY();

  //         if (shape.name === 'Line') {
  //           shape.group.position({ x: Positioner.startX(), y: Positioner.startY() });
  //           const newX = (drawEnv.shifted ? 0 : distanceX);
  //           const newY = (drawEnv.controlled ? 0 : distanceY);
  //           shape.drawnShape.points([0, 0, newX, newY]);
  //         } else {
  //           shape.group.position({
  //             x: ((distanceX < 0) ? (Positioner.startX() + distanceX) : Positioner.startX()),
  //             y: ((distanceY < 0) ? (Positioner.startY() + distanceY) : Positioner.startY()),
  //           });
  //           const width = Math.abs(distanceX);
  //           const height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distanceY));
  //           [shape.outerBox, shape.textBox, shape.drawnShape].forEach((object) => {
  //             if (object) {
  //               if (object.getClassName() === 'Ellipse') {
  //                 object.x(width / 2);
  //                 object.y(height / 2);
  //               }
  //               object.width(width);
  //               object.height(height);
  //             }
  //           });
  //         }

  //         if (shape.variableBoxType()) {
  //           Canvas.variableLayer().add(shape.group);
  //         } else {
  //           Canvas.imageLayer().add(shape.group);
  //         }
  //         myLabel.selectShape(shape);
  //         Canvas.drawCanvas();
  //       }
  //     },
  //     addAnchor(group, x, y, name) {
  //       const shape = group.shape;
  //       const stage = group.getStage();
  //       const layer = group.getLayer();
  //       const anchor = new Konva.Circle({
  //         x,
  //         y,
  //         stroke: '#666',
  //         fill: '#ddd',
  //         strokeWidth: 1,
  //         radius: 4,
  //         name,
  //         draggable: true,
  //         dragOnTop: false,
  //       });
  //       anchor.on('dragmove', function () {
  //         shape.resizeShape(this);
  //         layer.draw();
  //       });
  //       anchor.on('mousedown touchstart', function () {
  //         shape.savePosition();
  //         group.setDraggable(false);
  //         this.moveToTop();
  //       });
  //       anchor.on('dragend', () => {
  //         shape.resetGroupPosition();
  //         shape.preventOverlap();
  //         group.setDraggable(true);
  //         layer.draw();
  //       });
  //       anchor.on('mouseover', function () {
  //         // add hover styling
  //         const layer = this.getLayer();
  //         let cursorName;
  //         if (name.includes('Point')) {
  //           cursorName = 'default';
  //         } else {
  //           cursorName = name.includes('top') ? 'n' : 's';
  //           cursorName += name.includes('Left') ? 'w-resize' : 'e-resize';
  //         }
  //         setCursorName(cursorName);
  //         this.setStrokeWidth(2);
  //         layer.draw();
  //       });
  //       anchor.on('mouseout', function () {
  //         const layer = this.getLayer();
  //         setCursorName('default');
  //         this.setStrokeWidth(1);
  //         layer.draw();
  //       });
  //       group.add(anchor);
  //     },
  //     addAnchors(event) {
  //       if (this.name === 'Line') {
  //         const points = this.drawnShape.points();
  //         this.addAnchor(this.group, points[0], points[1], 'startPoint');
  //         this.addAnchor(this.group, points[2], points[3], 'endPoint');
  //       } else {
  //         this.addAnchor(
  //           this.group,
  //           this.outerBox.x(),
  //           this.outerBox.y(),
  //           'topLeft'
  //         );
  //         this.addAnchor(
  //           this.group,
  //           (this.outerBox.x() + this.outerBox.width()),
  //           this.outerBox.y(),
  //           'topRight'
  //         );
  //         this.addAnchor(
  //           this.group,
  //           (this.outerBox.x() + this.outerBox.width()),
  //           (this.outerBox.y() + this.outerBox.height()),
  //           'bottomRight'
  //         );
  //         this.addAnchor(
  //           this.group,
  //           this.outerBox.x(),
  //           (this.outerBox.y() + this.outerBox.height()),
  //           'bottomLeft'
  //         );
  //       }
  //       Canvas.drawCanvas();
  //     },
  //     removeAnchors() {
  //       this.getAnchors().forEach((object) => {
  //         object.destroy();
  //       });
  //     },
  //     resizeShape(activeAnchor) {
  //       const group = this.group;
  //       const anchorX = activeAnchor.getX();
  //       let anchorY = activeAnchor.getY();

  //       if (this.name === 'Line') {
  //         const endPoint = group.get('.endPoint')[0];
  //         const startPoint = group.get('.startPoint')[0];
  //         switch (activeAnchor.getName()) {
  //           case 'startPoint':
  //             var newX = ((drawEnv.shifted === true) ? this.drawnShape.points()[2] : anchorX);
  //             var newY = ((drawEnv.controlled === true) ? this.drawnShape.points()[3] : anchorY);
  //             startPoint.setX(newX);
  //             startPoint.setY(newY);
  //             this.drawnShape.points()[0] = newX;
  //             this.drawnShape.points()[1] = newY;
  //             break;
  //           case 'endPoint':
  //             var newX = ((drawEnv.shifted === true) ? this.drawnShape.points()[0] : anchorX);
  //             var newY = ((drawEnv.controlled === true) ? this.drawnShape.points()[1] : anchorY);
  //             endPoint.setX(newX);
  //             endPoint.setY(newY);
  //             this.drawnShape.points()[2] = newX;
  //             this.drawnShape.points()[3] = newY;
  //             break;
  //         }
  //       } else {
  //         const topLeft = group.get('.topLeft')[0];
  //         const topRight = group.get('.topRight')[0];
  //         const bottomRight = group.get('.bottomRight')[0];
  //         const bottomLeft = group.get('.bottomLeft')[0];

  //         // #TODO: Keep aspect ratio of image
  //         if (this.resizeAllowed(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY)) {
  //           if (drawEnv.shifted || drawEnv.controlled) {
  //             if (activeAnchor.getName().includes('top') > -1) {
  //               anchorY = (bottomRight.getY() - Math.abs(topRight.getX() - topLeft.getX()));
  //             } else {
  //               anchorY = (Math.abs(topRight.getX() - topLeft.getX()) + topLeft.getY());
  //             }
  //             activeAnchor.setY(anchorY);
  //           }
  //           switch (activeAnchor.getName()) {
  //             // update anchor positions
  //             case 'topLeft':
  //               topRight.setY(anchorY);
  //               bottomLeft.setX(anchorX);
  //               break;
  //             case 'topRight':
  //               topLeft.setY(anchorY);
  //               bottomRight.setX(anchorX);
  //               break;
  //             case 'bottomRight':
  //               bottomLeft.setY(anchorY);
  //               topRight.setX(anchorX);
  //               break;
  //             case 'bottomLeft':
  //               bottomRight.setY(anchorY);
  //               topLeft.setX(anchorX);
  //               break;
  //           }
  //           const width = topRight.getX() - topLeft.getX();
  //           const height = bottomLeft.getY() - topLeft.getY();
  //           if (width && height) {
  //             [this.outerBox, this.image, this.textBox, this.drawnShape].forEach((object) => {
  //               const newHeight = (drawEnv.shifted || drawEnv.controlled) ? Math.abs(width) : Math.abs(height);
  //               if (object) {
  //                 const position = topLeft.position();
  //                 if (object.getClassName() === 'Ellipse') {
  //                   object.position({
  //                     x: (topLeft.getX() + width / 2),
  //                     y: (topLeft.getY() + height / 2),
  //                   });
  //                 } else {
  //                   object.position(topLeft.position());
  //                 }
  //                 object.width(width);
  //                 object.height(newHeight);
  //               }
  //             });
  //           }
  //         } else {
  //           switch (activeAnchor.getName()) {
  //             // update anchor positions
  //             case 'topLeft':
  //               activeAnchor.setX(bottomRight.getX() - 10);
  //               activeAnchor.setY(bottomRight.getY() - 10);
  //               break;
  //             case 'topRight':
  //               activeAnchor.setX(bottomLeft.getX() + 10);
  //               activeAnchor.setY(bottomLeft.getY() - 10);
  //               break;
  //             case 'bottomRight':
  //               activeAnchor.setX(topLeft.getX() + 10);
  //               activeAnchor.setY(topLeft.getY() + 10);
  //               break;
  //             case 'bottomLeft':
  //               activeAnchor.setX(topRight.getX() - 10);
  //               activeAnchor.setY(topRight.getY() + 10);
  //               break;
  //           }
  //         }
  //       }
  //     },
  //     resizeAllowed(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY) {
  //       if (
  //         topLeft.getX() < bottomRight.getX() &&
  //         topLeft.getY() < bottomRight.getY() &&
  //         bottomLeft.getX() < topRight.getX() &&
  //         bottomLeft.getY() > topRight.getY()
  //       ) {
  //         return true;
  //       }
  //       return false;
  //     },
  //     resetGroupPosition() {
  //       // snap contents back to 0,0 after resize
  //       const contentX = ((this.outerBox) ? this.outerBox.x() : this.drawnShape.x());
  //       const contentY = ((this.outerBox) ? this.outerBox.y() : this.drawnShape.y());

  //       const translateables = [this.textBox, this.drawnShape, this.image];
  //       this.getAnchors().forEach((anchor) => {
  //         translateables.push(anchor);
  //       });
  //       if (this.name !== 'Rect') {
  //         translateables.push(this.outerBox);
  //       }
  //       translateables.forEach((object) => {
  //         if (object) {
  //           object.move({ x: -1 * contentX, y: -1 * contentY });
  //         }
  //       });
  //       this.group.move({ x: contentX, y: contentY });
  //     },
  //     savePosition() {
  //       // Right now this function is only for overlapping of variables
  //       if (this.variableBoxType()) {
  //         const group = this.group;
  //         const topLeft = group.get('.topLeft')[0];
  //         const topRight = group.get('.topRight')[0];
  //         const bottomRight = group.get('.bottomRight')[0];
  //         const bottomLeft = group.get('.bottomLeft')[0];

  //         this.savedPosition = {
  //           theta: group.rotation(),
  //           groupX: group.x(),
  //           groupY: group.y(),
  //           width: this.outerBox.width(),
  //           height: this.outerBox.height(),
  //           anchorPositions: {
  //             topLeft: topLeft.position(),
  //             topRight: topRight.position(),
  //             bottomLeft: bottomLeft.position(),
  //             bottomRight: bottomRight.position(),
  //           },
  //         };
  //       }
  //     },
  //     resetToSavedPosition() {
  //       // Right now this function is only for overlapping of variables
  //       if (this.savedPosition) {
  //         const group = this.group;
  //         const topLeft = group.get('.topLeft')[0];
  //         const topRight = group.get('.topRight')[0];
  //         const bottomRight = group.get('.bottomRight')[0];
  //         const bottomLeft = group.get('.bottomLeft')[0];
  //         // rotation
  //         group.rotation(this.savedPosition.theta);
  //         // dragging and resizing
  //         group.x(this.savedPosition.groupX);
  //         group.y(this.savedPosition.groupY);
  //         // resizing
  //         this.outerBox.width(this.savedPosition.width);
  //         this.outerBox.height(this.savedPosition.height);
  //         this.textBox.width(this.savedPosition.width);
  //         this.textBox.height(this.savedPosition.height);
  //         // resetAnchors
  //         topLeft.position(this.savedPosition.anchorPositions.topLeft);
  //         topRight.position(this.savedPosition.anchorPositions.topRight);
  //         bottomLeft.position(this.savedPosition.anchorPositions.bottomLeft);
  //         bottomRight.position(this.savedPosition.anchorPositions.bottomRight);
  //       }
  //     },
  //     preventOverlap() {
  //       if ((this.variableBoxType()) && overlap(this.outerBox)) {
  //         this.resetToSavedPosition();
  //         return true;
  //       }
  //       return false;
  //     },
  //     outOfBorder() {
  //       if (this.variableBoxType()) {
  //         const pos = actualPosition(this.group);
  //         const height = $('#canvas_height').val();
  //         const width = $('#canvas_width').val();

  //         if (pos.x0 <= 0 || pos.y0 <= 0 || pos.x1 >= width || pos.y1 >= height) {
  //           this.outerBox.stroke('red');
  //           return true;
  //         }
  //         this.outerBox.stroke('black');
  //         return false;

  //         Canvas.drawCanvas();
  //       }
  //     },
  //     saveVariableSettings() {
  //       // Variables only
  //       if (this.variableBoxType()) {
  //         const pos = actualPosition(this.group);
  //         const form = $('form.variable-info-form');
  //         this.savedVariableSettings = {
  //           variableId: this.shapeId,
  //           variableType: form.find('#vars').val(),
  //           orientation: (this.group.rotation() % 360),
  //           position: pos,
  //           startX: pos.x0,
  //           startY: pos.y0,
  //           width: (pos.x1 - pos.x0),
  //           height: (pos.y1 - pos.y0),
  //           fontSizePx: this.textBox.fontSize(),
  //           fontSizePt: this.fontSizePt(this.textBox.fontSize()),
  //           alignment: this.textBox.align(),
  //           fontFamily: this.savedTextSettings.fontFamily,
  //           bold: this.savedTextSettings.bold,
  //           italic: this.savedTextSettings.italic,
  //           underline: (this.textBox.textDecoration() === 'underline'),
  //           isBarcode: form.find('#barcode_bool').val(),
  //           barcodeMargin: form.find('#barcode_margin').val(),
  //           barcodeSymbology: form.find('#barcode_symbology').val(),
  //         };
  //       }
  //     },
  //     setDefaultTextSettings() {
  //       this.savedTextSettings = {
  //         fontFamily: 'Arial',
  //         bold: false,
  //         italic: false,
  //       }
  //     },
  //     updateText(attribute, value) {
  //       this.updateTextSettings(attribute, value);
  //       this.updateDisplayFont();
  //     },
  //     updateTextSettings(attribute, value) {
  //       this.savedTextSettings[attribute] = value;
  //     },
  //     updateDisplayFont() {
  //       const fontOptions = {
  //         font: this.getFontFamily(),
  //         styleOption: this.getFontOption()
  //       };
  //       this.textBox.fontFamily(this.displayFont(fontOptions));
  //       Canvas.drawCanvas();
  //     },
  //     getFontFamily() {
  //       const fontFamily = this.savedTextSettings.fontFamily;
  //       return (fontFamily.startsWith('A') ? 'arial' : (fontFamily.startsWith('C') ? 'cour' : 'tnr'));
  //     },
  //     getFontOption() {
  //       const settings = this.savedTextSettings;
  //       let fontOption;
  //       if (settings.bold && settings.italic) {
  //         fontOption = 'boldItalic';
  //       } else {
  //         fontOption = (settings.bold ? 'bold' : (settings.italic ? 'italic' : 'normal'));
  //       }
  //       return fontOption;
  //     },
  //     fontSizePt(fontSizePx) {
  //       const fontSize = {
  //         8: 6,
  //         9: 7,
  //         11: 8,
  //         12: 9,
  //         13: 10,
  //         15: 11,
  //         16: 12,
  //         17: 13,
  //         19: 14,
  //         21: 15,
  //         22: 16,
  //         23: 17,
  //         24: 18,
  //         25: 19,
  //         26: 20,
  //         28: 21,
  //         29: 22,
  //         31: 23,
  //         32: 24,
  //         33: 25,
  //         35: 26,
  //         36: 27,
  //         37: 28,
  //         39: 29,
  //         40: 30,
  //         47: 35,
  //         53: 40,
  //         60: 45,
  //         67: 50,
  //       };
  //       return fontSize[fontSizePx];
  //     },
  //     displayFont(fontOptions) {
  //       const fontFamilies = {
  //         arial: {
  //           normal: 'Arial',
  //           bold: 'ArialB',
  //           italic: 'ArialI',
  //           boldItalic: 'ArialBI'
  //         },
  //         cour: {
  //           normal: 'Cour',
  //           bold: 'CourB',
  //           italic: 'CourI',
  //           boldItalic: 'CourBI'
  //         },
  //         tnr: {
  //           normal: 'TNR',
  //           bold: 'TNRB',
  //           italic: 'TNRI',
  //           boldItalic: 'TNRBI'
  //         }
  //       }
  //       return fontFamilies[fontOptions.font][fontOptions.styleOption];
  //     }
  //   };
  // };

  function overlap(rectangle) {
    const overlap = [];
    const set = [];

    const rectGroup = rectangle.findAncestor('Group');
    const rectPosition = actualPosition(rectGroup);

    Canvas.variableLayer().getChildren().forEach((group) => {
      const object = actualPosition(group);
      set.push(object);
    });

    if (rectangle && (set[0] !== undefined)) {
      const x0 = rectPosition.x0;
      const x1 = rectPosition.x1;
      const y0 = rectPosition.y0;
      const y1 = rectPosition.y1;

      set.forEach((e) => {
        const ex0 = e.x0;
        const ex1 = e.x1;
        const ey0 = e.y0;
        const ey1 = e.y1;

        if ( !( JSON.stringify(rectPosition) == JSON.stringify(e) ) ) {
          const a = (((y0 <= ey0 && ey0 <= y1) || (y0 <= ey1 && ey1 <= y1)) &&
                    ((x0 <= ex0 && ex0 <= x1) || (x0 <= ex1 && ex1 <= x1)));
          const b = (((ey0 <= y0 && y0 <= ey1) || (ey0 <= y1 && y1 <= ey1)) &&
                    ((ex0 <= x0 && x0 <= ex1) || (ex0 <= x1 && x1 <= ex1)));
          const c = ((x0 > ex0 && x1 < ex1 && y0 < ey0 && y1 > ey1) ||
                    (ex0 > x0 && ex1 < x1 && ey0 < y0 && ey1 > y1));
          overlap.push(a || b || c);
        }
      });
    }
    return overlap.includes(true);
  }

  function actualPosition(group) {
    // Meant for variables
    const rect = getChildOfType('Rect', group);
    const theta = group.rotation() % 360;
    let object;
    switch (theta) {
      case 0:
        object = {
          x0: group.x(),
          x1: group.x() + rect.width(),
          y0: group.y(),
          y1: group.y() + rect.height(),
        };
        break;
      case 90:
        object = {
          x0: group.x() - rect.height(),
          x1: group.x(),
          y0: group.y(),
          y1: group.y() + rect.width(),
        };
        break;
      case 180:
        object = {
          x0: group.x() - rect.width(),
          x1: group.x(),
          y0: group.y() - rect.height(),
          y1: group.y(),
        };
        break;
      case 270:
        object = {
          x0: group.x(),
          x1: group.x() + rect.height(),
          y0: group.y() - rect.width(),
          y1: group.y(),
        };
        break;
    }
    return object;
  }

  // const Label = function Label() {
  //   let nextShapeId = 0;
  //   return {
  //     openLabel(labelConfig = undefined) {
  //       if (labelConfig){
  //         const width = myLabelSize.width;
  //         const height = myLabelSize.height;

  //         if (labelConfig.labelState === 'preview') {
  //           // return preview only
  //         } else {
  //           // Load initial label
  //           Canvas.resetCanvas(width, height);

  //           if (labelConfig.labelState === 'new') {
  //             this.initialise(width, height, labelConfig.labelName, labelConfig.id, undefined);
  //           } else {
  //             this.initialise(undefined, undefined, (labelConfig.labelName || undefined), (labelConfig.id || undefined), labelConfig.labelJSON);
  //           }
  //           Canvas.drawCanvas();
  //         }
  //       } else {
  //         throw "ERROR: Invalid label config.";
  //       }
  //     },
  //     initialise(width = undefined, height = undefined, name = undefined, id = undefined, labelJSON = undefined) {
  //       if (labelJSON) {
  //         this.loadFromJson(labelJSON);
  //         this.id = id;
  //         this.name = name;
  //       } else {
  //         this.id = id;
  //         this.name = name;
  //         this.shapes = [];
  //         this.labelWidth = width;
  //         this.labelHeight = height;
  //         this.minLabelWidth = 0;
  //         this.minLabelHeight = 0;

  //         this.stage = Canvas.stage();
  //         Canvas.doResizeCanvas(width, height);
  //         this.bindStageListeners();
  //       }
  //       Canvas.drawCanvas();
  //     },
  //     saveName() {
  //       let savedName
  //       if (this.name) {
  //         savedName = this.name.toLowerCase().replace(/[^a-zA-Z0-9 \-]/g, '').replace(/ /g, '_');
  //       }
  //       return savedName;
  //     },
  //     imageName() {
  //       return `${this.saveName()}.png`;
  //     },
  //     setCanvasMinimums() {
  //       const widthRestrictionSet = [];
  //       const heightRestrictionSet = [];

  //       Canvas.variableLayer().getChildren().forEach((group) => {
  //         const object = actualPosition(group);
  //         widthRestrictionSet.push(object.x1);
  //         heightRestrictionSet.push(object.y1);
  //       });

  //       this.minLabelWidth = (Math.max(...widthRestrictionSet) + 1); // +1 for safety
  //       this.minLabelHeight = (Math.max(...heightRestrictionSet) + 1);

  //       Canvas.setMinimums(this.minLabelWidth, this.minLabelHeight);
  //     },
  //     bindStageListeners() {
  //       this.stage.on('mouseover', (evt) => {
  //         if (getCursorName() === 'default') {
  //           setCursorName('pointer');
  //         }
  //         const shape = myLabel.getShapeByElem(evt.target);
  //         shape.highlightOn();
  //       });
  //       this.stage.on('mouseout', (evt) => {
  //         setCursorName('default');
  //         const shape = myLabel.getShapeByElem(evt.target);
  //         if (!shape.selected) { shape.highlightOff(); }
  //       });
  //       this.stage.on('click', (evt) => {
  //         const shape = myLabel.getShapeByElem(evt.target);
  //         myLabel.selectShape(shape);
  //       });
  //     },
  //     loadFromJson(labelJSON) {
  //       const newLabel = JSON.parse(labelJSON);
  //       this.name = newLabel.name;
  //       this.shapes = [];
  //       this.labelWidth = newLabel.labelWidth;
  //       this.labelHeight = newLabel.labelHeight;
  //       this.minLabelWidth = 0;
  //       this.minLabelHeight = 0;

  //       myLabel = this;
  //       this.stage = Canvas.resetCanvas(this.labelWidth, this.labelHeight);
  //       this.bindStageListeners();

  //       const newShapes = [];
  //       newLabel.shapes.forEach((shape) => {
  //         const newShape = new Shape();
  //         const newGroup = Konva.Node.create(shape.group);

  //         if (shape.name === 'VariableBox') {
  //           Canvas.variableLayer().add(newGroup);
  //         } else {
  //           Canvas.imageLayer().add(newGroup);
  //         }

  //         newShape.reinitialise(newGroup, shape);
  //         newShapes.push(newShape);
  //       });

  //       this.shapes = newShapes;
  //       const shape = this.shapes[(this.shapes.length - 1)];
  //       this.selectShape(shape);
  //       this.stage.draw();
  //     },
  //     newShape(type, imageObj = null, width = null, height = null) {
  //       const myShape = new Shape();
  //       myShape.shapeId = this.nextId();
  //       this.shapes.push(myShape);
  //       myShape.initialise(type, imageObj, width, height);
  //       return myShape;
  //     },
  //     nextId() {
  //       nextShapeId += 1;
  //       return nextShapeId;
  //     },
  //     selectedShape() {
  //       return this.shapes.find(shape => shape.selected === true);
  //     },
  //     getShapeById(id) {
  //       return this.shapes.find(shape => shape.shapeId === id);
  //     },
  //     selectShape(shapeToSelect) {
  //       this.shapes.forEach((shape) => {
  //         if (shape === shapeToSelect) {
  //           shape.select();
  //         } else {
  //           shape.deselect();
  //         }
  //       });
  //       Canvas.drawCanvas();
  //     },
  //     removeShape(shapeToRemove) {
  //       this.shapes.splice(this.shapes.indexOf(shapeToRemove), 1);
  //       Canvas.drawCanvas();
  //     },
  //     getShapeByElem(elem) {
  //       const group = elem.findAncestor('Group');
  //       return group.shape;
  //     },
  //     ensureLabelDimensions() {
  //       this.labelWidth = $('#paper.resizable').width();
  //       this.labelHeight = $('#paper.resizable').height();
  //     },
  //     exportToJSON() {
  //       this.ensureLabelDimensions();
  //       let labelJSON;
  //       labelJSON = {
  //         labelName: this.saveName(),
  //         label: JSON.stringify(this),
  //         XMLString: this.generateXMLFile(),
  //         imageString: this.toImageDataURL(),
  //         labelWidth: this.labelWidth,
  //         labelHeight: this.labelHeight
  //       };
  //       return labelJSON;
  //     },
  //     toImageDataURL() {
  //       const shape = this.selectedShape();
  //       if (shape){shape.deselect()};
  //       let dataURL;
  //       Canvas.stage().removeChildren();
  //       Canvas.stage().add(Canvas.imageLayer());
  //       dataURL = Canvas.stage().toDataURL('image/png');
  //       Canvas.stage().add(Canvas.variableLayer());
  //       myLabel.selectShape(shape);
  //       return dataURL;
  //     },
  //     generateXMLFile() {
  //       let XMLString = `<?xml version="1.0" encoding="UTF-8"?><label_schema>` +
  //       `<image_description><image_filename>${ this.imageName()
  //       }</image_filename><image_width>${ this.labelWidth
  //       }</image_width><image_height>${ this.labelHeight
  //       }</image_height><variable_count>${ Canvas.variableLayer().getChildren().length
  //       }</variable_count></image_description><variables>`;

  //       Canvas.variableLayer().getChildren((variableGrouping) => {
  //         const shape = variableGrouping.shape;
  //         const info = shape.savedVariableSettings;

  //         const variableString = `<variable><id>${ info.variableId
  //         }</id><variable_type>${ info.variableType
  //         }</variable_type><orientation>${ info.orientation
  //         }</orientation><startx>${ info.startX
  //         }</startx><starty>${ info.startY
  //         }</starty><width>${ info.width
  //         }</width><height>${ info.height
  //         }</height><fontsize_px>${ info.fontSizePx
  //         }</fontsize_px><fontsize_pt>${ info.fontSizePt
  //         }</fontsize_pt><align>${ info.alignment
  //         }</align><fontfamily>${ info.fontFamily
  //         }</fontfamily><bold>${ info.bold
  //         }</bold><italic>${ info.italic
  //         }</italic><underline>${ info.underline
  //         }</underline><barcode>${ info.isBarcode
  //         }</barcode><barcode_margin_px>${ info.barcodeMargin
  //         }</barcode_margin_px><barcode_symbology>${ info.barcodeSymbology
  //         }</barcode_symbology></variable>`;

  //         XMLString += variableString;
  //       });

  //       XMLString += '</variables></label_schema>';
  //       return XMLString;
  //     },
  //   };
  // };

  function ready(fn) {
    if (document.readyState != 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(() => {
    startUpCanvas();
    startUpDrawApp();

    labelSet = new ExternalLabelSet();
    console.log(labelSet);
    labelSet.openLabel(labelConfig);
    console.log(labelSet);
    myLabel = labelSet.currentLabel();
    console.log(myLabel);
    // myLabel = new Label();
    // myLabel.openLabel(labelConfig);

    setupUndoRedo();

    // var x = new ExternalShape('hello');
    // console.log(x);
    // var y = new ExternalLabel('hello', x);
    // console.log(y);
    // console.log(y.name);
    // console.log(y.length);

    // var z = new LineShape('hello', y, 'Line');
    // console.log(z);
    // console.log(y);
    // console.log(y.length);

    // var m = y.newShape('Line')
    // console.log(m)
  });

}());
