VariableSettings = (function () {
  let varDialog;

  const save = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      const variableTypeValue = document.querySelector('#vars').selectr.getValue();
      const barcodeSymbology = document.querySelector('#barcode_symbology').value;
      const staticBarcode = document.querySelector('#static_barcode_value');
      const squared = ((barcodeSymbology === 'QR_CODE') || (barcodeSymbology === 'DATA_MATRIX'));

      const currentValues = {
        variableId: shape.shapeId,
        variableType: variableTypeValue,
        staticValue: variableTypeValue === 'Static Barcode' ? staticBarcode.value : null,
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
        barcodeTop: document.querySelector('[name="barcode_top"]:checked').value,
        barcodeWidthFactor: document.querySelector('#barcode_width_factor').value,
        barcodeMargin: document.querySelector('#barcode_margin').value,
        barcodeSymbology,
      };
      Object.keys(currentValues).forEach((prop) => {
        shape.attrs[prop] = currentValues[prop];
      });
      if (squared) {
        DrawApp.ensureSquared(shape);
      } else {
        shape.attrs.squareConstraint = false;
      }
      UndoRedoModule.registerUndoEvent();
      // console.log(MyLabel.generateXMLFile());
    }
  };

  const dialogSaveButton = () => {
    const variableTypeValue = document.querySelector('#vars').selectr.getValue();
    if (variableTypeValue) {
      if (variableTypeValue === 'Static Barcode' && document.querySelector('#static_barcode_value').value === '') {
        document.querySelector('form.variable-info-form .notice').removeAttribute('style');
      } else {
        save(MyLabel.selectedShape());
        UndoRedoModule.registerUndoEvent();

        varDialog.hide();
        document.querySelector('form.variable-info-form .notice').setAttribute('style', 'display:none;');
      }
    } else {
      document.querySelector('form.variable-info-form .notice').removeAttribute('style');
    }
  };

  const openDialog = (shape) => {
    if (shape) {
      const varSelectr = document.querySelector('#vars').selectr;
      document.querySelector('form.variable-info-form').reset();
      varDialog.show();
      const info = shape.attrs;
      if (info) {
        varSelectr.setValue(info.variableType);
        // varSelectr.off('selectr.change');
        // varSelectr.on('selectr.change', (option) => {
        //   console.log('change', option);
        // });
        document.querySelector('#static_barcode_value').value = info.staticValue ? info.staticValue : '';
        if (info.isBarcode === 'true') {
          document.querySelector('input[name="barcode_bool"][value="true"]').checked = 'checked';
          document.querySelector(`input[name='barcode_text'][value='${info.showBarcodeText}']`).checked = 'checked';
          document.querySelector(`input[name='barcode_top'][value='${info.barcodeTop}']`).checked = 'checked';
          document.querySelector('#barcode_width_factor').value = info.barcodeWidthFactor;
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

  const update = (attribute) => {
    const shape = MyLabel.selectedShape();
    if (shape.variableBoxType()) {
      const settings = shape.attrs;
      const pos = Library.actualPosition(shape.group);
      settings.variableId = shape.shapeId;
      switch (attribute) {
        case 'position':
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
        default:
          break;
      }
    }
  };

  document.querySelectorAll('input[name="barcode_bool"]').forEach((elem) => {
    elem.addEventListener('click', function barcodeClick() {
      if (this.value === 'true') {
        document.querySelector('.barcode-options').removeAttribute('style');
      } else {
        document.querySelector('.barcode-options').setAttribute('style', 'display:none;');
      }
    });
  });

  const varChange = (value) => {
    const staticInput = document.querySelector('#static_barcode');
    const staticInputValue = document.querySelector('#static_barcode_value');
    if (value === 'Static Barcode') {
      staticInput.style.display = 'block';
      staticInputValue.required = true;
      document.querySelector('[name="barcode_bool"]').checked = true;
      document.querySelector('[name="barcode_bool"]').click();
      document.querySelector('[name="barcode_bool"][value="true"]').disabled = true;
      document.querySelector('[name="barcode_bool"][value="false"]').disabled = true;
    } else {
      staticInputValue.required = false;
      staticInput.style.display = 'none';
      document.querySelector('[name="barcode_bool"][value="true"]').disabled = false;
      document.querySelector('[name="barcode_bool"][value="false"]').disabled = false;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const variableTypes = document.querySelector('#vars');
    const holdSel = new Selectr(variableTypes, {
      customClass: 'cbl-input',
      defaultSelected: true,
      allowDeselect: false,
      clearable: true,
      // width: 'notset',
    });
    // Store a reference on the DOM node.
    variableTypes.selectr = holdSel;

    holdSel.on('selectr.change', (option) => {
      varChange(option === null ? null : option.value);
    });

    const dialogEl = document.getElementById('variable-info-dialog-form');
    varDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
    varDialog.on('hide', () => {
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

  const preventOverlap = (shape) => {
    if (shape.variableBoxType() && Library.overlap(shape.outerBox)) {
      return DrawApp.setToTemporaryPosition(shape);
    }
    return false;
  };

  return {
    save,
    update,
    openDialog,
    preventOverlap,
  };
}());
