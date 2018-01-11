VariableSettings = (function () {
  let varDialog;

  document.addEventListener('DOMContentLoaded', () => {
    const dialogEl = document.getElementById('variable-info-dialog-form');
    varDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
    varDialog.on('hide', (dialogEl, event) => {
      const shape = MyLabel.selectedShape();
      if (shape.attrs.variableType === '0') {
        varDialog.show();
        document.querySelector('form.variable-info-form .notice').removeAttribute('style');
      } else {
        document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
        document.querySelector('form.variable-info-form').reset();
        TextSettings.focusTextbox();
      }
    });
  });

  document.querySelector('.btn-variable-settings').addEventListener('click', () => {
    const shape = MyLabel.selectedShape();
    if (shape.variableBoxType()) {
      VariableSettings.openDialog(shape);
    } else {
      this.style = 'display:none;';
    }
  });

  document.querySelector('#variable-info-dialog-form button.save').addEventListener('click', () => {
    dialogSaveButton();
  });

  const dialogSaveButton = () => {
    const variableTypeSelect = document.querySelector('#vars');
    const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value;

    if (variableTypeValue !== '0') {
      save(MyLabel.selectedShape());
      UndoRedoModule.registerUndoEvent();

      varDialog.hide();
      document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
    } else {
      document.querySelector('form.variable-info-form .notice').removeAttribute('style');
    }
  };

  const openDialog = (shape) => {
    if (shape) {
      document.querySelector('form.variable-info-form').reset();
      varDialog.show();
      const info = shape.attrs;
      if (info) {
        const variableTypeOption = document.querySelector(`#vars option[value="${info.variableType}"]`);
        document.querySelector('#vars').selectedIndex = (variableTypeOption ? variableTypeOption.index : 0);
        if (info.isBarcode === 'true') {
          document.querySelector('input[name="barcode_bool"][value="true"]').checked = 'checked';
          document.querySelector(`input[name='barcode_text'][value='${info.showBarcodeText}']`).checked = 'checked';
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
  };

  const save = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      const variableTypeSelect = document.querySelector('#vars');
      const variableTypeValue = variableTypeSelect.options[variableTypeSelect.selectedIndex].value;
      const barcodeSymbology = document.querySelector('#barcode_symbology').value;
      const squared = ((barcodeSymbology === 'QR_CODE') || (barcodeSymbology === 'DATA_MATRIX'));

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
        showBarcodeText: document.querySelector('[name="barcode_text"]:checked').value,
        barcodeMargin: document.querySelector('#barcode_margin').value,
        barcodeSymbology,
      };
      for (const prop in currentValues) {
        shape.attrs[prop] = currentValues[prop];
      }
      if (squared) {
        DrawApp.ensureSquared(shape);
      } else {
        shape.attrs.squareConstraint = false;
      }
      UndoRedoModule.registerUndoEvent();
      // console.log(MyLabel.generateXMLFile());
    }
  };

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
  };

  document.querySelectorAll('input[name="barcode_bool"]').forEach((elem) => {
    elem.addEventListener('click', function () {
      if (this.value === 'true') {
        document.querySelector('.barcode-options').removeAttribute('style');
      } else {
        document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
      }
    });
  });


  const preventOverlap = shape => ((shape.variableBoxType() && Library.overlap(shape.outerBox)) ? DrawApp.setToTemporaryPosition(shape) : false);

  return {
    save,
    update,
    openDialog,
    preventOverlap,
  };
}());
