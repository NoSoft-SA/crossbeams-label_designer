VariableSettings = (function() {
  'use strict'

  $('#variable-info-dialog-form').on('close.popupwindow', function() {
    const shape = MyLabel.selectedShape()
    if (shape.attrs.variableType === '0') {
      $('#variable-info-dialog-form').PopupWindow('open');
      document.querySelector('form.variable-info-form .notice').removeAttribute('style');
    } else {
      document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
      document.querySelector('form.variable-info-form').reset();
      TextSettings.focusTextbox();
    }
  });

  document.querySelector('.btn-variable-settings').addEventListener('click', () => {
    const shape = MyLabel.selectedShape()
    if (shape.variableBoxType()) {
      VariableSettings.openDialog(shape);
    } else {
      this.style = 'display:none;';
    }
  });

  document.querySelector('#variable-info-dialog-form button.save').addEventListener('click', function() {
    dialogSaveButton();
  });

  const dialogSaveButton = () => {
    const variableTypeSelect = document.querySelector('#vars')
    const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value

    if (variableTypeValue !== '0') {
      save(MyLabel.selectedShape());
      UndoRedoModule.registerUndoEvent();

      $('#variable-info-dialog-form').PopupWindow('close');
      document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
    } else {
      document.querySelector('form.variable-info-form .notice').removeAttribute('style');
    }
  }

  const openDialog = (shape) => {
    if (shape) {
      document.querySelector('form.variable-info-form').reset();
      $('#variable-info-dialog-form').PopupWindow({title: 'Variable Settings', autoOpen: false, height: 400, width: 350, modal: true });
      $('#variable-info-dialog-form').PopupWindow('open');
      const info = shape.attrs;
      if (info) {
        const variableTypeOption = document.querySelector(`#vars option[value="${info.variableType}"]`);
        document.querySelector('#vars').selectedIndex = (variableTypeOption ? variableTypeOption.index : 0);
        if (info.isBarcode === 'true') {
          document.querySelector('input[name="barcode_bool"][value="true"]').checked = 'checked';
          document.querySelector('#barcode_symbology').value = info.barcodeSymbology;
          document.querySelector('#barcode_margin').value = info.barcodeMargin;
          document.querySelector('.barcode-options').removeAttribute('style');
        } else {
          document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
        }
      } else {
        document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
      }
    }
  }

  const save = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      const variableTypeSelect = document.querySelector('#vars')
      const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value
      const squared = ( (variableTypeValue === 'QR_CODE') || (variableTypeValue === 'DATA_MATRIX') )
      const currentValues = {
        variableId: shape.shapeId,
        variableType: variableTypeValue,
        rotationAngle: (shape.group.rotation() % 360),
        position: pos,
        startX: pos.x0,
        startY: pos.y0,
        width: (pos.x1 - pos.x0),
        height: (pos.y1 - pos.y0),
        fontSizePx: shape.textBox.fontSize(),
        fontSizePt: fontSizes[shape.textBox.fontSize()],
        alignment: shape.textBox.align(),
        fontFamily: shape.attrs.fontFamily,
        bold: shape.attrs.bold,
        italic: shape.attrs.italic,
        underline: (shape.textBox.textDecoration() === 'underline'),
        isBarcode: document.querySelector('[name="barcode_bool"]:checked').value,
        barcodeMargin: document.querySelector('#barcode_margin').value,
        barcodeSymbology: document.querySelector('#barcode_symbology').value,
        squareConstraint: squared
      };
      for (const prop in currentValues) {
        shape.attrs[prop] = currentValues[prop];
      }
      UndoRedoModule.registerUndoEvent();
    }
  }

  const update = (attribute) => {
    const shape = MyLabel.selectedShape();
    if (shape.variableBoxType()) {
      const settings = shape.attrs;
      switch (attribute) {
        case 'position':
          const pos = Library.actualPosition(shape.group);
          settings.position = pos;
          settings.startX = pos.x0;
          settings.startY = pos.y0;
          settings.width = (pos.x1 - pos.x0);
          settings.height = (pos.y1 - pos.y0);
          break;
        case 'rotation':
          settings.rotationAngle = (shape.group.rotation() % 360);
          break;
        case 'font-size':
          settings.fontSizePx = shape.textBox.fontSize();
          settings.fontSizePt = fontSizes[shape.textBox.fontSize()];
          break;
        case 'alignment':
          settings.alignment = shape.textBox.align();
          break;
      }
    }
  }

  document.querySelectorAll('input[name="barcode_bool"]').forEach(function(elem) {
    elem.addEventListener('click', function() {
      if (this.value === 'true') {
        document.querySelector('.barcode-options').removeAttribute('style');
      } else {
        document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
      }
    });
  });


  const preventOverlap = (shape) => {
    return ((shape.variableBoxType() && Library.overlap(shape.outerBox)) ? DrawApp.setToTemporaryPosition(shape) : false);
  }

  return {
    save,
    update,
    openDialog,
    preventOverlap
  };

})();
