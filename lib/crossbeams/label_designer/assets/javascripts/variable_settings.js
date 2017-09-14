VariableSettings = (function() {
  'use strict'

  $('#variable-info-dialog-form').on('close.popupwindow', function() {
    document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
    document.querySelector('form.variable-info-form').reset();
    document.querySelector('#textinput').focus();
  });

  document.querySelector('.btn-variable-settings').addEventListener('click', () => {
    const shape = MyLabel.selectedShape()
    if (shape.variableBoxType()) {
      VariableSettings.openDialog(shape);
    } else {
      this.setAttribute('style', 'display:none;');
    }
  });

  document.querySelector('#variable-info-dialog-form button.save').addEventListener('click', function() {
    dialogSaveButton();
  });

  const dialogSaveButton = () => {
    const variableTypeSelect = document.querySelector('#vars')
    const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value

    if (variableTypeValue !== '0') {
      saveVariableSettings(MyLabel.selectedShape());
      UndoRedoModule.registerUndoEvent();

      $('#variable-info-dialog-form').PopupWindow('close');
      document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
    } else {
      document.querySelector('form.variable-info-form .notice').removeAttribute('style');
    }
  }

  const openDialog = (shape) => {
    document.querySelector('form.variable-info-form').reset();
    $('#variable-info-dialog-form').PopupWindow({title: 'Variable Settings', autoOpen: false, height: 400, width: 350, modal: true });
    $('#variable-info-dialog-form').PopupWindow('open');
    const info = shape.savedVariableSettings;
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

  const saveVariableSettings = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      const variableTypeSelect = document.querySelector('#vars')
      const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value

      shape.savedVariableSettings = {
        variableId: shape.shapeId,
        variableType: variableTypeValue,
        rotationAngle: (shape.group.rotation() % 360),
        position: pos,
        startX: pos.x0,
        startY: pos.y0,
        width: (pos.x1 - pos.x0),
        height: (pos.y1 - pos.y0),
        fontSizePx: shape.textBox.fontSize(),
        fontSizePt: shape.fontSizePt(shape.textBox.fontSize()),
        alignment: shape.textBox.align(),
        fontFamily: shape.savedTextSettings.fontFamily,
        bold: shape.savedTextSettings.bold,
        italic: shape.savedTextSettings.italic,
        underline: (shape.textBox.textDecoration() === 'underline'),
        isBarcode: document.querySelector('[name="barcode_bool"]:checked').value,
        barcodeMargin: document.querySelector('#barcode_margin').value,
        barcodeSymbology: document.querySelector('#barcode_symbology').value
      };
      UndoRedoModule.registerUndoEvent();
    }
  }

  return {
    saveVariableSettings,
    openDialog
  };

})();
