(function() {
  'use strict';

  var drawEnv = {
    startX: 0, startY: 0,
    currentX: 0, currentY: 0,
    dragOffsetX: 0, dragOffsetY: 0,
    shifted: false, controlled: false,
    initWidth: 700, initHeight: 500,
    divPaper: $('#paper')[0],
    offset: findPos($('#paper')[0]),
    drawing: 'none',
    stage: new Konva.Stage({
      container: 'paper',
      width: 700,
      height: 500
    }),
    imageLayer: new Konva.Layer({fill: 'white'}),
    variableLayer: new Konva.Layer(),
    variableGroup: new Konva.Group(),
    currentElement: new Konva.Node(),
  }

  // #################### CANVAS FUNCTIONS ####################################################
  drawEnv.imageLayer.draw();
  drawEnv.variableLayer.draw();
  drawEnv.stage.add(drawEnv.imageLayer, drawEnv.variableLayer);

  drawEnv.divPaper.width = drawEnv.initWidth;
  drawEnv.divPaper.height = drawEnv.initHeight;

  $( ".resizable" ).resizable({
    resize: function( event, ui ) {
      var height = $(".resizable").height();
      var width = $(".resizable").width();

      doResizeCanvas(width, height);
    }
  });

  // update offset on scroll
  $(document).on('mousewheel', function(event){drawEnv.offset = findPos(drawEnv.divPaper);});
  $(document).on('keyup keydown', function(event){drawEnv.shifted = event.shiftKey;});
  $(document).on('keyup keydown', function(event){drawEnv.controlled = event.ctrlKey;});
  $(document).on('keydown', function(event){
    var index = [46, 37, 39, 38, 40].indexOf(event.keyCode);
    if (index > -1){
      var shape = myLabel.selectedShape();
      if (shape){
        if (index === 0){
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

  $('input#canvas_width').on('change', function(){
    var height = $(".resizable").height();
    var original_width = $(".resizable").width();
    var width = parseInt($(this).val());
    $(".resizable").width(width);
    doResizeCanvas( width, height, original_width );
  });

  $('input#canvas_height').on('change', function(){
    var height = parseInt($(this).val());
    var original_height = $(".resizable").height();
    var width = $(".resizable").width();
    $(".resizable").height(height);
    doResizeCanvas( width, height, original_height );
  });

  drawEnv.divPaper.onmousedown = function(event) {
    updateStartCoords(event);
    if (drawEnv.drawing !== 'none'){
      var myShape = myLabel.newShape(drawEnv.drawing);
    }
  };

  drawEnv.divPaper.onmouseup = function(event) {
    drawEnv.divPaper.onmousemove = null;
    if (drawEnv.drawing !== 'none'){
      myLabel.selectedShape().addAnchors();
      $('button[name=' + drawEnv.drawing + ']').removeClass('selected');
      toggleOptions();
    }
    resetToolbar();
  };

  function doResizeCanvas(width, height, original_width=null, original_height=null){
      $('input#canvas_width').val(width);
      $('input#canvas_height').val(height);
    // if (variables are cut off){
      // If (original_width !== null){
        // stage.width(original_width);
      // }
      // If (original_height !== null){
        // stage.height(original_height);
      // }
    // } else {
      drawEnv.stage.width(width);
      drawEnv.stage.height(height);
    // }
    // if allowed #TODO - should not be allowed if variables are going to be cut off
  }

  function validVariables(){
    // if variables cut off false
    // else true
    return true;
  }

  function getChildOfType(type, group){
    var child = group.getChildren(function(node){
      return node.getClassName() === type;
    });
    return child[0];
  }
  // ##########################################################################################

  // #################### HELPER FUNCTIONS ####################################################
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
  function toggleOptions(){
    // #TODO: this should toggle the display of options based on the currently selected element
    // // #TODO: Make the whole block of options toggle accordingly
    // if (drawEnv.drawing === 'Text'){
    //   $("input[name='textbox']").trigger('focus');
    //   $("input[name='textbox']").show();
    //   $("input[name='textdemo']").hide();
    // }
    // if (drawEnv.drawing === 'Group'){
    //   $("input[name='textdemo']").trigger('focus');
    //   $("input[name='textdemo']").show();
    //   $("input[name='textbox']").hide();
    // }
  }

  $("input[name='textbox']").on('input', function(event){
    myLabel.selectedShape().textBox.text($(this).val());
    drawEnv.stage.draw();
  });

  $('#font-size').on('change', function(){
    myLabel.selectedShape().textBox.fontSize($(this).val());
    drawEnv.stage.draw();
  });

  $('#stroke-width').on('change', function(){
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    drawEnv.stage.draw();
  });

  $('#font-family').on('change', function(){
    myLabel.selectedShape().textBox.fontFamily($(this).val());
    drawEnv.stage.draw();
  });

  $('button.underline').on('click', function(){
    if ($(this).hasClass('selected')){
      $(this).removeClass('selected');
      myLabel.selectedShape().textBox.textDecoration('');
    } else {
      $(this).addClass('selected');
      myLabel.selectedShape().textBox.textDecoration('underline');
    }
    drawEnv.stage.draw();
  });

  // $('button.bold').on('click', function(){
    // Stroke width does not work here
  //   if ($(this).hasClass('selected')){
  //     $(this).removeClass('selected');
  //     myLabel.selectedShape().textBox.strokeWidth(1);
  //   } else {
  //     $(this).addClass('selected');
  //     myLabel.selectedShape().textBox.strokeWidth(2);
  //   }
  //   drawEnv.stage.draw();
  // });

  $('button.italic, button.bold').on('click', function(){
    if ($(this).hasClass('selected')){
      $(this).removeClass('selected');
      myLabel.selectedShape().textBox.fontStyle('normal');
    } else {
      $('button.italic').removeClass('selected');
      $('button.bold').removeClass('selected');
      $(this).addClass('selected');
      myLabel.selectedShape().textBox.fontStyle($(this).attr('name'));
    }
    drawEnv.stage.draw();
  });

  $('button[name="resize"]').click(function(){
    // when selected you will be shown which objects can be resized
  });
  $('button[name="remove"]').click(function(){
    myLabel.selectedShape().remove();
    // when selected you will be shown which objects can be removed/deleted
  });

  $('button.rotate').click(function(){
    myLabel.selectedShape().rotate();
  });

  $( 'button[name="TextBox"], \
      button[name="Line"], \
      button[name="Rect"], \
      button[name="Ellipse"], \
      button[name="VariableBox"]').click(function(){
        drawEnv.drawing = ((activateTool(this) === true) ? $(this).attr('name') : 'none');
  });

  // #TODO: split out helper functions via namespacing
  function activateTool(tool_handle){
    var activate;
    if ($(tool_handle).hasClass('selected')){
      $(tool_handle).removeClass('selected');
      // #TODO: This should not be in here - this needs to be a reset function
       // rather than a duplicate click(see resetToolbar() )
      $('button[name="pointer"]').trigger('click');
      activate=false;
    } else {
      // select current
      $(tool_handle).addClass('selected');
      activate=true;
    }
    return activate;
  }

  function resetToolbar(){
    drawEnv.drawing='none';
    // #TODO
    // figure out what resetting the toolbar actually means
  }

  $('button[name="pointer"]').click(function(){
    // #TODO clean this up
    resetToolbar()
    // While the pointer is selected all elements should be selectable
    // myLabel.selectedShape().deselect();

    // mouse should be able to move and click and select freely now
    drawEnv.currentElement = new Konva.Node();
    $('input[name=textbox]').val('');
    // $(this).addClass('selected');
    // Make all defaults false

    // deselect all relevant buttons
    $('button[name="Line"').removeClass('selected');
    $('button[name="Rect"').removeClass('selected');
    $('button[name="Ellipse"').removeClass('selected');
    $('button[name="TextBox"').removeClass('selected');
    $('button[name="VariableBox"').removeClass('selected');
  });
  // ##########################################################################################

  // ############## UPLOAD IMAGE SHAPES #######################################################
  var dialog = $( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Upload new image": addImage,
      Cancel: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
    }
  });

  var form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addImage();
  });
  $('button[name="image"]').click(function(){
    dialog.dialog( "open" );
  });

  dialog.find('input:file').change(function(){
    if (this.files.length > 0){
      dialog.find('notice').addClass('hidden');
    } else {
      dialog.find('notice').removeClass('hidden');
    }
  });

  function addImage(){
    var files = dialog.find('input:file')[0].files;
    if (files.length > 0){
      var file = files[0];
      if (file){
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
          var img = new Image();
          img.src = event.target.result;

          img.onload = function(){
            var myShape = myLabel.newShape('Image', img, this.width, this.height);
            dialog.dialog( "close" );
            dialog.find('notice').addClass('hidden');
          }
        }
      }

    } else {
      dialog.find('notice').removeClass('hidden');
    }
  }
  // ##########################################################################################

  // ############## SAVE & EXPORT LABEL #######################################################
  function export_to_json(){
    var label_json;
    return label_json = {
      konva_label: drawEnv.stage.toJSON(),
      xml_string: generate_xml_file(),
      image_string: toImageDataURL()
    }
  }

  function toImageDataURL(){
    var dataURL;
    drawEnv.stage.removeChildren();
    drawEnv.stage.add(drawEnv.imageLayer);
    dataURL = drawEnv.stage.toDataURL('image/png');
    drawEnv.stage.add(drawEnv.variableLayer);
    return dataURL;
  }

  function generate_xml_file(){
    var xml_string = "<?xml version='1.0'?><variables>";

    drawEnv.variableGroup.getChildren(function(variable_grouping){
      var text = getChildOfType('Text', variable_grouping);
      var box = getChildOfType('Rect', variable_grouping);

      var bold = ((text.fontStyle === 'bold') ? 'yes' : 'no');
      var italic = ((text.fontStyle === 'italic') ? 'yes' : 'no');
      var underline = ((text.textDecoration === 'underline') ? 'yes' : 'no');

      var variable_string = "<variable><id>" + 'variable_id' +
      "</id><variable_type>" + 'variable_type' +
      "</variable_type><orientation>" + text.rotation() +
      "</orientation><startx>" + box.x() +
      "</startx><starty>" + box.y() +
      "</starty><width>" + box.width() +
      "</width><height>" + box.height() +
      "</height><fontsize><px>" + text.fontSize() +
      "</px><pt>" + 'test' +
      "</pt></fontsize><fontfamily>" + text.fontFamily() +
      "</fontfamily><bold>" + bold +
      "</bold><italic>" + italic +
      "</italic><underline>" + underline +
      "</underline><isbarcode>" + 'isbarcode' +
      "</isbarcode><barcode_margin_px>" + 'barcode_margin' +
      "</barcode_margin_px><barcode_symbology>" + 'barcode_symbology' +
      "</barcode_symbology></variable>"

      xml_string += variable_string;
    });

    xml_string += '</variables>';
    return xml_string;
  }

  $('.btn-download-image').click(function(){
    event.preventDefault();
    var href = toImageDataURL();
    $('#btn-download-image').attr('href', href);
    $('#btn-download-image:first')[0].click();
  });

  $('.btn-save-label').on('click', function(){
    $.ajax({
      url: "<%= @json_save_path %>",
      dataType: 'json',
      type: 'POST',
      data: export_to_json(),
      success: function(data){
        alert('Your Label has been saved successfully');
      },
      error: function(data){
        alert('Sorry, but something went wrong');
      }
    });
  });

  $('.btn-save-label').on('click', function(){
    $.ajax({
      url: "<%= @json_save_path %>",
      dataType: 'json',
      type: 'POST',
      data: export_to_json(),
      success: function(data){
        alert('Your Label has been saved successfully');
      },
      error: function(data){
        alert('Sorry, but something went wrong');
      }
    });
  });
  // ###############################################################################################


  var Shape = function Shape(){
    var name, //shapeId
      group,
      outerBox,
      image,
      drawnShape,
      textBox;
    // var attr = {
    //   type: null,
    //   drawn: false
    // }
    // From Konva objects
    // TEXTBOX: text, fontSize, fontFamily, textDecoration, fontStyle,
    // PRIMARY: draggable, rotation, addName,
    // DRAWN: points, x, y, width, height,

    // this.type = function() {
    //   return attr.type;
    // }
    return{

      initialise: function(name, imageObj, width, height){
        this.name = name

        this.group = this[('init' + name)](imageObj, width, height);
        this.group.shape = this;
        this.outerBox = ((name === 'Line') ? undefined : getChildOfType('Rect', this.group));
        // this.shapeId = in a list
        drawEnv.currentElement = this;

        if ('Image' === name){
          this.image = getChildOfType(name, this.group);
          this.addAnchors();
          drawEnv.imageLayer.add(this.group);
          myLabel.selectShape(this);
          drawEnv.stage.draw();
        } else {
          if ('VariableBox' === name || 'TextBox' === name){
            this.textBox = getChildOfType('Text', this.group);
          } else {
            this.drawnShape = getChildOfType(name, this.group);
          }
          drawEnv.divPaper.onmousemove = this.drawShape;
        }
      },

      reinitialise: function(konva_shape){
        // #TODO: This will have to be done for each of the image layer shapes and once for every variable
        // this.type = konva_shape.getClassName()
        // this.group = konva_shape;
        // if (this.type === 'Group'){
        //   this.drawnShape = getRect(konva_shape);
        //   this.textBox = getTextBox(konva_shape);
        // } else{
        //   this.drawnShape = konva_shape;
        // }
      },

      select: function(){
        this.selected = true;
        this.group.moveToTop();
        this.group.draggable(true);
        if (this.name !== 'Line' && this.outerBox && this.name !== 'Rect'){
          this.outerBox.show();
        }
        this.highlightOn();
        this.showAnchors();
        // TODO: Add listeners for:
        // left arrow, right arrow, move 1px
        // shifted || controlled moves 10px
        // delete
      },
      deselect: function(){
        this.selected = false;
        this.group.draggable(false);
        if (this.name !== 'Rect' && this.name !== 'Line' && this.name !== 'VariableBox'){
          this.outerBox.hide();
        }
        this.highlightOff();
        this.hideAnchors();
      },
      showAnchors: function(){
        this.group.getChildren(function(node){
          if (node.getClassName() === 'Circle'){
            node.show();
          }
        });
      },
      hideAnchors: function(){
        this.group.getChildren(function(node){
          if (node.getClassName() === 'Circle'){
            node.hide();
          }
        });
      },
      selected: function(){
        this.selected;
      },
      remove: function(){
        [this.outerBox, this.textBox, this.drawnShape, this.group].forEach( function(object){
          if (object){ object.destroy(); }
        });
        myLabel.removeShape(this);
      },

      rotate: function(){
        this.group.rotate(90);
        drawEnv.stage.draw();
      },

      highlightOn: function(){
        if (this.name === 'Rect' || this.name === 'Line'){
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
      highlightOff: function(){
        if (this.name === 'Rect' || this.name === 'Line'){
          this.drawnShape.shadowBlur(0);
        } else {
          // this doesn't work?
          // this.outerBox.shadowBlur(0);
          if (this.name !== 'VariableBox'){
            this.outerBox.hide();
          }
        }
        drawEnv.stage.draw();
      },

      initLine: function(event) {
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
      initEllipse: function(event) {
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
      initRect: function(event) {
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
      initRectangle: function(event) {
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
      initText: function(event) {
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
      initTextBox: function(event) {
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
      initVariableBox: function(event) {
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
      initImage: function(imageObj, width, height) {
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

      drawShape: function(event) {
        var shape = drawEnv.currentElement;
        if (shape){
          updateCurrentCoords(event);
          // positive or negative
          var distanceX = drawEnv.currentX - drawEnv.startX;
          var distanceY = drawEnv.currentY - drawEnv.startY;

          if (shape.name === 'Line'){
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
            [shape.outerBox, shape.textBox, shape.drawnShape].forEach( function(object){
              if (object){
                if (object.getClassName() === 'Ellipse'){
                  object.x(width/2);
                  object.y(height/2);
                }
                object.width(width);
                object.height(height);
              }
            });
          }

          if (shape.name === 'VariableBox'){
            drawEnv.variableLayer.add(shape.group);
          } else {
            drawEnv.imageLayer.add(shape.group);
          }
          myLabel.selectShape(shape);
          drawEnv.stage.draw();
        }
      },
      addAnchors: function(event){
        if (this.name === 'Line'){
          var points = this.drawnShape.points();
          this.addAnchor(this.group, points[0], points[1], 'startPoint' );
          this.addAnchor(this.group, points[2], points[3], 'endPoint' );
        } else {
          this.addAnchor(this.group, this.outerBox.x(), this.outerBox.y(), 'topLeft');
          this.addAnchor(this.group, (this.outerBox.x() + this.outerBox.width()), this.outerBox.y(), 'topRight');
          this.addAnchor(this.group, (this.outerBox.x() + this.outerBox.width()), (this.outerBox.y() + this.outerBox.height()), 'bottomRight');
          this.addAnchor(this.group, this.outerBox.x(), (this.outerBox.y() + this.outerBox.height()), 'bottomLeft');
        }
        drawEnv.stage.draw()
      },
      updateShape: function(activeAnchor) {
        var group = this.group;
        var anchorX = activeAnchor.getX();
        var anchorY = activeAnchor.getY();

        if (this.name === 'Line'){
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
            if (drawEnv.shifted || drawEnv.controlled){
              if (activeAnchor.getName().indexOf('top') > -1){
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
            if (width && height){
              [this.outerBox, this.image, this.textBox, this.drawnShape].forEach( function(object){
                var newHeight = (drawEnv.shifted || drawEnv.controlled) ? Math.abs(width) : Math.abs(height)
                if (object){
                  var position = topLeft.position();
                  if (object.getClassName() === 'Ellipse'){
                    object.position({
                      x: (topLeft.getX() + width/2),
                      y: (topLeft.getY() + height/2),
                    })
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
      resizeAllowed: function(topLeft, topRight, bottomLeft, bottomRight, anchorX, anchorY){
        if (
          topLeft.getX() < bottomRight.getX() &&
          topLeft.getY() < bottomRight.getY() &&
          bottomLeft.getX() < topRight.getX() &&
          bottomLeft.getY() > topRight.getY()
          ){
          return true;
        } else {
          return false;
        }
      },
      addAnchor: function(group, x, y, name) {
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
        anchor.on('dragmove', function() {
          var shape = this.findAncestor('Group').shape;
          shape.updateShape(this);
          layer.draw();
        });
        anchor.on('mousedown touchstart', function() {
          group.setDraggable(false);
          this.moveToTop();
        });
        anchor.on('dragend', function() {
          group.setDraggable(true);
          layer.draw();
        });
        // add hover styling
        anchor.on('mouseover', function() {
          var layer = this.getLayer();
          var cursorName;
          if (name.indexOf('Point') > -1){
            cursorName = 'default';
          } else {
            cursorName= (name.indexOf('top') > -1) ? 'n' : 's';
            cursorName += (name.indexOf('Left') > -1) ? 'w-resize' : 'e-resize';
          }
          document.body.style.cursor = cursorName;
          this.setStrokeWidth(2);
          layer.draw();
        });
        anchor.on('mouseout', function() {
          var layer = this.getLayer();
          document.body.style.cursor = 'default';
          this.setStrokeWidth(1);
          layer.draw();
        });
        group.add(anchor);
      }
    }
  };

  var Label = function Label(){
    // // #TODO: initialise load label/new label based on starting call
    // function label(name){
    //   this.name = name;
    //   this.shapes = [];

    //   this.initialise_from_json = function(konva_json){
    //   // I need to be able to initialise a label Konva is capable of reinitialising itself but the shapes wont be
    //   // reinitialised.
    //     var stage = Konva.Node.create(json, 'container');
    //     // find image layer
    //     // find variable layer
    //   }
    // }
    return {
      initialise: function(width=700, height=500, name=null){
        this.name = name;
        this.shapes = [];

        drawEnv.stage.clear();
        doResizeCanvas(width, height);

        this.bind_stage_listeners();
      },
      bind_stage_listeners: function(){
        drawEnv.stage.on('mouseover', function(evt) {
          if (document.body.style.cursor === 'default'){
            document.body.style.cursor = 'pointer';
          }
          var shape = myLabel.getShapeByElem(evt.target);
          shape.highlightOn();
        });
        drawEnv.stage.on('mouseout', function(evt) {
          document.body.style.cursor = 'default';
          var shape = myLabel.getShapeByElem(evt.target);
          if (!shape.selected) { shape.highlightOff(); }
        });
        drawEnv.stage.on('click', function(evt) {
          var shape = myLabel.getShapeByElem(evt.target);
          myLabel.selectShape(shape);
        });
      },

      init_from_json: function(konva_json){
      // I need to be able to initialise a label Konva is capable of reinitialising itself but the shapes wont be
      // reinitialised.
        this.stage = Konva.Node.create(json, 'container');
        // find image layer
        // find variable layer
      },

      newShape: function(type, imageObj=null, width=null, height=null){
        var myShape = new Shape();
        myShape.initialise(type, imageObj, width, height);
        this.shapes.push(myShape);
        return myShape;
      },
      selectedShape: function(){
        return this.shapes.find(function(shape){
          return shape.selected === true;
        });
      },
      // getShapeById: function(id){
      //   return this.shapes.find(function(shape){
      //     return shape.shapeId === id;
      //   });
      // },
      selectShape: function(shapeToSelect){
        this.shapes.forEach(function(shape){
          if (shape === shapeToSelect){
            shape.select();
          } else{
            shape.deselect();
          }
        });
        drawEnv.stage.draw();
      },
      removeShape: function(shapeToRemove){
        this.shapes.splice(this.shapes.indexOf(shapeToRemove),1);
        drawEnv.stage.draw();
      },
      getShapeByElem: function(elem){
        var group = elem.findAncestor('Group');
        return group.shape;
      }
    }
  };

  var myLabel = new Label();


  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    // here we can add code for when we have a designed label to load
    // do onready stuff



    // ajax call
    myLabel.initialise(500, 300, 'test');


  })


})();

// // $(document).ready( function() {
//   // here we can add code for when we have a designed label to load
// // });


// #BIGTODO:
//  Overlapping

// getIntersection(pos, selector)
// var shape = layer.getIntersection({x: 50, y: 50});
// // or if you interested in shape parent:
// var group = layer.getIntersection({x: 50, y: 50}, 'Group');


  // OLD STUFF //

  // img.onload = function() {
  //   paper.image(img.src, 0, 0, newWidth, newHeight);
  // };

  // // This needs to be split up with better events
  // divPaper.onmousedown = function(event) {
  //   rect = null;
  //   dragElement = null;
  //   var mouseCoords = getCoords(event);
  //   // start of mouseclick relative to paper
  //   startX = (mouseCoords.x - offset[0]);
  //   startY = (mouseCoords.y - offset[1]);

  //   var element = paper.getElementByPoint( event.clientX, event.clientY );
  //   if ( element !== null && element[0].nodeName.toLowerCase() === 'rect' ) {
  //     if( event.button == 2 ) {
  //       alert('Right mouse button!');
  //       return false;
  //     } else {
  //       dragElement = element;
  //       setPositionDefaults(dragElement);

  //       var resize = ((startX >= (dragElement.bottomRightX - 10)) && (startY >= (dragElement.bottomRightY - 10)));
  //       if (resize) {
  //         document.onmousemove = doResize;
  //       } else {
  //         document.onmousemove = doDrag;
  //       }
  //     }
  //   } else {
  //     rect = paper.rect(startX, startY, 0, 0);
  //     document.onmousemove = doDraw;
  //   }
  // };

  // It seems this following line isn't really necessary
  // document.oncontextmenu = function() {return false;};

  // document.onmouseup = function(event) {
  //   if (rect) {
  //     // var valid_rectangle = valid_rectangle(rect, event)
  //     var mouseCoords = getCoords(event);
  //     startX = mouseCoords.x - offset[0];
  //     startY = mouseCoords.y - offset[1];
  //     if ( validElement(rect) ) {
  //       $('.print_variable_list').append('<li data-id=' + rect.id + '><a class="edit" href="#">Click to select variable type</a><span class="remove pull-right"><a href="#">X</a></span></li>');
  //       set.push(rect);
  //       setDefaultOptions(rect);
  //       rect = null;
  //     } else {
  //       rect.remove();
  //     }
  //   }
  //   if (dragElement && overlap(dragElement)) {
  //     if (dragElement.originalX !== undefined && dragElement.originalY !== undefined) {
  //       // This is for resizing and dragging
  //       dragElement.attr({'x': dragElement.originalX, 'y': dragElement.originalY});
  //       dragElement.attr({'width': dragElement.originalWidth, 'height': dragElement.originalHeight});
  //     }
  //     dragElement = null;
  //   }
  //   document.onmousemove = null;
  // };



  // $('button.remove').click(function() {
  //   if (confirm("Are you sure you want to delete this variable and all it's options")){
  //     var remove_id = $('form input[name="variable_id"]').val();
  //     var removeable = paper.getById(remove_id);
  //     set.exclude(removeable);
  //     removeable.remove();
  //     $('li[data-id="'+ remove_id +'"]').remove();
  //     $('form').hide();
  //     clear_form();
  //   }
  // });

  // $('a.edit').click(function(event) {
  //   var rect_id = $(this).closest('li').data('id');
  //   var rectangle = paper.getById( rect_id );
  //   set.forEach( function(e) {
  //     e.attr('class', 'resize-drag');
  //   });
  //   rectangle.attr('class', 'resize-drag selected');

  //   popup_form(rectangle);
  // });

  // $('span.remove a').click(function(event) {
  //   var remove_id = $(this).closest('li').data('id');
  //   var removeable = paper.getById( remove_id );
  //   set.forEach( function(e) {
  //     e.attr('class', 'resize-drag');
  //   });
  //   removeable.attr('class', 'resize-drag selected');
  //   popup_form(removeable);

  //   if (confirm("Are you sure you want to delete this variable and all it's options")){
  //     set.exclude(removeable);
  //     removeable.remove();
  //     $(this).closest('li').remove();
  //     if ($('form input[name="variable_id"]').val() === remove_id) {
  //       $('form').hide();
  //       clear_form();
  //     }
  //   };
  // });

  // $('button.font-options').click(function(event) {
  //   var rect_id = $(this).closest('form').find('input[name="variable_id"]').val();
  //   var rectangle = paper.getById( rect_id );
  //   var name = $(this).attr('name')
  //   if ($(this).hasClass('active')) {
  //     switch(name) {
  //       case 'bold':
  //         rectangle.bolded = false;
  //         break;
  //       case 'italic':
  //         rectangle.italic = false;
  //         break;
  //       case 'underline':
  //         rectangle.underlined = false;
  //         break;
  //     }
  //     $(this).removeClass('active');
  //   } else {
  //     switch(name) {
  //       case 'bold':
  //         rectangle.bolded = true;
  //         break;
  //       case 'italic':
  //         rectangle.italic = true;
  //         break;
  //       case 'underline':
  //         rectangle.underlined = true;
  //         break;
  //     }
  //     $(this).addClass('active');
  //   }
  // });

  // $(document).on('change', 'select#orientation, select#font-size, select#font-family, select#vars', function(event) {
  //   var rect_id = $(this).closest('form').find('input[name="variable_id"]').val();
  //   var rectangle = paper.getById( rect_id );
  //   var select_type = $(this).attr('id');
  //   var new_value = $(this).val();
  //   switch(select_type){
  //     case 'orientation':
  //       rectangle.orientation = new_value;
  //       break;
  //     case 'font-size':
  //       rectangle.font_size = new_value;
  //       break;
  //     case 'font-family':
  //       rectangle.font_family = new_value;
  //       break;
  //     case 'vars':
  //       $('li[data-id="'+ rect_id +'"] a.edit').html(new_value);
  //       rectangle.variable_type = new_value;
  //       break;
  //   }
  // });

  // // Draw the shape based on the current coordinates and position at onmousedown
  // function doDraw(event) {
  //   if (rect) {
  //     var mousePos = getCoords(event);
  //     var currentX = mousePos.x - offset[0];
  //     var currentY = mousePos.y - offset[1];
  //     var width = currentX - startX;
  //     var height = currentY - startY;

  //     rect.attr({'x': ((width < 0) ? currentX : startX), 'width': Math.abs(width)});
  //     rect.attr({'y': ((height < 0) ? currentY : startY), 'height': Math.abs(height)});
  //   }
  // }

  // function doResize(event) {
  //   if (dragElement) {
  //     var mousePos = getCoords(event);
  //     var currentX = mousePos.x - offset[0];
  //     var currentY = mousePos.y - offset[1];
  //     var width = dragElement.originalWidth + currentX - startX;
  //     var height = dragElement.originalHeight + currentY - startY;

  //     var maxWidth = (newWidth - dragElement.attr('x'));
  //     var maxHeight = (newHeight - dragElement.attr('y'));

  //     dragElement.attr( { 'width': Math.abs(Math.min(width, maxWidth)) } );
  //     dragElement.attr( { 'height': Math.abs(Math.min(height, maxHeight)) } );
  //   }
  // }

  // // Drag the shape based on the current coordinates and position at onmousedown
  // function doDrag(event) {
  //   if (dragElement) {
  //     var mousePos = getCoords(event);
  //     // current dragging position
  //     var currentX = mousePos.x - offset[0];
  //     var currentY = mousePos.y - offset[1];

  //     // calculate in the dragoffset
  //     var finalX = 0, finalY = 0;
  //     finalX = currentX - dragOffsetX;
  //     finalY = currentY + dragOffsetY;

  //     // readjust values to restrict to parent
  //     var height = dragElement.attr('height'),
  //         width = dragElement.attr('width');
  //     finalX = ( (finalX < 0) ? 0 : ( (finalX > (newWidth - width))   ? (newWidth - width)   : finalX ) );
  //     finalY = ( (finalY < 0) ? 0 : ( (finalY > (newHeight - height)) ? (newHeight - height) : finalY ) );

  //     dragElement.attr({'x': finalX, 'y': finalY});
  //   }
  // }

  // function overlap(rectangle) {
  //   var overlap = [];

  //   if (rectangle && (set[0] !== undefined)) {
  //     var x0 = parseInt(rectangle.attr('x'));
  //     var x1 = x0 + parseInt(rectangle.attr('width'));
  //     var y0 = parseInt(rectangle.attr('y'));
  //     var y1 = y0 + parseInt(rectangle.attr('height'));

  //     set.forEach( function(e) {
  //       if (e[0].nodeName === 'rect') {
  //         var ex0 = parseInt(e.attr('x'));
  //         var ex1 = ex0 + parseInt(e.attr('width'));
  //         var ey0 = parseInt(e.attr('y'));
  //         var ey1 = ey0 + parseInt(e.attr('height'));

  //         if (rectangle === e){
  //           // do nothing
  //         } else {
  //           var a = ( ( (y0 <= ey0 && ey0 <= y1) || (y0 <= ey1 && ey1 <= y1) ) && ( (x0 <= ex0 && ex0 <= x1) || (x0 <= ex1 && ex1 <= x1) )  );
  //           var b = ( ( (ey0 <= y0 && y0 <= ey1) || (ey0 <= y1 && y1 <= ey1) ) && ( (ex0 <= x0 && x0 <= ex1) || (ex0 <= x1 && x1 <= ex1) )  );

  //           overlap.push( a || b );
  //         }
  //       }
  //     });
  //   }
  //   return overlap.includes(true);
  // }

  // function popup_form(rectangle) {
  //   // rect_id
  //   $('form input[name="variable_id"]').val(rectangle.id);
  //   // variable_type
  //   if (rectangle.variable_type !== null){
  //     $('select#vars').val(rectangle.variable_type).change();
  //   } else {
  //     $('select#vars').val('Please select');
  //     // set default variable type here
  //     // $('select#vars').val(rectangle.variable_type);
  //   }
  //   // orientation
  //   if (rectangle.orientation !== null){
  //     $('select#orientation').val(rectangle.orientation).change();
  //   } else {
  //     $('select#orientation').val('horizontal').change();
  //   }
  //   // font_family
  //   $('select#font-family').val(rectangle.font_family).change();
  //   // font_size
  //   $('select#font-size').val(rectangle.font_size).change();
  //   if (rectangle.bolded === true){
  //     $('button[name="bold"]').addClass('active');
  //   }
  //   if (rectangle.underlined === true){
  //     $('button[name="underline"]').addClass('active');
  //   }
  //   if (rectangle.italic === true){
  //     $('button[name="italic"]').addClass('active');
  //   }

  //   $('form').show();
  // }

  // function clear_form() {
  //   // remove active class from all buttons
  //   $('button').removeClass('active');
  //   // deselect selects
  //   $("form option:selected").removeAttr("selected");
  // }

  // function setPositionDefaults(elem) {
  //   // current XY coordinates
  //   var rectX = elem.attr('x');
  //   var rectY = elem.attr('y');
  //   // distance from XY to click coordinates
  //   dragOffsetX = parseInt(startX) - parseInt(rectX);
  //   dragOffsetY = parseInt(rectY) - parseInt(startY);
  //   // save original values
  //   elem.originalX = rectX;
  //   elem.originalY = rectY;

  //   elem.originalWidth = parseInt(elem.attr('width'));
  //   elem.originalHeight = parseInt(elem.attr('height'));

  //   elem.bottomRightX = elem.originalX + elem.originalWidth;
  //   elem.bottomRightY = elem.originalY + elem.originalHeight;
  //   return elem;
  // }

  // function validElement(elem) {
  //   var invalid = (elem.attr('width') === 0) || (elem.attr('height') === 0) || overlap(elem);
  //   return !invalid;
  // }

  // function setDefaultOptions(elem) {
  //   elem.attr('class', 'resize-drag');

  //   elem.variable_type = null;
  //   elem.orientation = 'horizontal';
  //   elem.font_family = 'Tahoma';
  //   elem.font_size = "12";
  //   elem.bolded = false;
  //   elem.underlined = false;
  //   elem.italic = false;
  //   return true;
  // }

  // function save_form() {
  //   var rect_id = $('form input[name="variable_id"]').val();
  //   var elem = paper.getById(rect_id);

  //   elem.variable_type = $('select#vars :selected').val();
  //   elem.orientation = $('select#orientation :selected').val();
  //   elem.font_family = $('select#font-family :selected').val();
  //   elem.font_size = $('select#font-size :selected').val();
  //   elem.bolded = $('button[name="bold"]').hasClass('active');
  //   elem.underlined = $('button[name="underline"]').hasClass('active');
  //   elem.italic = $('button[name="italic"]').hasClass('active');

  //   clear_form();
  //   $('form').hide();
  // }
