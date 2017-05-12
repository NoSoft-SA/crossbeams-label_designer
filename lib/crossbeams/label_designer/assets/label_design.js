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

  // update offset on scroll
  $(document).on('mousewheel', function(event){
    offset = findPos(div_paper);
  });

  // This should be used to set the original values in the case of an existing label design
  var init_width = 700;
  var init_height = 500;

  $('#paper').width(init_width);
  $('#paper').height(init_height);

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
  var currentVariableRectangle = new Konva.Node();

  $( ".resizable" ).resizable({
    resize: function( event, ui ) {
      var height = $(".resizable").height();
      var width = $(".resizable").width();

      doResizeCanvas(width, height);
    }
  });

  $('input#canvas_width').on('change', function(){
    var height = $(".resizable").height();
    var width = parseInt($(this).val());
    $(".resizable").width(width);
    doResizeCanvas( width, height );
  });
  $('input#canvas_height').on('change', function(){
    var height = parseInt($(this).val());
    var width = $(".resizable").width();
    $(".resizable").height(height);
    doResizeCanvas( width, height );
  });

  function doResizeCanvas(width, height){
    // if allowed #TODO - should not be allowed if variables are going to be cut off
    stage.width(width);
    stage.height(height);
    // otherwise return false so that function can be undone
  }

  $(document).on('keyup keydown', function(event){
    shifted = event.shiftKey;
  });

  $(document).on('keyup keydown', function(event){
    controlled = event.ctrlKey;
  });

  // function Apple (type) {
  //   this.type = type;
  //   this.color = "red";
  //   this.getInfo = function() {
  //       return this.color + ' ' + this.type + ' apple';
  //   };
  // }

  // drawing objects
  var drawing='none';

  // manipulating drawn objects
  var hoverMenu=false;
  // var pointer=true;

  div_paper.onmousedown = function(event) {
    updateStartCoords(event);
    if (drawing === 'line'){
      drawLine(event);
    } else if (drawing === 'rectangle'){
      drawRectangle(event);
    } else if (drawing === 'ellipse'){
      drawEllipse(event);
    } else if (drawing === 'textbox'){
      drawTextBox(event);
    } else if (drawing === 'variablebox'){
      drawVariableBox(event);
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
    currentElement.draggable(true);
    $('button[name="text-box"]').removeClass('selected');
  });

  $("input[name='textdemo']").on('input', function(event){
    var nodes = currentElement.getChildren(function(node){
       return node.getClassName() === 'Text';
    });
    console.log(nodes);
    console.log(nodes[0]);
    console.log(nodes[0].text());

    nodes[0].text($(this).val());
    stage.draw();
  });

  $("input[name='textdemo']").on('focusout', function(event){
    currentElement.draggable(true);
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

// All objects can be moved this way, but just making them all draggable(true) should also work
//  I dont know if I can do this all in one go, I think I'll just do it per layer

  // move node in x direction by 1px and y direction by 2px
  // Rectangle, Line
  // node.move({
  //   x: 1,
  //   y: 2)
  // });


// Download Example


// var canvas = document.querySelector("canvas"),
//     context = canvas.getContext("2d");

// var image = new Image;
// image.src = "fallback.svg";
// image.onload = function() {
//   context.drawImage(image, 0, 0);

//   var a = document.createElement("a");
//   a.download = "fallback.png";
//   a.href = canvas.toDataURL("image/png");
//   a.click();
// };


  // $('button[name="pointer"]\
  //     isagndkflbnjodflk\
  //     sdkgsdkbsd\
  //   dgbksldf;gb\
  //   dxocjnblf').click(function(){

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
    if (activateTool(this) === true){
      drawing='variablebox';
    } else {
      drawing='none';
    }
    // filling this in will add demo text to the variable box
    // eventually we want to be able to call the example variables from the database
        // config per installation using
  });

// THESE 3 SHOULD BE IN A CASE
  $('button[name="line"]').click(function(){
    // draw straight line on drag
    // shift should make sure the line snaps to grid horizontally
    // ctrl? should make sure the line snaps to grid vertically
    if ($(this).hasClass('selected')){
      // select current
      $(this).removeClass('selected');
      $('button[name="pointer"]').trigger('click');
      drawing='none';
    } else {
      // select current
      $(this).addClass('selected');
      drawing='line';
    }
  });

  $('button[name="rectangle"]').click(function(){
    // draw rectangle on drag
    // shift should make sure the rectangle remains square
    if ($(this).hasClass('selected')){
      // select current
      $(this).removeClass('selected');
      $('button[name="pointer"]').trigger('click');
      drawing = 'none';
    } else {
      // select current
      $(this).addClass('selected');
      drawing='rectangle';
    }
  });

  // I can either add in ellipse OR call this ellipse and make shift force circle
  $('button[name="ellipse"]').click(function(){
    // draw ellipse on drag
    if ($(this).hasClass('selected')){
      // select current
      $(this).removeClass('selected');
      $('button[name="pointer"]').trigger('click');
      drawing='none';
    } else {
      // select current
      $(this).addClass('selected');
      drawing='ellipse';
    }
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






  // #RESIZE ATTEMPTS
  // set.forEach( function(e) {
  //   if (e[0].nodeName === 'rect') {
  //     e.hover( function(event){

  //       // If bottom left corner
  //         // resize
  //       // else
  //         // move
  //     })
  //     // move || resize
  //   } else {
  //     e.hover( function(event){

  //     }) // crosshair
  //   }
  // });

  // rect.insertBefore('<span class="resize-handle resize-handle-sw">X</span>');
  // document.createElementNS("http://www.w3.org/2000/svg", "rect");
  // $('<tspan class="resize-handle resize-handle-sw"></tspan>').insertAfter(rect);


  function selectableNode(element){
    element.addClass('selected');
    element.draggable(true);
  }

  function nonSelectableNode(element){
    element.removeClass('selected');
    element.draggable(false);
  }

  // ###################### DRAW FUNCTIONS #########################################################
  // Draw the shape based on the current and start coordinates
  function drawLine(event) {
    // initialise and draw
    var line = new Konva.Line({
      points: [startX, startY],
      stroke: 'black',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round'
    });
    currentElement = line;
    div_paper.onmousemove = doDrawLine;
  }

  function doDrawLine(event) {
    if (currentElement) {
      updateCurrentCoords(event);
      // maybe split this out of here
      if (shifted === true){
        currentElement.points([startX, startY, startX, currentY]);
      } else {
        if (controlled === true) {
          currentElement.points([startX, startY, currentX, startY]);
        } else{
          currentElement.points([startX, startY, currentX, currentY]);
        }
      }
      currentElement.draggable(true);
      image_layer.add(currentElement);
      stage.draw();
    }
  }

  // Draw the shape based on the current and start coordinates
  function drawRectangle(event) {
    // initialise and draw
    var rect = new Konva.Rect({
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      fill: '',
      stroke: 'black',
      strokeWidth: 1
    });
    currentElement = rect;
    div_paper.onmousemove = doDrawRectangle;
  }

  function doDrawRectangle(event) {
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
      currentElement.draggable(true);
      image_layer.add(currentElement);
      stage.draw();
    }
  }

// Draw the shape based on the current and start coordinates
  function drawEllipse(event) {
    // initialise and draw
    var ellipse = new Konva.Ellipse({
      x: startX,
      y: startY,
      radius: {
        x: 0,
        y: 0
      },
      fill: '',
      stroke: 'black',
      strokeWidth: 1
    });
    currentElement = ellipse;
    div_paper.onmousemove = doDrawEllipse;
  }

  function doDrawEllipse(event) {
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
      currentElement.draggable(true);

      image_layer.add(currentElement);
      stage.draw();
    }
  }

  // Draw the shape based on the current and start coordinates
  function drawTextBox(event) {
    // initialise and draw
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
    currentElement = text;
    currentElement.addName('editing');
    div_paper.onmousemove = doDrawTextBox;
  }

  function doDrawTextBox(event) {
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
      currentElement.draggable(true);

      image_layer.add(currentElement);
      stage.draw();
    }
  }

  // Draw the shape based on the current and start coordinates
  function drawVariableBox(event) {

    // initialise and draw
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
      strokeWidth: 1
    });

    var group = new Konva.Group();
    group.add(text);
    group.add(rect);
    currentElement = group;

    div_paper.onmousemove = doDrawVariableBox;
  }

  function doDrawVariableBox(event) {
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

      // currentElement.draggable(true);
      variable_layer.add(currentElement);
      variable_group.add(currentElement);
      stage.draw();
    }
  }


  function shape(type){
    var id, types;

    this.type = type;
    this.types = ['Line', 'Circle', 'Rectangle', 'Text'];

    this.initialise = function(){
      if ('Variable' !== type){
        this.primary = initialiseType(type);
      } else {
        this.primary = new Konva.Group()
        text = initialiseType('Text');
        rectangle = initialiseType('Rectangle');
        this.primary.add(text);
        this.primary.add(rectangle);
      }

    }

    this.draw = function(){
    }

    this.select = function(){
    }

    this.deselect = function(){
    }

    this.remove = function(){
    }

    this.rotate = function(){
      var new_rotation = this.rotation() + 90;
      this.primary.rotation(new_rotation);
      stage.draw();
    }

    this.highlightOn = function(){
    }
    this.highlightOff = function(){
    }


    this.text = function(){

    }

    // From Konva objects
    // this.text
    // this.draggable
    // this.fontSize
    // this.fontFamily
    // this.textDecoration
    // this.fontStyle
    // this.rotation
    // this.rectangle
    // this.points
    // this.x
    // this.y
    // this.width
    // this.height
    // this.addName
    // this.image

  }

  function variable(){
    var id, types;

    this.type = 'Variable';

    this.initialise = function(){
      this.primary = initialiseType(type);
    }

    this.draw = function(){
    }

    this.select = function(){
      currentElement = this;
    }

    this.deselect = function(){
    }

    this.remove = function(){
    }

    this.rotate = function(){
    }

    this.highlightOn = function(){
    }
    this.highlightOff = function(){
    }

    this.text = function(){

    }

    // From Konva objects
    // this.text
    // this.draggable
    // this.fontSize
    // this.fontFamily
    // this.textDecoration
    // this.fontStyle
    // this.rotation
    // this.rectangle
    // this.points
    // this.x
    // this.y
    // this.width
    // this.height
    // this.addName
    // this.image

  }
  // ############### END OF DRAW FUNCTIONS #########################################################


  function label(name){
    this.name = name;
    // I need to be able to initialise a label Konva is capable of reinitialising itself but the shapes wont be
    // reinitialised.
  }

  function export_to_json(){
    var label_json;

    console.log(stage.toJSON());
    console.log(generate_xml_file());
    console.log(toImageDataURL());
    return label_json = {
      konva_label: stage.toJSON(),
      xml_string: generate_xml_file(),
      image_string: toImageDataURL()
    }
  }

  $('.btn-download-image').click(function(){
    event.preventDefault();
    var href = toImageDataURL();
    $('#btn-download-image').attr('href', href);
    $('#btn-download-image:first')[0].click();
  });

  function toImageDataURL(){
    var dataURL;
    stage.removeChildren();
    stage.add(image_layer);

    dataURL = stage.toDataURL('image/png');

    stage.add(variable_layer);

    return dataURL;
  }


  function generate_xml_file(){
    var xml_string = 'xml string';

    variable_group.getChildren(function(variable_grouping){
      return variable_grouping.getClassName() === 'Text';
    });



    $("input[name='textdemo']").on('input', function(event){
      var nodes = currentElement.getChildren(function(node){
      });
      console.log(nodes);
      console.log(nodes[0]);
      console.log(nodes[0].text());

      nodes[0].text($(this).val());
      stage.draw();
    });


  // function prepare_xml(){
  //   var context = variable_layer.getContext("2d"); - This would be some other context
  //   var dataURL = context.toDataURL('image/png');
  //   return dataURL;
  // }


  // $('button.generate').click(function(event) {
  //   var xml = "<?xml version='1.0'?><variables>";
  //   set.forEach( function(e) {
  //     xml += "<rect id='" + e.id + "'>";
  //     xml += '<variable_type>' + e.variable_type + '</variable_type>';
  //     xml += '<orientation>' + e.orientation + '</orientation>';
  //     xml += '<startx>' + e.attr('x') + '</startx>';
  //     xml += '<starty>' + e.attr('y') + '</starty>';
  //     xml += '<width>' + e.attr('width') + '</width>';
  //     xml += '<height>' + e.attr('height') + '</height>';
  //     xml += '<fontsize>' + e.font_size + '</fontsize>';
  //     xml += '<fontfamily>' + e.font_family + '</fontfamily>';
  //     xml += '<bold>' + e.bolded + '</bold>';
  //     xml += '<italic>' + e.italic + '</italic>';
  //     xml += '<underline>' + e.underlined + '</underline>';
  //     xml += '</rect>';
  //   });
  //   xml += '</variables>';

  //   console.log(xml);

  // });



  // "<variable>"
  //   "<id>"
  //   "</id>"
  //   "<variable_type>"
  //   "</variable_type>"
  //   "<orientation>"
  //   "</orientation>"
  //   "<startx>"
  //   "</startx>"
  //   "<starty>"
  //   "</starty>"
  //   "<width>"
  //   "</width>"
  //   "<height>"
  //   "</height>"
  //   "<fontsize>"
  //     "<px>"
  //     "</px>"
  //     "<pt>"
  //     "</pt>"
  //   "</fontsize>"
  //   "<fontfamily>"
  //   "</fontfamily>"
  //   "<bold>"
  //   "</bold>"
  //   "<italic>"
  //   "</italic>"
  //   "<underline>"
  //   "</underline>"
  //   "<barcode>"
  //     "<boolean>"
  //     "</boolean>"
  //     "<margin_px>"
  //     "</margin_px>"
  //     "<symbology>"
  //     "</symbology>"
  //   "</barcode>"
  // "</variable>"


    return xml_string;
  }

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
        console.log(data);
        alert('Sorry, but something went wrong');
      }
    });
  });

})();

// $(document).ready( function() {
  // here we can add code for when we have a designed label to load
// });
