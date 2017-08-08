const Library = (function() {
  'use strict'

  const actualPosition = (group) => {
    // Meant for variables
    const rect = this.getChildOfType('Rect', group);
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

  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  const setCursorName = (cursorName) => {
    document.body.style.cursor = cursorName;
  }
  const getCursorName = () => {
    return document.body.style.cursor;
  }

  const getChildOfType = (type, group) => {
    const child = this.getChildrenOfType(type, group);
    return child[0];
  }
  const getChildrenOfType = (type, group) => {
    const children = group.getChildren(node => node.getClassName() === type);
    return children;
  }

  const afterUndoable = () => {
    UndoRedoModule.registerUndoEvent(myLabel);
  }

  const overlap = (rectangle) => {
    const overlap = [];
    const set = [];

    const rectGroup = rectangle.findAncestor('Group');
    const rectPosition = Library.actualPosition(rectGroup);

    Canvas.variableLayer().getChildren().forEach((group) => {
      const object = Library.actualPosition(group);
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

  const toggleOptions = () => {
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

  const populateForm = (shape) => {
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

  return {
    actualPosition,
    toTitleCase,
    setCursorName,
    getCursorName,
    getChildOfType,
    getChildrenOfType,
    afterUndoable,
    overlap,
    toggleOptions,
    populateForm
  };

})();
