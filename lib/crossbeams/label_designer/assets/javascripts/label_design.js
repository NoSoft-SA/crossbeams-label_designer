(function () {
  'use strict'

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

  function startUpCanvas() {
    Canvas.initialise();
    document.querySelector('#canvas_width').addEventListener('change', function () {
      Canvas.doResizeCanvas(parseInt(this.value), Canvas.resizableElement().height);
      Library.afterUndoable();
    });
    document.querySelector('#canvas_height').addEventListener('change', function () {
      Canvas.doResizeCanvas(Canvas.resizableElement().width, parseInt(this.value));
      Library.afterUndoable();
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

  $('.labelname').text(Library.toTitleCase(labelConfig.labelName));
  $('.text-popup').hide();
  $('.barcode-options').hide();
  $('.variable-popup').hide();

  document.addEventListener('keyup keydown', event => { drawEnv.shifted = event.shiftKey } );
  document.addEventListener('keyup keydown', event => { drawEnv.controlled = event.ctrlKey } );
  document.addEventListener('keydown', event => {
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
  document.addEventListener('keydown', event => {
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
    Library.afterUndoable();
  });
  document.querySelector('[id=font-family]').addEventListener('change', function () {
    myLabel.selectedShape().updateText('fontFamily', this.value);
    myLabel.selectedShape().saveVariableSettings();
    Canvas.drawCanvas();
    Library.afterUndoable();
  });

  document.querySelectorAll('[data-alignment]').forEach(function(elem) {
    elem.addEventListener('click', function() {
      myLabel.selectedShape().textBox.align(this.dataset.alignment);
      myLabel.selectedShape().saveVariableSettings();
      Canvas.drawCanvas();
      Library.afterUndoable();
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
    Library.afterUndoable();
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
    Library.afterUndoable();
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
    Library.afterUndoable();
  });

  // VARIABLE FORM FUNCTIONS
  $('#textinput, #vars, #barcode_margin, #barcode_symbology').on('change', () => {
    myLabel.selectedShape().saveVariableSettings();
    Library.afterUndoable();
  });

  $('#barcode_bool').on('change', function () {
    if ($(this).val() === 'true') {
      $('.barcode-options').show();
    } else {
      $('.barcode-options').hide();
    }
    myLabel.selectedShape().saveVariableSettings();
    Library.afterUndoable();
  });

  $('#stroke-width').on('change', function () {
    myLabel.selectedShape().drawnShape.strokeWidth($(this).val());
    Canvas.drawCanvas();
    Library.afterUndoable();
  });
  $("button[name='remove']").click(() => {
    myLabel.selectedShape().remove();
  });
  $('button.rotate').click(() => {
    myLabel.selectedShape().rotate();
    myLabel.selectedShape().saveVariableSettings();
  });

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
            const myShape = myLabel.newShape('Image', {imageObject: img, width: this.width, height: this.height});
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
    labelSet.openLabel(labelConfig);
    myLabel = labelSet.currentLabel();
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
