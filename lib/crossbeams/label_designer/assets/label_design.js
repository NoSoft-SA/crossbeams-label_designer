(document.onload = function() {
  'use strict';

  // Global variables
  var div_paper = $('#paper')[0];
  // var rect, dragElement;
  var startX = 0, startY = 0,
      currentX = 0, currentY = 0,
      rectId = 0,
      dragOffsetX = 0, dragOffsetY = 0;
  var offset = findPos(div_paper);
  var shifted = false;
  var controlled = false;
  // This should be used to set the original values in the case of an existing label design
  var init_width = 700;
  var init_height = 500;
  // first we need to create a stage
  var stage = new Konva.Stage({
    container: 'paper',   // id of container <div>
    width: init_width,
    height: init_height
  });
  // create image & variable layers
  var image_layer = new Konva.Layer({fill: 'white'});
  image_layer.draw();
  var variable_layer = new Konva.Layer();
  var variable_group = new Konva.Group();
  // add the layers to the stage
  stage.add(image_layer,variable_layer);
  // initialise current selected element
  var currentElement = new Konva.Node();
    // drawing objects
  var drawing='none';
  // manipulating drawn objects
  var hoverMenu=false;
  // var pointer=true;

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


  // update offset on scroll
  $(document).on('mousewheel', function(event){offset = findPos(div_paper);});
  $(document).on('keyup keydown', function(event){shifted = event.shiftKey;});
  $(document).on('keyup keydown', function(event){controlled = event.ctrlKey;});

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

  // START: ON DOCUMENT LOAD
  $('#paper').width(init_width);
  $('#paper').height(init_height);

  $( ".resizable" ).resizable({
    resize: function( event, ui ) {
      var height = $(".resizable").height();
      var width = $(".resizable").width();

      doResizeCanvas(width, height);
    }
  });
  // END: ON DOCUMENT LOAD

  function doResizeCanvas(width, height, original_width=null, original_height=null){
    // if (variables are cut off){
      // If (original_width !== null){
        // stage.width(original_width);
      // }
      // If (original_height !== null){
        // stage.height(original_height);
      // }
    // } else {
      stage.width(width);
      stage.height(height);
    // }
    // if allowed #TODO - should not be allowed if variables are going to be cut off
  }

  function validVariables(){
    // if variables cut off false
    // else true
    return true;
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
    startX = (mouseCoords.x - offset[0]);
    startY = (mouseCoords.y - offset[1]);
  }

  function updateCurrentCoords(event) {
    // start of mouseclick relative to paper
    var mouseCoords = getCoords(event);
    currentX = (mouseCoords.x - offset[0]);
    currentY = (mouseCoords.y - offset[1]);
  }

  div_paper.onmousedown = function(event) {
    updateStartCoords(event);
    if (drawing === 'line'){
      // initLine(event);
      var myShape = new shape();
      myShape.initialise('Line');
    } else if (drawing === 'rectangle'){
      initRectangle(event);
    } else if (drawing === 'ellipse'){
      initEllipse(event);
    } else if (drawing === 'textbox'){
      initText(event);
    } else if (drawing === 'variablebox'){
      initGroup(event);
    }
  };

  div_paper.onmouseup = function(event) {
    div_paper.onmousemove = null;

    if (drawing === 'line'){
      $('button[name="line"').removeClass('selected');
    } else if (drawing === 'rectangle'){
      $('button[name="rectangle"').removeClass('selected');
    } else if (drawing === 'ellipse'){
      $('button[name="ellipse"').removeClass('selected');
    } else if (drawing === 'textbox'){
      $("input[name='textbox']").trigger('focus');
      $("input[name='textbox']").show();
      $("input[name='textdemo']").hide();
    } else if (drawing === 'variablebox'){
      $("input[name='textdemo']").trigger('focus');
      $("input[name='textdemo']").show();
      $("input[name='textbox']").hide();
    }
    resetToolbar();
  };

  $("input[name='textbox']").on('input', function(event){
    currentElement.text($(this).val());
    stage.draw();
  });

  $("input[name='textbox']").on('focusout', function(event){
    // #TODO
    // currentElement.draggable(true);
    $('button[name="text-box"]').removeClass('selected');
  });

  $("input[name='textdemo']").on('input', function(event){
    var nodes = currentElement.getChildren(function(node){
       return node.getClassName() === 'Text';
    });
    // console.log(nodes);
    // console.log(nodes[0]);
    // console.log(nodes[0].text());

    nodes[0].text($(this).val());
    stage.draw();
  });

  $("input[name='textdemo']").on('focusout', function(event){
    // #TODO
    // currentElement.draggable(true);
    $('button[name="text-box"]').removeClass('selected');
  });

  // $(document).on('focusout', function(){
  //   editingTextBox = false;
  //   currentElement.draggable(true);
  // })

  // $('#menucontainer').focusout(function(event){
  //   get out of current state
  //      either reset
  //      or save and move on by releasing the mouse
  // });

// #################### FONT OPTIONS #######################################################
  $('#font-size').on('change', function(){
    currentElement.fontSize($(this).val());
    stage.draw();
  });

  $('#font-family').on('change', function(){
    currentElement.fontFamily($(this).val());
    stage.draw();
  });

  $('button.underline').on('click', function(){
    if ($(this).hasClass('selected')){
      $(this).removeClass('selected');
      currentElement.textDecoration('');
    } else {
      $(this).addClass('selected');
      currentElement.textDecoration('underline');
    }
    stage.draw();
  });

  $('button.bold, button.italic').on('click', function(){
    if ($(this).hasClass('selected')){
      $(this).removeClass('selected');
      currentElement.fontStyle('normal');
    } else {
      $('button.bold').removeClass('selected');
      $('button.italic').removeClass('selected');
      $(this).addClass('selected');
      currentElement.fontStyle($(this).attr('name'));
    }
    stage.draw();
  });
  // function setFontStyle(style){
  //   console.log(currentElement.fontStyle());
  //   console.log(currentElement.fontStyle().split());
  //   var current_style = currentElement.fontStyle().split();

  //   if (current_style.includes(style)){
  //     // remove it
  //     var index = current_style.indexOf(style);
  //     current_style.splice(index, 1);
  //   } else {
  //     // add it
  //     current_style.push(style);
  //   }

  //   // make sure that it does not have normal in combinations
  //   // remove normal if more than one value

  //   if ( (current_style.indexOf('bold') < 0 ) && (current_style.indexOf('italic') < 0 ) ) {
  //     current_style.push('normal');
  //   } else {
  //     var index = current_style.indexOf('normal');
  //     current_style.splice(index, 1);
  //   }
  //   console.log(current_style);
  //   currentElement.fontStyle(current_style.join());
  //   currentElement.fontStyle('italic,bold');
  //   stage.draw();
  // }


//  Overlapping
// getIntersection(pos, selector)
// var shape = layer.getIntersection({x: 50, y: 50});
// // or if you interested in shape parent:
// var group = layer.getIntersection({x: 50, y: 50}, 'Group');


  // nice to have (ruler as well)
  // $('button[name="select"]').click(function(){
  //   // I'm going to merge this functionality into the pointer or ignore it completely
  // });
  $('button[name="move"]').click(function(){
    // when selected any object can be moved
  });
  $('button[name="resize"]').click(function(){
    // when selected you will be shown which objects can be resized
  });
  $('button[name="remove"]').click(function(){
    // when selected you will be shown which objects can be removed/deleted
  });


  $('button[name="line-width"]').click(function(){
    // We are setting this with px
    // set line width on click
    // you must first select an object to update line width
  });

  $('button[name="text-box"]').click(function(){
    drawing='textbox';
    $(this).addClass('selected');
    // filling this in will add text to the text box
  });

  $('button[name="variable-box"]').click(function(){
    drawing = ((activateTool(this) === true) ? 'variablebox' : 'none');
    // filling this in will add demo text to the variable box
    // eventually we want to be able to call the example variables from the database
        // config per installation using
  });

// THESE 3 SHOULD BE IN A CASE
  $('button[name="line"]').click(function(){
    drawing = ((activateTool(this) === true) ? 'line' : 'none');
    // draw straight line on drag
    // shift should make sure the line snaps to grid horizontally
    // ctrl? should make sure the line snaps to grid vertically
    // if ($(this).hasClass('selected')){
    //   // select current
    //   $(this).removeClass('selected');
    //   $('button[name="pointer"]').trigger('click');
    //   drawing='none';
    // } else {
    //   // select current
    //   $(this).addClass('selected');
    //   drawing='line';
    // }
  });

  $('button[name="rectangle"]').click(function(){
    drawing = ((activateTool(this) === true) ? 'rectangle' : 'none');
    // draw rectangle on drag
    // shift should make sure the rectangle remains square
    // if ($(this).hasClass('selected')){
    //   // select current
    //   $(this).removeClass('selected');
    //   $('button[name="pointer"]').trigger('click');
    //   drawing = 'none';
    // } else {
    //   // select current
    //   $(this).addClass('selected');
    //   drawing='rectangle';
    // }
  });

  // I can either add in ellipse OR call this ellipse and make shift force circle
  $('button[name="ellipse"]').click(function(){
    drawing = ((activateTool(this) === true) ? 'ellipse' : 'none');
    // draw ellipse on drag
    // if ($(this).hasClass('selected')){
    //   // select current
    //   $(this).removeClass('selected');
    //   $('button[name="pointer"]').trigger('click');
    //   drawing='none';
    // } else {
    //   // select current
    //   $(this).addClass('selected');
    //   drawing='ellipse';
    // }
  });

// $('button[name="move"')
// $('button[name="resize"')
// $('button[name="remove"')
// $('button[name="text-box"')
// $('button[name="line-width"')
// $('button[name="rotate"')
// $('button[name="bold"')
// $('button[name="underline"')
// $('button[name="italic"')
// $('button[name=line]')

  function activateTool(tool_handle){
    var activate;
    if ($(tool_handle).hasClass('selected')){
      // select current
      $(tool_handle).removeClass('selected');
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
    drawing='none';

  }

  $('button[name="pointer"]').click(function(){
    resetToolbar()
    // mouse should be able to move and click and select freely now
    currentElement = new Konva.Node();
    $('input[name=textbox]').val('');
    // $(this).addClass('selected');
    // Make all defaults false

    // deselect all relevant buttons
    $('button[name="line"').removeClass('selected');
    $('button[name="rectangle"').removeClass('selected');
    $('button[name="ellipse"').removeClass('selected');
    $('button[name="text-box"').removeClass('selected');
    $('button[name="variable-box"').removeClass('selected');

    // TODO: decisions decisions
    // unbind from currentElement - deselect currentElement
    // currentElement.draggable(true);
    //  Maybe things should only be draggable once you have selected the pointer
    // While the pointer is selected all elements should be selectable
    //    selecting an element will set it to selected and make it rotateable, deletable, draggable, resizeable
  });

  $('button.rotate').click(function(){
    // rotate on 90 deg on click
    var new_rotation = currentElement.rotation() + 90;
    currentElement.rotation(new_rotation);
    // if (currentElement.rectangle !== null) {
    //   currentElement.rectangle.rotation(new_rotation);
    // }
    stage.draw();
  });




  // OLD STUFF //

  // img.onload = function() {
  //   paper.image(img.src, 0, 0, newWidth, newHeight);
  // };

  // // This needs to be split up with better events
  // div_paper.onmousedown = function(event) {
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




  // ###################### INIT FUNCTIONS #########################################################
  // initialise and start draw
  function initLine(event) {
    console.log('initline');
    var line = new Konva.Line({
      points: [startX, startY],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    });
    return line;
  }
  function initRectangle(event) {
    var rect = new Konva.Rect({
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 2
    });
    return rect;
  }
  function initEllipse(event) {
    var ellipse = new Konva.Ellipse({
      x: startX,
      y: startY,
      radius: {
        x: 0,
        y: 0
      },
      fill: '',
      stroke: 'black',
      strokeWidth: 2
    });
    return ellipse;
  }
  function initText(event) {
    var text = new Konva.Text({
      x: startX,
      y: startY,
      text: 'Insert text...',
      fontSize: 21,
      fontFamily: 'Times New Roman',
      fill: 'black',
      width: 0,
      padding: 0,
      align: 'left'
    });
    return text;
  }
  function initGroup(event) {
    var text = new Konva.Text({
      x: startX,
      y: startY,
      text: 'Insert text...',
      fontSize: 21,
      fontFamily: 'Times New Roman',
      fill: 'black',
      width: 0,
      padding: 0,
      align: 'left'
    });
    var rect = new Konva.Rect({
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 2
    });

    var group = new Konva.Group();
    group.add(text);
    group.add(rect);
    return group;
  }


  // ###################### DRAW FUNCTIONS #########################################################
  // Draw the shape based on the current and start coordinates
  function drawLine(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      object = currentElement.drawn;
      console.log('drawline')
      // maybe split this out of here
      if (shifted === true){
        object.points([startX, startY, startX, currentY]);
      } else {
        if (controlled === true) {
          object.points([startX, startY, currentX, startY]);
        } else{
          object.points([startX, startY, currentX, currentY]);
        }
      }
      image_layer.add(object);
      stage.draw();
      currentElement.select();
    }
  }
  function drawRectangle(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      // maybe split this out of here
      var width = currentX - startX;
      var height = currentY - startY;

      if (shifted === true){
        height = Math.abs(width);
      } else if (controlled === true) {
        width = Math.abs(height);
      }

      currentElement.x( (width < 0) ? currentX : startX );
      currentElement.y( (height < 0) ? currentY : startY );
      currentElement.width( Math.abs(width) );
      currentElement.height( Math.abs(height) );

      selectElement(currentElement);
      image_layer.add(currentElement);
      stage.draw();
    }
  }
  function drawEllipse(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      // maybe split this out of here
      var width = currentX - startX;
      var height = currentY - startY;

      if (shifted === true){
        height = Math.abs(width);
      } else if (controlled === true) {
        width = Math.abs(height);
      }

      currentElement.x( (width < 0) ? currentX : startX );
      currentElement.y( (height < 0) ? currentY : startY );
      currentElement.width( Math.abs(2*width) );
      currentElement.height( Math.abs(2*height) );

      selectElement(currentElement);
      image_layer.add(currentElement);
      stage.draw();
    }
  }
  function drawText(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      // maybe split this out of here
      var width = currentX - startX;
      var height = currentY - startY;

      if (shifted === true){
        height = Math.abs(width);
      } else if (controlled === true) {
        width = Math.abs(height);
      }

      currentElement.x( (width < 0) ? currentX : startX );
      currentElement.y( (height < 0) ? currentY : startY );
      currentElement.width( Math.abs(width) );
      currentElement.height( Math.abs(height) );

      selectElement(currentElement);
      image_layer.add(currentElement);
      stage.draw();
    }
  }
  function drawGroup(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      // maybe split this out of here
      var width = currentX - startX;
      var height = currentY - startY;

      if (shifted === true){
        height = Math.abs(width);
      } else if (controlled === true) {
        width = Math.abs(height);
      }

      currentElement.x( (width < 0) ? currentX : startX );
      currentElement.y( (height < 0) ? currentY : startY );
      currentElement.width( Math.abs(width) );
      currentElement.height( Math.abs(height) );

      selectElement(currentElement);
      variable_layer.add(currentElement);
      variable_group.add(currentElement);
      stage.draw();
    }
  }

  // #################### OBJECT FUNCTIONS #########################################################
  function selectElement(elem){
    var selected = stage.find('.selected');
    // if (selected !== null){
      selected.removeName('selected');
      selected.draggable(false);
    //   if (isGroup(selected)){
    //     highlightOff( getRectangle(selected) );
    //   } else{
        highlightOff(selected);
    //   }
    // }

    // console.log(inGroup(elem));
    // if (isGroup(elem)){
    //   highlightOn( getRectangle(elem) );
    // } else{
    //   if (var group = getGroup(elem) ) {


      highlightOn(elem);
    // }
    elem.addName('selected');
    elem.draggable(true);
  }
  function highlightOn(elem){
    elem.shadowColor('black');
    elem.shadowBlur(20);
    elem.shadowOpacity(0.9);
  }
  function highlightOff(elem){
    elem.shadowBlur(0);
  }
  function isGroup(elem){
    elem.getClassName() === 'Group';
  }
  function getGroup(elem){
    elem.findAncestors('Group')[0];
  }
  function getTextBox(group){
    var textbox = group.getChildren(function(node){
      return node.getClassName() === 'Text';
    });
    return textbox[0];
  }
  function getRectangle(group){
    var rectangle = group.getChildren(function(node){
      return node.getClassName() === 'Rectangle';
    });
    return rectangle[0];
  }

  // #################### HOVER OVER ###############################################################
  // use event delegation to update pointer style
  // and apply borders
  stage.on('mouseover', function(evt) {
    var shape = evt.target;
    highlightOn(shape);
    document.body.style.cursor = 'pointer';
    stage.draw();
  });
  stage.on('mouseout', function(evt) {
    var shape = evt.target;
    if (!shape.hasName('selected')) {
      highlightOff(shape);
    }
    document.body.style.cursor = 'default';
    stage.draw();
  });
  stage.on('click', function(evt) {
    currentElement = evt.target;
    selectElement(currentElement);
    stage.draw();
  });

  // #################### SHAPE IDEA ###############################################################
  function shape(type){
    // PROS
      // All shapes are handled the same way
    // CONS
      // I don't want to use this shape function because reinitialising it from a saved state is going to royally suck
        // I need to keep it as close to Konva as possible.
    var id, types;

    this.type = type;
    this.types = ['Line', 'Circle', 'Rectangle', 'Text', 'Group']; // Only useful if it is a variable as well

    this.initialise = function(type){
      console.log(type);
      console.log('init' + type);
      this.primary = window['init' + type]();
      currentElement = this;

      this.id = this.primary.getId();
      if ('Group' === type){
        this.drawn = getRectangle(this.primary);
        this.textBox = getTextBox(this.primary);
      } else if ('Text' === type){
        this.textBox = this.primary;
      } else{
        this.drawn = this.primary;
      }
      div_paper.onmousemove = window['draw' + type];
    }

    this.reinitialise = function(konva_shape){
      // This will have to be done for each of the image layer shapes and once for every variable
      this.type = konva_shape.getClassName()
      this.primary = konva_shape;
      if (this.type === 'Group'){
        this.drawn = getRectangle(konva_shape);
        this.textBox = getTextBox(konva_shape);
      } else if (this.type === 'Text'){
        this.textBox = konva_shape;
      } else{
        this.drawn = konva_shape;
      }
    }
    // window[function_to_call]();

    this.draw = function(){
    }

    this.select = function(){
      this.primary.addName('selected');
      this.primary.draggable(true);
      this.highlightOn;
    }

    this.deselect = function(){
      this.primary.removeName('selected');
      this.primary.draggable(false);
      this.highlightOff();
    }

    this.remove = function(){
      // remove self
      // remove from stage
      // remove from layer
    }

    this.rotate = function(){
      var new_rotation = this.rotation() + 90;
      this.primary.rotation(new_rotation);
      stage.draw();
    }

    this.highlightOn = function(){
      this.drawn.shadowColor('black');
      this.drawn.shadowBlur(20);
      this.drawn.shadowOpacity(0.9);
    }
    this.highlightOff = function(){
      this.drawn.shadowBlur(0);
    }
  }

    // From Konva objects
    // TEXTBOX
    // this.text
    // this.fontSize
    // this.fontFamily
    // this.textDecoration
    // this.fontStyle

    // PRIMARY
    // this.draggable
    // this.rotation
    // this.addName

    // DRAWN
    // this.points
    // this.x
    // this.y
    // this.width
    // this.height
  // ###############################################################################################



  // ############## SAVE & EXPORT LABEL ############################################################
  function export_to_json(){
    var label_json;
    return label_json = {
      konva_label: stage.toJSON(),
      xml_string: generate_xml_file(),
      image_string: toImageDataURL()
    }
  }

  function toImageDataURL(){
    var dataURL;
    stage.removeChildren();
    stage.add(image_layer);
    dataURL = stage.toDataURL('image/png');
    stage.add(variable_layer);
    return dataURL;
  }

  function generate_xml_file(){
    var xml_string = "<?xml version='1.0'?><variables>";

    variable_group.getChildren(function(variable_grouping){
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

  // Resizing
  // var width = window.innerWidth;
  //   var height = window.innerHeight;
  //   function update(activeAnchor) {
  //       var group = activeAnchor.getParent();
  //       var topLeft = group.get('.topLeft')[0];
  //       var topRight = group.get('.topRight')[0];
  //       var bottomRight = group.get('.bottomRight')[0];
  //       var bottomLeft = group.get('.bottomLeft')[0];
  //       var image = group.get('Image')[0];
  //       var anchorX = activeAnchor.getX();
  //       var anchorY = activeAnchor.getY();
  //       // update anchor positions
  //       switch (activeAnchor.getName()) {
  //           case 'topLeft':
  //               topRight.setY(anchorY);
  //               bottomLeft.setX(anchorX);
  //               break;
  //           case 'topRight':
  //               topLeft.setY(anchorY);
  //               bottomRight.setX(anchorX);
  //               break;
  //           case 'bottomRight':
  //               bottomLeft.setY(anchorY);
  //               topRight.setX(anchorX);
  //               break;
  //           case 'bottomLeft':
  //               bottomRight.setY(anchorY);
  //               topLeft.setX(anchorX);
  //               break;
  //       }
  //       image.position(topLeft.position());
  //       var width = topRight.getX() - topLeft.getX();
  //       var height = bottomLeft.getY() - topLeft.getY();
  //       if(width && height) {
  //           image.width(width);
  //           image.height(height);
  //       }
  //   }
  //   function addAnchor(group, x, y, name) {
  //       var stage = group.getStage();
  //       var layer = group.getLayer();
  //       var anchor = new Konva.Circle({
  //           x: x,
  //           y: y,
  //           stroke: '#666',
  //           fill: '#ddd',
  //           strokeWidth: 2,
  //           radius: 8,
  //           name: name,
  //           draggable: true,
  //           dragOnTop: false
  //       });
  //       anchor.on('dragmove', function() {
  //           update(this);
  //           layer.draw();
  //       });
  //       anchor.on('mousedown touchstart', function() {
  //           group.setDraggable(false);
  //           this.moveToTop();
  //       });
  //       anchor.on('dragend', function() {
  //           group.setDraggable(true);
  //           layer.draw();
  //       });
  //       // add hover styling
  //       anchor.on('mouseover', function() {
  //           var layer = this.getLayer();
  //           document.body.style.cursor = 'pointer';
  //           this.setStrokeWidth(4);
  //           layer.draw();
  //       });
  //       anchor.on('mouseout', function() {
  //           var layer = this.getLayer();
  //           document.body.style.cursor = 'default';
  //           this.setStrokeWidth(2);
  //           layer.draw();
  //       });
  //       group.add(anchor);
  //   }
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



})();

// $(document).ready( function() {
  // here we can add code for when we have a designed label to load
// });
