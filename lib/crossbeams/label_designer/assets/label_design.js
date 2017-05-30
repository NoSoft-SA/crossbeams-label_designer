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
    currentElement: new Konva.Node()
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

  function getTextBox(group){
    var textbox = group.getChildren(function(node){
      return node.getClassName() === 'Text';
    });
    return textbox[0];
  }

  function getRectangle(group){
    var rectangle = group.getChildren(function(node){
      return node.getClassName() === 'Rect';
    });
    return rectangle[0];
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
    myLabel.selectedShape().drawn.strokeWidth($(this).val());
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
      button[name="Rectangle"], \
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
    $('button[name="Rectangle"').removeClass('selected');
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
      var text = variable_grouping.getChildren(function(node){
        return node.getClassName() === 'Text';
      });
      var box = variable_grouping.getChildren(function(node){
        return node.getClassName() === 'Rectangle';
      });

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
    var type, id, primary,
        drawn, textBox;
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
        this.type = ((['VariableBox', 'TextBox'].indexOf(name) > -1) ? 'Group' : name);

        this.primary = this[('init' + name)](imageObj, width, height);
        drawEnv.currentElement = this;

        if ('Group' === this.type){
          this.drawn = getRectangle(this.primary);
          this.textBox = getTextBox(this.primary);
        } else{
          this.drawn = this.primary;
        }
        this.shapeId = this.drawn._id;

        if (this.type === 'Image'){
          drawEnv.imageLayer.add(this.drawn);
          myLabel.selectShape(this);
          drawEnv.stage.draw();
        } else {
          drawEnv.divPaper.onmousemove = this.drawShape;
        }
      },

      reinitialise: function(konva_shape){
        // #TODO: This will have to be done for each of the image layer shapes and once for every variable
        this.type = konva_shape.getClassName()
        this.primary = konva_shape;
        if (this.type === 'Group'){
          this.drawn = getRectangle(konva_shape);
          this.textBox = getTextBox(konva_shape);
        } else{
          this.drawn = konva_shape;
        }
      },
      // #TODO: Add border capability to text boxes and variables and images
      //  add rect to image layer for variables somehow
      //  always show solid rect for textboxes
      select: function(){
        this.selected = true;
        this.primary.draggable(true);
        if (this.type === 'Group'){
          this.drawn.show();
        }
        this.highlightOn();
      },

      deselect: function(){
        this.selected = false;
        this.primary.draggable(false);
        if (this.name === 'TextBox'){
          this.drawn.hide();
        }
        this.highlightOff();
      },
      selected: function(){
        this.selected;
      },
      remove: function(){
        if (this.type === 'Group'){
          this.drawn.destroy();
          this.textBox.destroy();
        } else {
          this.drawn.destroy();
        }
        myLabel.removeShape(this)
      },

      rotate: function(){
        this.drawn.rotate(90);
        this.textBox.rotate(90);
        drawEnv.stage.draw();
      },

      highlightOn: function(){
        this.drawn.shadowColor('black');
        this.drawn.shadowBlur(20);
        this.drawn.shadowOpacity(0.9);
      },
      highlightOff: function(){
        this.drawn.shadowBlur(0);
      },

      initLine: function(event) {
        var line = new Konva.Line({
          points: [drawEnv.startX, drawEnv.startY],
          stroke: 'black',
          strokeWidth: 2,
          lineCap: 'round',
          lineJoin: 'round'
        });
        return line;
      },
      initRectangle: function(event) {
        var rect = new Konva.Rect({
          x: drawEnv.startX,
          y: drawEnv.startY,
          width: 0,
          height: 0,
          fill: '',
          stroke: 'black',
          strokeWidth: 2
        });
        return rect;
      },
      initEllipse: function(event) {
        var ellipse = new Konva.Ellipse({
          x: drawEnv.startX,
          y: drawEnv.startY,
          radius: {
            x: 0,
            y: 0
          },
          fill: '',
          stroke: 'black',
          strokeWidth: 2
        });
        return ellipse;
      },
      initText: function(event) {
        var text = new Konva.Text({
          x: drawEnv.startX,
          y: drawEnv.startY,
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
          y: 0
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
          y: 0
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
        return image;
      },

      drawShape: function(event) {
        if (drawEnv.currentElement) {
          updateCurrentCoords(event);
          var object = drawEnv.currentElement.primary;
          var type = drawEnv.currentElement.type;
          if (type === 'Line'){
            var newX = ((drawEnv.shifted === true) ? drawEnv.startX : drawEnv.currentX);
            var newY = ((drawEnv.controlled === true) ? drawEnv.startY : drawEnv.currentY);
            object.points([drawEnv.startX, drawEnv.startY, newX, newY]);
          } else {

            var objects = ((type === 'Group') ? [drawEnv.currentElement.textBox, drawEnv.currentElement.drawn] : [object]);
            objects.forEach(function(obj){
              var width = (drawEnv.currentX - drawEnv.startX);
              var height = ((drawEnv.shifted || drawEnv.controlled) ? Math.abs(width) : (drawEnv.currentY - drawEnv.startY));

              if (type === 'Ellipse'){
                obj.width(Math.abs(2*width));
                obj.height(Math.abs(2*height));
              } else {
                obj.width(Math.abs(width));
                obj.height(Math.abs(height));
              }
            });
          }

          if (drawEnv.currentElement.name === 'VariableBox' ){
            drawEnv.variableLayer.add(object);
          } else {
            drawEnv.imageLayer.add(object);
          }
          myLabel.selectShape(drawEnv.currentElement);
          drawEnv.stage.draw();

        }
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
          var shape = myLabel.getShapeByElem(evt.target);
          document.body.style.cursor = 'pointer';
          shape.highlightOn();
          drawEnv.stage.draw();
        });
        drawEnv.stage.on('mouseout', function(evt) {
          var shape = myLabel.getShapeByElem(evt.target);
          if (!shape.selected) {
            shape.highlightOff();
          }
          document.body.style.cursor = 'default';
          drawEnv.stage.draw();
        });
        drawEnv.stage.on('click', function(evt) {
          var shape = myLabel.getShapeByElem(evt.target);
          myLabel.selectShape(shape);
          drawEnv.stage.draw();
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
      getShapeById: function(id){
        return this.shapes.find(function(shape){
          return shape.shapeId === id;
        });
      },
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
        var shape;
        if (elem.getClassName() === 'Text'){
          var rect = getRectangle(elem.findAncestor('Group'));
          shape = this.getShapeById(rect._id);
        } else {
          shape = this.getShapeById(elem._id);
        }
        return shape;
      }
    }
  };

  var myLabel = new Label();


  // Resizing
  // var width = window.innerWidth;
  //   var height = window.innerHeight;
  function update(activeAnchor) {
    var group = activeAnchor.getParent();
    var topLeft = group.get('.topLeft')[0];
    var topRight = group.get('.topRight')[0];
    var bottomRight = group.get('.bottomRight')[0];
    var bottomLeft = group.get('.bottomLeft')[0];
    var image = group.get('Image')[0];
    var anchorX = activeAnchor.getX();
    var anchorY = activeAnchor.getY();
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
    image.position(topLeft.position());
    var width = topRight.getX() - topLeft.getX();
    var height = bottomLeft.getY() - topLeft.getY();
    if(width && height) {
      image.width(width);
      image.height(height);
    }
  }
  function addAnchor(group, x, y, name) {
    var stage = group.getStage();
    var layer = group.getLayer();
    var anchor = new Konva.Circle({
      x: x,
      y: y,
      stroke: '#666',
      fill: '#ddd',
      strokeWidth: 2,
      radius: 8,
      name: name,
      draggable: true,
      dragOnTop: false
    });
    anchor.on('dragmove', function() {
      update(this);
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
      document.body.style.cursor = 'pointer';
      this.setStrokeWidth(4);
      layer.draw();
    });
    anchor.on('mouseout', function() {
      var layer = this.getLayer();
      document.body.style.cursor = 'default';
      this.setStrokeWidth(2);
      layer.draw();
    });
    group.add(anchor);
  }
  //   var stage = new Konva.Stage({
  //       container: 'container',
  //       width: width,
  //       height: height
  //   });
  //   var layer = new Konva.Layer();
  //   stage.add(layer);
  //   // darth vader
  //   var darthVaderImg = new Konva.Image({
  //       width: 200,
  //       height: 137
  //   });
  //   // yoda
  //   var yodaImg = new Konva.Image({
  //       width: 93,
  //       height: 104
  //   });
  //   var darthVaderGroup = new Konva.Group({
  //       x: 180,
  //       y: 50,
  //       draggable: true
  //   });
  //   layer.add(darthVaderGroup);
  //   darthVaderGroup.add(darthVaderImg);
  //   addAnchor(darthVaderGroup, 0, 0, 'topLeft');
  //   addAnchor(darthVaderGroup, 200, 0, 'topRight');
  //   addAnchor(darthVaderGroup, 200, 138, 'bottomRight');
  //   addAnchor(darthVaderGroup, 0, 138, 'bottomLeft');
  //   var yodaGroup = new Konva.Group({
  //       x: 20,
  //       y: 110,
  //       draggable: true
  //   });
  //   layer.add(yodaGroup);
  //   yodaGroup.add(yodaImg);
  //   addAnchor(yodaGroup, 0, 0, 'topLeft');
  //   addAnchor(yodaGroup, 93, 0, 'topRight');
  //   addAnchor(yodaGroup, 93, 104, 'bottomRight');
  //   addAnchor(yodaGroup, 0, 104, 'bottomLeft');
  //   var imageObj1 = new Image();
  //   imageObj1.onload = function() {
  //       darthVaderImg.image(imageObj1);
  //       layer.draw();
  //   };
  //   imageObj1.src = '/assets/darth-vader.jpg';
  //   var imageObj2 = new Image();
  //   imageObj2.onload = function() {
  //       yodaImg.image(imageObj2);
  //       layer.draw();
  //   };
  //   imageObj2.src = '/assets/yoda.jpg';

    // resizing end


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
