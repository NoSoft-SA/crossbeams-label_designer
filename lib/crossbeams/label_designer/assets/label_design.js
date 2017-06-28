(function () {
  'use strict';


  // Labeldesigner
  //   Label
  //      Export
  //      Load
  //      Initialise
  //      Save
  //      Duplicate
  //   Shape
  //   Toolbar
  //   FormDialog
  //   ImageDialog
  //   Global functions || library

  // // TESTING UNDO REDO OPTIONS
  // var newLabel = new Label();
  // newLabel.loadFromJson( JSON.stringify(myLabel) );
  // console.log(newLabel);



  var drawEnv = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    shifted: false,
    controlled: false,
    initWidth: 700,
    initHeight: 500,
    divPaper: $('#paper')[0],
    offset: findPos($('#paper')[0]),
    drawing: 'none',
    stage: new Konva.Stage({
      container: 'paper',
      width: 700,
      height: 500
    }),
    imageLayer: new Konva.Layer({name: 'image', fill: 'white'}),
    variableLayer: new Konva.Layer({name: 'variable'}),
    currentElement: new Konva.Node()
  };
  var myLabel;

  // #################### CANVAS FUNCTIONS ####################################################
  drawEnv.imageLayer.draw();
  drawEnv.variableLayer.draw();
  drawEnv.stage.add(drawEnv.imageLayer, drawEnv.variableLayer);

  drawEnv.divPaper.width = drawEnv.initWidth;
  drawEnv.divPaper.height = drawEnv.initHeight;

  $('.resizable').resizable({
    resize: function ( event, ui ) {
      var height = $('.resizable').height();
      var width = $('.resizable').width();

      doResizeCanvas(width, height);
    }
  });

  $('.text-popup').hide();
  $('.barcode-options').hide();
  $('.variable-popup').hide();

  // update offset on scroll
  $(document).on('mousewheel', function (event) {drawEnv.offset = findPos(drawEnv.divPaper);});
  $(document).on('keyup keydown', function (event) {drawEnv.shifted = event.shiftKey;});
  $(document).on('keyup keydown', function (event) {drawEnv.controlled = event.ctrlKey;});
  $(document).on('keydown', function (event) {
    var index = [46, 37, 39, 38, 40].indexOf(event.keyCode);
    if (index > -1) {
      var shape = myLabel.selectedShape();
      if (shape) {
        if (index === 0) {
          // delete key
          shape.remove();
        } else {
          var value = ((drawEnv.shifted || drawEnv.controlled) ? 10 : 1);
          switch (index) {
            case 1: // left arrow
              shape.group.move({x:-1*value, y: 0});
              break;
            case 2: // right arrow
              shape.group.move({x:value, y:0});
              break;
            case 3: // up arrow
              shape.group.move({x:0, y: -1*value});
              break;
            case 4: // down arrow
              shape.group.move({x:0, y: value});
              break;
          }
          drawEnv.stage.draw();
        }
      }
    }
  });
  drawEnv.divPaper.onmousedown = function (event) {
    updateStartCoords(event);
    if (drawEnv.drawing !== 'none') {
      var myShape = myLabel.newShape(drawEnv.drawing);
    }
  };
  drawEnv.divPaper.onmouseup = function (event) {
    drawEnv.divPaper.onmousemove = null;
    if (drawEnv.drawing !== 'none') {
      var shape = myLabel.selectedShape();
      shape.addAnchors();
      if ('VariableBox' === shape.name) {
        myLabel.setCanvasMinimums();
        if (overlap(shape.outerBox)) {
          shape.remove(true);
        } else {
          shape.saveVariableInfo();
        }
      }
    }
    UndoEngine.addCommand({action: 'new', object_definition: '{Konva Rect ...}', executeUndo() {console.log('undoing new'); }, executeRedo() { console.log('redo new'); } });
    // toggleOptions();
    clearTool();
  };

  // #################### FORM FUNCTIONS ######################################################
  $('#canvas_width').on('change', function () {
    var height = $('.resizable').height();
    var original_width = $('.resizable').width();
    var width = parseInt($(this).val());
    doResizeCanvas( width, height, original_width );
  });
  $('#canvas_height').on('change', function () {
    var height = parseInt($(this).val());
    var original_height = $('.resizable').height();
    var width = $('.resizable').width();
    doResizeCanvas( width, height, null, original_height );
  });

  // #################### TEXT & VARIABLE FORM FUNCTIONS ######################################
  $('#textinput').on('input', function (event) {
    myLabel.selectedShape().textBox.text($(this).val());
    drawEnv.stage.draw();
  });
  $('#font-size').on('change', function () {
    myLabel.selectedShape().textBox.fontSize($(this).val());
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  $('#font-family').on('change', function () {
    myLabel.selectedShape().textBox.fontFamily($(this).val());
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  $('button.underline').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().textBox.textDecoration('');
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().textBox.textDecoration('underline');
    }
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  $('button.italic, button.bold').on('click', function () {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      myLabel.selectedShape().textBox.fontStyle('normal');
    } else {
      $('button.italic').removeClass('selected');
      $('button.bold').removeClass('selected');
      $(this).addClass('selected');
      myLabel.selectedShape().textBox.fontStyle($(this).attr('name'));
    }
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  // #################### VARIABLE FORM FUNCTIONS #############################################

  $('#textinput, #vars, #barcode_margin, #barcode_symbology').on('change', function () {
    myLabel.selectedShape().saveVariableInfo();
  });

  $('#barcode_bool').on('change', function () {
    if ($(this).val() === 'Yes') {
      $('.barcode-options').show();
    } else {
      $('.barcode-options').hide();
    }
    myLabel.selectedShape().saveVariableInfo();
  });

  function populateForm(shape) {
    $('form.variable-info-form')[0].reset();
    $('button.bold').removeClass('selected');
    $('button.italic').removeClass('selected');
    $('button.underline').removeClass('selected');

    $('#textinput').text(shape.textBox.text());
    $('#font-size').val(shape.textBox.fontSize());
    $('#font-family').val(shape.textBox.fontFamily());
    if (shape.textBox.fontStyle() === 'bold') {
      $('button.bold').addClass('selected');
    }
    if (shape.textBox.fontStyle() === 'italic') {
      $('button.italic').addClass('selected');
    }
    if (shape.textBox.textDecoration() === 'underline') {
      $('button.underline').addClass('selected');
    }

    if (shape.name === 'VariableBox') {
      var info = shape.savedVariableInfo;
      if (info) {
        $('#vars').val(info.variableType);
        $('#barcode_bool').val(info.isBarcode);
        $('#barcode_symbology').val(info.barcodeSymbology);
        $('#barcode_margin').val(info.barcodeMargin);
      }
    }

    $('#textinput').trigger('focus');
  }

  // #################### TOOLBAR FUNCTIONS ###################################################
  $('#stroke-width').on('change', function () {
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    drawEnv.stage.draw();
  });
  $("button[name='remove']").click(function () {
    myLabel.selectedShape().remove();
  });
  $('button.rotate').click(function () {
    myLabel.selectedShape().rotate();
    myLabel.selectedShape().saveVariableInfo();
  });
  $('button.undo').click(function () {

  });
  $('button.redo').click(function () {

  });
  $("button[name='TextBox']," +
    "button[name='Line']," +
    "button[name='Rect']," +
    "button[name='Ellipse']," +
    "button[name='VariableBox']").click(function () {
        // toggleOptions();
        drawEnv.drawing = ((activateTool(this) === true) ? $(this).attr('name') : 'none');
  });
  $("button[name='Pointer']").click(function () {
    clearTool();
  });

  // #################### HELPER FUNCTIONS ####################################################
  function clearTool() {
    drawEnv.drawing='none';
    drawEnv.currentElement = new Konva.Node();
    // $('form.variable-info-form')[0].reset();

    // deselect all relevant buttons
    $("button[name='Line'").removeClass('selected');
    $("button[name='Rect'").removeClass('selected');
    $("button[name='Ellipse'").removeClass('selected');
    $("button[name='TextBox'").removeClass('selected');
    $("button[name='VariableBox'").removeClass('selected');
  }
  function doResizeCanvas(width, height, original_width=null, original_height=null) {
    if (width >= myLabel.minLabelWidth) {
      $('#canvas_width').val(width);
      drawEnv.stage.width(width);
      if (original_width) {
        $('.resizable').width(width);
      }
    } else {
      if (original_width) {
        $('#canvas_width').val(original_width);
        alert('Variables are not allowed to be cut off. Please move the variables first.');
      }
    }
    if (height >= myLabel.minLabelHeight) {
      $('#canvas_height').val(height);
      drawEnv.stage.height(height);
      if (original_height) {
        $('.resizable').height(height);
      }
    } else {
      if (original_height) {
        $('#canvas_height').val(original_height);
        alert('Variables are not allowed to be cut off. Please move the variables first.');
      }
    }
    drawEnv.variableLayer.getChildren(function (group) {
      group.shape.outOfBorder();
    });
  }

  function getChildOfType(type, group) {
    var child = getChildrenOfType(type, group);
    return child[0];
  }
  function getChildrenOfType(type, group) {
    var children = group.getChildren(function (node) {
      return node.getClassName() === type;
    });
    return children;
  }
  // Get the absolute position of a particular object on the page
  // Source: http://www.quirksmode.org/js/findpos.html
  function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
      do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return [curleft, curtop];
    } else {
      return false;
    }
  }
  // Get the current position of the mouse, relative to the page
  function getCoords(event) {
    event = event || window.event;
    if (event.pageX || event.pageY) {
      return {x: event.pageX, y: event.pageY};
    }
    return {
      x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: event.clientY + document.body.scrollTop  - document.body.clientTop
    };
  }
  function updateStartCoords(event) {
    // start of mouseclick relative to paper
    var mouseCoords = getCoords(event);
    drawEnv.startX = (mouseCoords.x - drawEnv.offset[0]);
    drawEnv.startY = (mouseCoords.y - drawEnv.offset[1]);
  }
  function updateCurrentCoords(event) {
    // start of mouseclick relative to paper
    var mouseCoords = getCoords(event);
    drawEnv.currentX = (mouseCoords.x - drawEnv.offset[0]);
    drawEnv.currentY = (mouseCoords.y - drawEnv.offset[1]);
  }
  // ##########################################################################################

  // #################### TOOLBAR FUNCTIONS ###################################################
  function toggleOptions() {
    var shape = myLabel.selectedShape();
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
  // #TODO: split out helper functions via namespacing
  function activateTool(tool_handle) {
    var activate;
    clearTool();
    if ($(tool_handle).hasClass('selected')) {
      // $(tool_handle).removeClass('selected');
      // $('button[name='pointer']').trigger('click');
      activate=false;
    } else {
      // select current
      $(tool_handle).addClass('selected');
      activate=true;
    }
    return activate;
  }
  // ##########################################################################################

  // ############## UPLOAD IMAGE SHAPES #######################################################
  $("button[name='image']").click(function () {
    imageDialog.dialog( 'open' );
  });
  var imageDialog = $( '#image-dialog-form' ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      'Upload new image': addImage,
      Cancel: function () {
        imageDialog.dialog( 'close' );
      }
    },
    close: function () {
      imageDialog.find('form')[ 0 ].reset();
    }
  });
  imageDialog.find('input:file').change(function () {
    if (this.files.length > 0) {
      imageDialog.find('notice').addClass('hidden');
    } else {
      imageDialog.find('notice').removeClass('hidden');
    }
  });
  function addImage() {
    var files = imageDialog.find('input:file')[0].files;
    if (files.length > 0) {
      var file = files[0];
      if (file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
          var img = new Image();
          img.src = event.target.result;

          img.onload = function () {
            var myShape = myLabel.newShape('Image', img, this.width, this.height);
            imageDialog.dialog( 'close' );
            imageDialog.find('notice').addClass('hidden');
          };
        };
      }
    } else {
      imageDialog.find('notice').removeClass('hidden');
    }
  }
  // ##########################################################################################

  // ############## SAVE & EXPORT LABEL #######################################################

  $('.btn-download-image').click(function () {
    event.preventDefault();
    var href = toImageDataURL();
    $('#btn-download-image').attr('href', href);
    $('#btn-download-image:first')[0].click();
  });
  $('.btn-save-label').on('click', function () {
    $.ajax({
      url: '<%= @json_save_path %>',
      dataType: 'json',
      type: 'POST',
      data: myLabel.exportToJSON(),
      success: function (data) {
        alert('Your Label has been saved successfully');
      },
      error: function (data) {
        alert('Sorry, but something went wrong');
      }
    });
  });
  // ###############################################################################################

  var Shape = function Shape() {
    // var name, //shapeId
    //   group,
    //   outerBox,
    //   image,
    //   drawnShape,
    //   textBox;
    // var attr = {
    //   type: null,
    //   drawn: false
    // }
    // From Konva objects
    // TEXTBOX: text, fontSize, fontFamily, textDecoration, fontStyle,
    // PRIMARY: draggable, rotation, addName,
    // DRAWN: points, x, y, width, height,

    // this.type = function () {
    //   return attr.type;
    // }
    return{
      initialise: function (name, imageObj, width, height) {
        this.name = name;
        this.group = this[('init' + name)](imageObj, width, height);
        this.group.shape = this;
        this.group.on('mousedown touchstart', function () {
          this.shape.savePosition();
        });
        this.group.on('dragend', function () {
          this.shape.preventOverlap();
          this.shape.outOfBorder();
          myLabel.setCanvasMinimums();
          drawEnv.stage.draw();
        });
        this.outerBox = ((name === 'Line') ? undefined : getChildOfType('Rect', this.group));
        drawEnv.currentElement = this;

        if ('Image' === name) {
          this.image = getChildOfType(name, this.group);
          drawEnv.imageLayer.add(this.group);
          this.addAnchors();
          myLabel.selectShape(this);
          drawEnv.stage.draw();
        } else {
          if ('VariableBox' === name || 'TextBox' === name) {
            this.textBox = getChildOfType('Text', this.group);
          } else {
            this.drawnShape = getChildOfType(name, this.group);
          }
          drawEnv.divPaper.onmousemove = this.drawShape;
        }
      },
      reinitialise: function (konvaGroup, shape) {
        this.name = shape.name;
        this.group = konvaGroup;
        this.group.shape = this;
        this.group.on('mousedown touchstart', function () {
          this.shape.savePosition();
        });
        this.group.on('dragend', function () {
          this.shape.preventOverlap();
          this.shape.outOfBorder();
          myLabel.setCanvasMinimums();
          drawEnv.stage.draw();
        });
        this.outerBox = ((this.name === 'Line') ? undefined : getChildOfType('Rect', this.group));
        if ('Image' === shape.name) {
          this.image = getChildOfType(this.name, this.group);
          this.addAnchors();
          drawEnv.stage.draw();
        } else {
          if ('VariableBox' === shape.name || 'TextBox' === shape.name) {
            this.textBox = getChildOfType('Text', this.group);
          } else {
            this.drawnShape = getChildOfType(shape.name, this.group);
          }
        }
      },
      imageType: function () {
        return this.name === 'Image';
      },
      rectType: function () {
        return this.name === 'Rect';
      },
      lineType: function () {
        return this.name === 'Line';
      },
      variableBoxType: function () {
        return this.name === 'VariableBox';
      },
      textBoxType: function () {
        return this.name === 'TextBox';
      },
      ellipseType: function () {
        return this.name === 'Ellipse';
      },
      select: function () {
        this.selected = true;
        this.group.moveToTop();
        this.group.draggable(true);
        if (this.name !== 'Line' && this.outerBox && this.name !== 'Rect') {
          this.outerBox.show();
        }
        this.highlightOn();
        this.showAnchors();
        toggleOptions();
        if (this.name === 'VariableBox' || this.name === 'TextBox') {
          populateForm(this);
        }
      },
      deselect: function () {
        this.selected = false;
        this.group.draggable(false);
        if (this.name !== 'Rect' && this.name !== 'Line' && this.name !== 'VariableBox') {
          this.outerBox.hide();
        }
        this.highlightOff();
        this.hideAnchors();
        toggleOptions();
      },
      showAnchors: function () {
        this.getAnchors().forEach(function (node) {
          node.show();
        });
      },
      hideAnchors: function () {
        this.getAnchors().forEach(function (node) {
          node.hide();
        });
      },
      getAnchors: function () {
        var anchors = [];
        this.group.getChildren(function (node) {
          if (node.getClassName() === 'Circle') {
            anchors.push(node);
          }
        });
        return anchors;
      },
      remove: function (force=false) {
        if ('VariableBox' === this.name && !force) {
          if (confirm("Are you sure you want to delete this variable and all it's options")) {
            [this.outerBox, this.textBox, this.drawnShape, this.group].forEach( function (object) {
              if (object) { object.destroy(); }
            });
            myLabel.removeShape(this);
          }
        } else {
          [this.outerBox, this.textBox, this.drawnShape, this.group].forEach( function (object) {
            if (object) { object.destroy(); }
          });
          myLabel.removeShape(this);
        }
        if ('VariableBox' === this.name) {myLabel.setCanvasMinimums();}
      },
      rotate: function () {
        if ('VariableBox' === this.name) {
          this.savePosition();
          this.group.rotate(90);
          if (this.preventOverlap()) {
            alert('Overlapping variables prevent rotation.');
          }
          this.outOfBorder();
        } else {
          this.group.rotate(90);
        }
        drawEnv.stage.draw();
      },
      highlightOn: function () {
        if (this.name === 'Rect' || this.name === 'Line') {
          this.drawnShape.shadowColor('black');
          this.drawnShape.shadowBlur(20);
          this.drawnShape.shadowOpacity(0.9);
        } else {
          this.outerBox.show();
          // this doesn't work?
          // this.outerBox.shadowColor('black');
          // this.outerBox.shadowBlur(20);
          // this.outerBox.shadowOpacity(0.9);
        }
        drawEnv.stage.draw();
      },
      highlightOff: function () {
        if (this.name === 'Rect' || this.name === 'Line') {
          this.drawnShape.shadowBlur(0);
        } else {
          // this doesn't work?
          // this.outerBox.shadowBlur(0);
          if (this.name !== 'VariableBox') {
            this.outerBox.hide();
          }
        }
        drawEnv.stage.draw();
      },
      initLine: function (event) {
        var line = new Konva.Line({
          points: [0, 0],
          stroke: 'black',
          strokeWidth: 2,
          lineCap: 'round',
          lineJoin: 'round',
          fillEnabled: false
        });
        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(line);
        group.addName('line');
        return group;
      },
      initEllipse: function (event) {
        var rect = this.initRectangle();
        rect.dash([5, 2]);
        rect.strokeWidth(1);
        var ellipse = new Konva.Ellipse({
          x: drawEnv.startX,
          y: drawEnv.startY,
          radius: {
            x: 0,
            y: 0
          },
          fill: '',
          stroke: 'black',
          strokeWidth: 2,
          fillEnabled: false
        });
        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(ellipse);
        group.add(rect);
        group.addName('ellipse');
        return group;
      },
      initRect: function (event) {
        var rect = this.initRectangle();
        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(rect);
        group.addName('rect');
        return group;
      },
      initRectangle: function (event) {
        var rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          fill: '',
          stroke: 'black',
          strokeWidth: 2,
          fillEnabled: false
        });
        return rect;
      },
      initText: function (event) {
        var text = new Konva.Text({
          x: 0,
          y: 0,
          text: 'Insert text...',
          fontSize: 21,
          fontFamily: 'Times New Roman',
          fill: 'black',
          width: 0,
          padding: 0,
          align: 'left'
        });
        return text;
      },
      initTextBox: function (event) {
        var text = this.initText();
        var rect = this.initRectangle();
        rect.dash([5, 2]);
        rect.strokeWidth(1);
        text.padding(5);

        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(text);
        group.add(rect);
        group.addName('textBox');
        return group;
      },
      initVariableBox: function (event) {
        var text = this.initText();
        var rect = this.initRectangle();
        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(text);
        group.add(rect);
        group.addName('variableBox');
        return group;
      },
      initImage: function (imageObj, width, height) {
        var image = new Konva.Image({
          x: 0,
          y: 0,
          image: imageObj,
          width: width,
          height: height
        });
        var rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: width,
          height: height,
          fill: '',
          stroke: 'black',
          strokeWidth: 2
        });
        var group = new Konva.Group({
          x: 0,
          y: 0,
          fillEnabled: false
        });
        group.add(image);
        group.add(rect);
        group.addName('image');
        return group;
      },
      drawShape: function (event) {
        var shape = drawEnv.currentElement;
        if (shape) {
          updateCurrentCoords(event);
          // positive or negative
          var distanceX = drawEnv.currentX - drawEnv.startX;
          var distanceY = drawEnv.currentY - drawEnv.startY;

          if (shape.name === 'Line') {
            shape.group.position({x: drawEnv.startX, y: drawEnv.startY});
            var newX = (drawEnv.shifted ? 0 : distanceX);
            var newY = (drawEnv.controlled ? 0 : distanceY);
            shape.drawnShape.points([0, 0, newX, newY]);
          } else {
            shape.group.position({
              x: ((distanceX < 0) ? (drawEnv.startX + distanceX) : drawEnv.startX),
              y: ((distanceY < 0) ? (drawEnv.startY + distanceY) : drawEnv.startY)
            });
            var width = Math.abs(distanceX);
            var height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distanceY));
            [shape.outerBox, shape.textBox, shape.drawnShape].forEach( function (object) {
              if (object) {
                if (object.getClassName() === 'Ellipse') {
                  object.x(width/2);
                  object.y(height/2);
                }
                object.width(width);
                object.height(height);
              }
            });
          }

          if (shape.name === 'VariableBox') {
            drawEnv.variableLayer.add(shape.group);
          } else {
            drawEnv.imageLayer.add(shape.group);
          }
          myLabel.selectShape(shape);
          drawEnv.stage.draw();
        }
      },
      addAnchor: function (group, x, y, name) {
        var shape = group.shape;
        var stage = group.getStage();
        var layer = group.getLayer();
        var anchor = new Konva.Circle({
          x: x,
          y: y,
          stroke: '#666',
          fill: '#ddd',
          strokeWidth: 1,
          radius: 4,
          name: name,
          draggable: true,
          dragOnTop: false
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
        anchor.on('dragend', function () {
          shape.resetGroupPosition();
          shape.preventOverlap();
          group.setDraggable(true);
          layer.draw();
        });
        anchor.on('mouseover', function () {
          // add hover styling
          var layer = this.getLayer();
          var cursorName;
          if (name.indexOf('Point') > -1) {
            cursorName = 'default';
          } else {
            cursorName= (name.indexOf('top') > -1) ? 'n' : 's';
            cursorName += (name.indexOf('Left') > -1) ? 'w-resize' : 'e-resize';
          }
          document.body.style.cursor = cursorName;
          this.setStrokeWidth(2);
          layer.draw();
        });
        anchor.on('mouseout', function () {
          var layer = this.getLayer();
          document.body.style.cursor = 'default';
          this.setStrokeWidth(1);
          layer.draw();
        });
        group.add(anchor);
      },
      addAnchors: function (event) {
        if (this.name === 'Line') {
          var points = this.drawnShape.points();
          this.addAnchor(this.group, points[0], points[1], 'startPoint' );
          this.addAnchor(this.group, points[2], points[3], 'endPoint' );
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
        drawEnv.stage.draw();
      },
      resizeShape: function (activeAnchor) {
        var group = this.group;
        var anchorX = activeAnchor.getX();
        var anchorY = activeAnchor.getY();

        if (this.name === 'Line') {
          var endPoint = group.get('.endPoint')[0];
          var startPoint = group.get('.startPoint')[0];
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
          var topLeft = group.get('.topLeft')[0];
          var topRight = group.get('.topRight')[0];
          var bottomRight = group.get('.bottomRight')[0];
          var bottomLeft = group.get('.bottomLeft')[0];

          // #TODO: Keep aspect ratio of image
          if (this.resizeAllowed(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY)) {
            // shifted & controlled
            if (drawEnv.shifted || drawEnv.controlled) {
              if (activeAnchor.getName().indexOf('top') > -1) {
                anchorY = ( bottomRight.getY() - Math.abs(topRight.getX() - topLeft.getX()) );
              } else {
                anchorY = ( Math.abs(topRight.getX() - topLeft.getX()) + topLeft.getY() );
              }
              activeAnchor.setY(anchorY);
            }
            // update anchor positions
            switch (activeAnchor.getName()) {
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
            var width = topRight.getX() - topLeft.getX();
            var height = bottomLeft.getY() - topLeft.getY();
            if (width && height) {
              [this.outerBox, this.image, this.textBox, this.drawnShape].forEach( function (object) {
                var newHeight = (drawEnv.shifted || drawEnv.controlled) ? Math.abs(width) : Math.abs(height);
                if (object) {
                  var position = topLeft.position();
                  if (object.getClassName() === 'Ellipse') {
                    object.position({
                      x: (topLeft.getX() + width/2),
                      y: (topLeft.getY() + height/2),
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
            // update anchor positions
            switch (activeAnchor.getName()) {
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
      resizeAllowed: function (topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY) {
        if (
          topLeft.getX() < bottomRight.getX() &&
          topLeft.getY() < bottomRight.getY() &&
          bottomLeft.getX() < topRight.getX() &&
          bottomLeft.getY() > topRight.getY()
          ) {
          return true;
        } else {
          return false;
        }
      },
      resetGroupPosition: function () {
        // snap contents back to 0,0 after resize
        var contentX = ((this.outerBox) ? this.outerBox.x() : this.drawnShape.x());
        var contentY = ((this.outerBox) ? this.outerBox.y() : this.drawnShape.y());

        var translateables = [this.textBox, this.drawnShape, this.image];
        this.getAnchors().forEach(function (anchor) {
          translateables.push(anchor);
        });
        if ('Rect' !== this.name) {
          translateables.push(this.outerBox);
        }
        translateables.forEach( function (object) {
          if (object) {
            object.move({x: -1*contentX, y: -1*contentY});
          }
        });
        this.group.move({x: contentX, y: contentY});
      },
      savePosition: function () {
        // Right now this function is only for overlapping of variables
        if ('VariableBox' === this.name) {
          var group = this.group;
          var topLeft = group.get('.topLeft')[0];
          var topRight = group.get('.topRight')[0];
          var bottomRight = group.get('.bottomRight')[0];
          var bottomLeft = group.get('.bottomLeft')[0];

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
              bottomRight: bottomRight.position()
            }
          };
        }
      },
      resetToSavedPosition: function () {
        // Right now this function is only for overlapping of variables
        if (this.savedPosition) {
          var group = this.group;
          var topLeft = group.get('.topLeft')[0];
          var topRight = group.get('.topRight')[0];
          var bottomRight = group.get('.bottomRight')[0];
          var bottomLeft = group.get('.bottomLeft')[0];
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
      preventOverlap: function () {
        if (('VariableBox' === this.name) && overlap(this.outerBox)) {
          this.resetToSavedPosition();
          return true;
        } else {
          return false;
        }
      },
      outOfBorder: function () {
        if ('VariableBox' === this.name) {
          var pos = actualPosition(this.group);
          var height = $('#canvas_height').val();
          var width = $('#canvas_width').val();

          if (pos.x0 <= 0 || pos.y0 <= 0 || pos.x1 >= width || pos.y1 >= height) {
            this.outerBox.stroke('red');
            return true;
          } else {
            this.outerBox.stroke('black');
            return false;
          }
          drawEnv.stage.draw();
        }
      },
      saveVariableInfo: function () {
        // Variables only
        if ('VariableBox' === this.name) {
          var pos = actualPosition(this.group);
          var form = $('form.variable-info-form');
          this.savedVariableInfo = {
            variableId: this.shapeId,
            variableType: form.find('#vars').val(),
            orientation: (this.group.rotation()%360),
            position: pos,
            startX: pos.x0,
            startY: pos.y0,
            width: (pos.x1 - pos.x0),
            height: (pos.y1 - pos.y0),
            fontSizePx: this.textBox.fontSize(),
            fontSizePt: this.fontSizePt(this.textBox.fontSize()),
            fontFamily: this.textBox.fontFamily(),
            bold: ((this.textBox.fontStyle() === 'bold') ? 'Yes' : 'No'),
            italic: ((this.textBox.fontStyle() === 'italic') ? 'Yes' : 'No'),
            underline: ((this.textBox.textDecoration() === 'underline') ? 'Yes' : 'No'),
            isBarcode: form.find('#barcode_bool').val(),
            barcodeMargin: form.find('#barcode_margin').val(),
            barcodeSymbology: form.find('#barcode_symbology').val()
          };
        }
      },
      fontSizePt: function (fontSizePx) {
        var fontSize = {
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
          67: 50
        };
        return fontSize[fontSizePx];
      },
      beforeAction: function () {

      },
      afterAction: function () {

      }

    };
  };

  function overlap(rectangle) {
    var overlap = [];
    var set = [];

    var rectGroup = rectangle.findAncestor('Group');
    var rectPosition = actualPosition(rectGroup);

    drawEnv.variableLayer.getChildren().forEach(function (group) {
      var object = actualPosition(group);
      set.push(object);
    });

    if (rectangle && (set[0] !== undefined)) {
      var x0 = rectPosition.x0;
      var x1 = rectPosition.x1;
      var y0 = rectPosition.y0;
      var y1 = rectPosition.y1;

      set.forEach( function (e) {
        var ex0 = e.x0;
        var ex1 = e.x1;
        var ey0 = e.y0;
        var ey1 = e.y1;

        if (JSON.stringify(rectPosition) == JSON.stringify(e)) {
          // do nothing
        } else {
          var a = ( ( (y0 <= ey0 && ey0 <= y1) || (y0 <= ey1 && ey1 <= y1) ) &&
                    ( (x0 <= ex0 && ex0 <= x1) || (x0 <= ex1 && ex1 <= x1) )  );
          var b = ( ( (ey0 <= y0 && y0 <= ey1) || (ey0 <= y1 && y1 <= ey1) ) &&
                    ( (ex0 <= x0 && x0 <= ex1) || (ex0 <= x1 && x1 <= ex1) )  );
          var c = ( (x0 > ex0 && x1 < ex1 && y0 < ey0 && y1 > ey1) ||
                    (ex0 > x0 && ex1 < x1 && ey0 < y0 && ey1 > y1) );

          overlap.push( a || b || c );
        }
      });
    }
    return overlap.includes(true);
  }

  function actualPosition(group) {
    // Meant for variables
    var rect = getChildOfType('Rect', group);
    var theta = group.rotation()%360;
    var object;
    switch (theta) {
      case 0:
        object = {
          x0: group.x(),
          x1: group.x() + rect.width(),
          y0: group.y(),
          y1: group.y() + rect.height()
        };
        break;
      case 90:
        object = {
          x0: group.x() - rect.height(),
          x1: group.x(),
          y0: group.y(),
          y1: group.y() + rect.width()
        };
        break;
      case 180:
        object = {
          x0: group.x() - rect.width(),
          x1: group.x(),
          y0: group.y() - rect.height(),
          y1: group.y()
        };
        break;
      case 270:
        object = {
          x0: group.x(),
          x1: group.x() + rect.height(),
          y0: group.y() - rect.width(),
          y1: group.y()
        };
        break;
    }
    return object;
  }

  var Label = function Label() {
    var nextShapeId = 0;
    // #TODO: initialise load label/new label based on starting call
    return {
      initialise: function (width=700, height=500, name=null, id=null, labelJSON=null) {
        if (labelJSON) {
          this.loadFromJson(labelJSON);
        } else {
          this.id = id;
          this.name = name;
          this.shapes = [];
          this.labelWidth = width;
          this.labelHeight = height;
          this.minLabelWidth = 0;
          this.minLabelHeight = 0;

          this.stage = drawEnv.stage;
          this.stage.clear();

          doResizeCanvas(width, height);

          this.bind_stage_listeners();
        }
      },
      setCanvasMinimums: function () {
        var widthRestrictionSet = [];
        var heightRestrictionSet = [];

        drawEnv.variableLayer.getChildren().forEach(function (group) {
          var object = actualPosition(group);
          widthRestrictionSet.push(object.x1);
          heightRestrictionSet.push(object.y1);
        });

        this.minLabelWidth = (Math.max(...widthRestrictionSet) +1); // +1 for safety
        this.minLabelHeight = (Math.max(...heightRestrictionSet) +1);

        $('.resizable').resizable('option', 'minWidth', this.minLabelWidth);
        $('.resizable').resizable('option', 'minHeight', this.minLabelHeight);
      },
      bind_stage_listeners: function () {
        this.stage.on('mouseover', function (evt) {
          if (document.body.style.cursor === 'default') {
            document.body.style.cursor = 'pointer';
          }
          var shape = myLabel.getShapeByElem(evt.target);
          shape.highlightOn();
        });
        this.stage.on('mouseout', function (evt) {
          document.body.style.cursor = 'default';
          var shape = myLabel.getShapeByElem(evt.target);
          if (!shape.selected) { shape.highlightOff(); }
        });
        this.stage.on('click', function (evt) {
          var shape = myLabel.getShapeByElem(evt.target);
          myLabel.selectShape(shape);
        });
      },
      loadFromJson: function (label_json) {
        var newLabel = JSON.parse(label_json);
        this.name = newLabel.name;
        this.shapes = [];
        this.labelWidth = newLabel.labelWidth;
        this.labelHeight = newLabel.labelHeight;
        this.minLabelWidth = 0;
        this.minLabelHeight = 0;

        myLabel = this;

        this.stage = new Konva.Stage({
          container: 'paper',
          width: this.labelWidth,
          height: this.labelHeight
        });
        this.imageLayer = new Konva.Layer({fill: 'white'});
        this.variableLayer = new Konva.Layer();
        this.currentElement = new Konva.Node();

        this.imageLayer.draw();
        this.variableLayer.draw();
        this.stage.add(this.imageLayer, this.variableLayer);

        drawEnv.imageLayer = this.imageLayer;
        drawEnv.variableLayer = this.variableLayer;
        drawEnv.stage = this.stage;

        doResizeCanvas(this.labelWidth, this.labelHeight);

        this.bind_stage_listeners();

        var newShapes = [];
        newLabel.shapes.forEach(function (shape) {
          var newShape = new Shape();
          var newGroup = Konva.Node.create(shape.group);

          if (shape.name === 'VariableBox') {
            myLabel.variableLayer.add(newGroup);
          } else {
            myLabel.imageLayer.add(newGroup);
          }

          newShape.reinitialise(newGroup, shape);
          newShapes.push(newShape);
        });

        this.shapes = newShapes;
        this.selectShape(this.shapes[(this.shapes.length - 1)]);
        this.stage.draw();
      },
      newShape: function (type, imageObj=null, width=null, height=null) {
        var myShape = new Shape();
        myShape.shapeId = this.nextId();
        myShape.initialise(type, imageObj, width, height);
        this.shapes.push(myShape);
        return myShape;
      },
      nextId: function () {
        nextShapeId += 1;
        return nextShapeId;
      },
      selectedShape: function () {
        return this.shapes.find(function (shape) {
          return shape.selected === true;
        });
      },
      getShapeById: function (id) {
        return this.shapes.find(function (shape) {
          return shape.shapeId === id;
        });
      },
      selectShape: function (shapeToSelect) {
        this.shapes.forEach(function (shape) {
          if (shape === shapeToSelect) {
            shape.select();
          } else{
            shape.deselect();
          }
        });
        drawEnv.stage.draw();
      },
      removeShape: function (shapeToRemove) {
        this.shapes.splice(this.shapes.indexOf(shapeToRemove),1);
        drawEnv.stage.draw();
      },
      getShapeByElem: function (elem) {
        var group = elem.findAncestor('Group');
        return group.shape;
      },
      exportToJSON: function () {
        var labelJSON;
        labelJSON = {
          label: JSON.stringify(this),
          XMLString: this.generateXMLFile(),
          imageString: this.toImageDataURL()
        };
        console.log(labelJSON);
        return labelJSON;
      },
      toImageDataURL: function () {
        var dataURL;
        drawEnv.stage.removeChildren();
        drawEnv.stage.add(drawEnv.imageLayer);
        dataURL = drawEnv.stage.toDataURL('image/png');
        drawEnv.stage.add(drawEnv.variableLayer);
        return dataURL;
      },
      generateXMLFile: function () {
        var XMLString = "<?xml version='1.0'?><variables>";

        drawEnv.variableLayer.getChildren(function (variableGrouping) {
          var shape = variableGrouping.shape;
          var info = shape.savedVariableInfo;

          var variable_string = '<variable><id>' + info.variableId +
          '</id><variable_type>' + info.variableType +
          '</variable_type><orientation>' + info.orientation +
          '</orientation><startx>' + info.startX +
          '</startx><starty>' + info.startY +
          '</starty><width>' + info.width +
          '</width><height>' + info.height +
          '</height><fontsize><px>' + info.fontSizePx +
          '</px><pt>' + info.fontSizePt +
          '</pt></fontsize><fontfamily>' + info.fontFamily +
          '</fontfamily><bold>' + info.bold +
          '</bold><italic>' + info.italic +
          '</italic><underline>' + info.underline +
          '</underline><isbarcode>' + info.isBarcode +
          '</isbarcode><barcode_margin_px>' + info.barcodeMargin +
          '</barcode_margin_px><barcode_symbology>' + info.barcodeSymbology +
          '</barcode_symbology></variable>';

          XMLString += variable_string;
        });

        XMLString += '</variables>';
        return XMLString;
      }
    };
  };



  function ready(fn) {
    if (document.readyState != 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    // here we can add code for when we have a designed label to load
    // do onready stuff



    // ajax call
    myLabel = new Label();
    myLabel.initialise(500, 300, 'test');


  });


})();

// // $(document).ready( function () {
//   // here we can add code for when we have a designed label to load
// // });


// // module.js
// export function hello() {
//   return 'Hello';
// }

// // main.js
// import {hello} from 'module'; // or './module'
// let val = hello(); // val is 'Hello';
