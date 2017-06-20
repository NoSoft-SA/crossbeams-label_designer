(function() {
  'use strict';


  // Labeldesigner
    // Label
      //  Export
      //  Load
      //  Initialise
      //  Save
      //  Duplicate
    // Shape
    // Toolbar
    // FormDialog
    // ImageDialog
    // Global functions || library


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

  $('.resizable').resizable({
    resize: function( event, ui ) {
      var height = $(".resizable").height();
      var width = $(".resizable").width();

      doResizeCanvas(width, height);
    }
  });

  $('.text-popup').hide();
  $('.barcode-options').hide();
  $('.variable-popup').hide();

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
  drawEnv.divPaper.onmousedown = function(event) {
    updateStartCoords(event);
    if (drawEnv.drawing !== 'none'){
      var myShape = myLabel.newShape(drawEnv.drawing);
    }
  };
  drawEnv.divPaper.onmouseup = function(event) {
    drawEnv.divPaper.onmousemove = null;
    if (drawEnv.drawing !== 'none'){
      var shape = myLabel.selectedShape();
      shape.addAnchors();
      // $('button[name=' + drawEnv.drawing + ']').removeClass('selected');
      if ( ('VariableBox' === shape.name) && overlap(shape.outerBox) ){
        shape.remove(true);
      }
    }
    toggleOptions();
    clearTool();
  };

  // #################### FORM FUNCTIONS ######################################################
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

  // #################### TEXT & VARIABLE FORM FUNCTIONS ######################################
  $('#textinput').on('input', function(event){
    myLabel.selectedShape().textBox.text($(this).val());
    drawEnv.stage.draw();
  });
  $('#font-size').on('change', function(){
    myLabel.selectedShape().textBox.fontSize($(this).val());
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  $('#font-family').on('change', function(){
    myLabel.selectedShape().textBox.fontFamily($(this).val());
    myLabel.selectedShape().saveVariableInfo();
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
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
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
    myLabel.selectedShape().saveVariableInfo();
    drawEnv.stage.draw();
  });
  // #################### VARIABLE FORM FUNCTIONS #############################################
  // TODO:
  // populate & clear form appropriately

  $('#textinput, #vars, #barcode_margin, #barcode_symbology').on('change', function(){
    myLabel.selectedShape().saveVariableInfo();
  });
  // myLabel.selectedShape().saveVariableInfo()
  // $('select#vars').on('change', function(){
  //   myLabel.selectedShape().saveVariableInfo()
  // });
  // // $('select#orientation')
  // $('select#barcode_margin').on('change', function(){
  //   myLabel.selectedShape().saveVariableInfo()
  // });
  // $('select#barcode_symbology').on('change', function(){
  //   myLabel.selectedShape().saveVariableInfo()
  // });
  $('#barcode_bool').on('change', function(){
    if ($(this).val() === 'Yes'){
      $('.barcode-options').show();
    } else {
      $('.barcode-options').hide();
    }
    myLabel.selectedShape().saveVariableInfo();
  });

  // #################### TOOLBAR FUNCTIONS ###################################################
  $('#stroke-width').on('change', function(){
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    drawEnv.stage.draw();
  });
  $('button[name="remove"]').click(function(){
    myLabel.selectedShape().remove();
  });
  $('button.rotate').click(function(){
    myLabel.selectedShape().rotate();
    myLabel.selectedShape().saveVariableInfo();
  });
  $( 'button[name="TextBox"], \
      button[name="Line"], \
      button[name="Rect"], \
      button[name="Ellipse"], \
      button[name="VariableBox"]').click(function(){
        toggleOptions();
        drawEnv.drawing = ((activateTool(this) === true) ? $(this).attr('name') : 'none');
  });
  $('button[name="pointer"]').click(function(){
    clearTool();
  });

  // #################### HELPER FUNCTIONS ####################################################
  function clearTool(){
    drawEnv.drawing='none';
    drawEnv.currentElement = new Konva.Node();
    $('form.variable-info-form')[0].reset();

    // deselect all relevant buttons
    $('button[name="Line"').removeClass('selected');
    $('button[name="Rect"').removeClass('selected');
    $('button[name="Ellipse"').removeClass('selected');
    $('button[name="TextBox"').removeClass('selected');
    $('button[name="VariableBox"').removeClass('selected');
  }
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
    var child = getChildrenOfType(type, group);
    return child[0];
  }
  function getChildrenOfType(type, group){
    var children = group.getChildren(function(node){
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
  function toggleOptions(){
    var shape = myLabel.selectedShape();
    if (shape){
      $('.text-popup').hide();
      $('.variable-popup').hide();
      $('[name=rotate]').removeAttr('disabled');
      $('[name=remove]').removeAttr('disabled');

      switch (shape.name){
        case 'VariableBox':
          $('#textinput').attr('title', 'Insert text here for demo purposes only. This will not be saved or displayed in the final label design.');
          $('#textinput').attr('placeholder', 'Demo text');
          $('.text-popup').show();
          $('.variable-popup').show();
          $('#textinput').trigger('focus');
          // populate first if applicable
          if ($('#barcode_bool').val() === 'Yes'){
            $('.barcode-options').show();
          } else {
            $('.barcode-options').hide();
          }
          break;
        case 'TextBox':
          $('#textinput').attr('title', 'Insert text here');
          $('#textinput').attr('placeholder', 'Insert text');
          $('.text-popup').show();
          $('#textinput').trigger('focus');
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
  function activateTool(tool_handle){
    var activate;
    clearTool();
    if ($(tool_handle).hasClass('selected')){
      // $(tool_handle).removeClass('selected');
      // $('button[name="pointer"]').trigger('click');
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
  $('button[name="image"]').click(function(){
    imageDialog.dialog( "open" );
  });
  var imageDialog = $( "#image-dialog-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Upload new image": addImage,
      Cancel: function() {
        imageDialog.dialog( "close" );
      }
    },
    close: function() {
      imageDialog.find('form')[ 0 ].reset();
    }
  });
  imageDialog.find('input:file').change(function(){
    if (this.files.length > 0){
      imageDialog.find('notice').addClass('hidden');
    } else {
      imageDialog.find('notice').removeClass('hidden');
    }
  });
  function addImage(){
    var files = imageDialog.find('input:file')[0].files;
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
            imageDialog.dialog( "close" );
            imageDialog.find('notice').addClass('hidden');
          }
        }
      }
    } else {
      imageDialog.find('notice').removeClass('hidden');
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
        this.group.on('mousedown touchstart', function() {
          this.shape.savePosition();
        });
        this.group.on('dragend', function() {
          this.shape.preventOverlap();
          drawEnv.stage.draw();
        });
        this.outerBox = ((name === 'Line') ? undefined : getChildOfType('Rect', this.group));
        // this.shapeId = in a list
        drawEnv.currentElement = this;

        if ('Image' === name){
          this.image = getChildOfType(name, this.group);
          drawEnv.imageLayer.add(this.group);
          this.addAnchors();
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
        toggleOptions();
      },
      deselect: function(){
        this.selected = false;
        this.group.draggable(false);
        if (this.name !== 'Rect' && this.name !== 'Line' && this.name !== 'VariableBox'){
          this.outerBox.hide();
        }
        this.highlightOff();
        this.hideAnchors();
        toggleOptions();
      },
      showAnchors: function(){
        this.getAnchors().forEach(function(node){
          node.show();
        });
      },
      hideAnchors: function(){
        this.getAnchors().forEach(function(node){
          node.hide();
        });
      },
      getAnchors: function(){
        var anchors = [];
        this.group.getChildren(function(node){
          if (node.getClassName() === 'Circle'){
            anchors.push(node);
          }
        });
        return anchors;
      },
      remove: function(force=false){
        if ('VariableBox' === this.name && !force){
          if (confirm("Are you sure you want to delete this variable and all it's options")){
            [this.outerBox, this.textBox, this.drawnShape, this.group].forEach( function(object){
              if (object){ object.destroy(); }
            });
            myLabel.removeShape(this);
          }
        } else {
          [this.outerBox, this.textBox, this.drawnShape, this.group].forEach( function(object){
            if (object){ object.destroy(); }
          });
          myLabel.removeShape(this);
        }
      },
      rotate: function(){
        if ('VariableBox' === this.name){
          this.savePosition();
          this.group.rotate(90);
          if (this.preventOverlap()){
            alert('Overlapping variables prevent rotation.')
          }
        } else {
          this.group.rotate(90);
        }
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
      resetGroupPosition: function(){
        // snap contents back to 0,0 after resize
        var contentX = ((this.outerBox) ? this.outerBox.x() : this.drawnShape.x());
        var contentY = ((this.outerBox) ? this.outerBox.y() : this.drawnShape.y());

        var translateables = [this.textBox, this.drawnShape, this.image]
        this.getAnchors().forEach(function(anchor){
          translateables.push(anchor);
        });
        if ('Rect' !== this.name){
          translateables.push(this.outerBox);
        }
        translateables.forEach( function(object){
          if (object){
            object.move({x: -1*contentX, y: -1*contentY});
          }
        });
        this.group.move({x: contentX, y: contentY});
      },
      savePosition: function(){
        // Right now this function is only for overlapping of variables
        if ('VariableBox' === this.name){
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
          }
        }
      },
      resetToSavedPosition: function(){
        // Right now this function is only for overlapping of variables
        if (this.savedPosition){
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
          topLeft.position(this.savedPosition.anchorPositions.topLeft),
          topRight.position(this.savedPosition.anchorPositions.topRight),
          bottomLeft.position(this.savedPosition.anchorPositions.bottomLeft),
          bottomRight.position(this.savedPosition.anchorPositions.bottomRight)
        }
      },
      preventOverlap: function(){
        if (('VariableBox' === this.name) && overlap(this.outerBox)){
          this.resetToSavedPosition();
          return true;
        } else {
          return false;
        }
      },
      addAnchor: function(group, x, y, name) {
        var shape = group.shape
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
          shape.updateShape(this);
          layer.draw();
        });
        anchor.on('mousedown touchstart', function() {
          shape.savePosition();
          group.setDraggable(false);
          this.moveToTop();
        });
        anchor.on('dragend', function() {
          shape.resetGroupPosition();
          shape.preventOverlap();
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
      },
      saveVariableInfo: function(){
        // Variables only
        if ('VariableBox' === this.name){
          var pos = actualPosition(this.group);
          var form = $('form.variable-info-form')
          // console.log(form.find)
          this.savedVariableInfo = {
            variableId: this.shapeId,
            variableType: form.find('#vars').val(),
            orientation: (this.group.rotation()%360),
            position: pos,
            startX: pos.x0,
            startY: pos.y0,
            width: (pos.x1 - pos.x0),
            height: (pos.y1 - pos.y0),
            fontSize: this.textBox.fontSize(),
            fontFamily: this.textBox.fontFamily(),
            bold: ((this.textBox.fontStyle() === 'bold') ? 'yes' : 'no'),
            italic: ((this.textBox.fontStyle() === 'italic') ? 'yes' : 'no'),
            underline: ((this.textBox.textDecoration() === 'underline') ? 'yes' : 'no'),
            isBarcode: form.find('#barcode_bool').val(),
            barcodeMargin: form.find('#barcode_margin').val(),
            barcodeSymbology: form.find('#barcode_symbology').val()
          }
        }
        console.log(this.savedVariableInfo);
      }

    }
  };

  function overlap(rectangle) {
    var overlap = [];
    var set = [];

    var rectGroup = rectangle.findAncestor('Group');
    var rectPosition = actualPosition(rectGroup);

    drawEnv.variableLayer.getChildren().forEach(function(group){
      var object = actualPosition(group);
      set.push(object);
    });

    if (rectangle && (set[0] !== undefined)) {
      var x0 = rectPosition.x0;
      var x1 = rectPosition.x1;
      var y0 = rectPosition.y0;
      var y1 = rectPosition.y1;

      set.forEach( function(e) {
        var ex0 = e.x0;
        var ex1 = e.x1;
        var ey0 = e.y0;
        var ey1 = e.y1;


        if (JSON.stringify(rectPosition) == JSON.stringify(e)){
          // do nothing
        } else {
          var a = ( ( (y0 <= ey0 && ey0 <= y1) || (y0 <= ey1 && ey1 <= y1) ) && ( (x0 <= ex0 && ex0 <= x1) || (x0 <= ex1 && ex1 <= x1) )  );
          var b = ( ( (ey0 <= y0 && y0 <= ey1) || (ey0 <= y1 && y1 <= ey1) ) && ( (ex0 <= x0 && x0 <= ex1) || (ex0 <= x1 && x1 <= ex1) )  );
          var c = ( (x0 > ex0 && x1 < ex1 && y0 < ey0 && y1 > ey1) ||
                    (ex0 > x0 && ex1 < x1 && ey0 < y0 && ey1 > y1) );

          overlap.push( a || b || c );
        }
      });
    }
    return overlap.includes(true);
  }

  function actualPosition(group){
    // Variables only
    var rect = getChildOfType('Rect', group);
    var theta = group.rotation()%360;
    switch (theta){
      case 0:
        var object = {
          x0: group.x(),
          x1: group.x() + rect.width(),
          y0: group.y(),
          y1: group.y() + rect.height()
        }
        break;
      case 90:
        var object = {
          x0: group.x() - rect.height(),
          x1: group.x(),
          y0: group.y(),
          y1: group.y() + rect.width()
        }
        break;
      case 180:
        var object = {
          x0: group.x() - rect.width(),
          x1: group.x(),
          y0: group.y() - rect.height(),
          y1: group.y()
        }
        break;
      case 270:
        var object = {
          x0: group.x(),
          x1: group.x() + rect.height(),
          y0: group.y() - rect.width(),
          y1: group.y()
        }
        break;
    }
    return object;
  }

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


  // *** Old Stuff ***

  //  ContextMenu:
  //     if( event.button == 2 ) {
  //       alert('Right mouse button!');
  //       return false;
  // document.oncontextmenu = function() {return false;};

  //  Maybe rather use the dialog for the form
  //       popup_form();

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

  // ******************
  // *** Form Stuff ***

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
