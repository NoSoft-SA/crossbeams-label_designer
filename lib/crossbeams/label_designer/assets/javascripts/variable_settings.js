VariableSettings = (function () {
  let varDialog;

  // UI controls
  const variableSelect = document.getElementById('vars');
  const barcodeOptions = document.querySelector('.barcode-options');
  const staticInput = document.getElementById('static_barcode');
  const staticInputValue = document.getElementById('static_barcode_value');
  const barcodeSymbologySel = document.getElementById('barcode_symbology');
  const barcodeBool = document.getElementById('barcode_bool');
  const barcodeText = document.getElementById('barcode_text');
  const barcodeTop = document.getElementById('barcode_top');
  const barcodeWidthFactor = document.getElementById('barcode_width_factor');
  const barcodeMargin = document.getElementById('barcode_margin');
  const varForm = document.querySelector('form.variable-info-form');
  const errBox = document.querySelector('form.variable-info-form .notice');

  const noVarErr = 'Please ensure that a Variable type is saved';
  const noStaticErr = 'Please fill in text for a Static Barcode';

  const toggleBarcodeOptions = (checked) => {
    if (checked) {
      barcodeOptions.removeAttribute('style');
    } else {
      barcodeOptions.setAttribute('style', 'display:none;');
    }
  };

  const save = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      const variableTypeValue = variableSelect.selectr.getValue();
      const barcodeSymbology = barcodeSymbologySel.value;
      const squared = ((barcodeSymbology === 'QR_CODE') || (barcodeSymbology === 'DATA_MATRIX'));

      const currentValues = {
        variableId: shape.shapeId,
        variableType: variableTypeValue,
        staticValue: variableTypeValue === 'Static Barcode' ? staticInputValue.value : null,
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
        isBarcode: String(barcodeBool.checked),
        showBarcodeText: String(barcodeText.checked),
        barcodeTop: barcodeTop.value,
        barcodeWidthFactor: barcodeWidthFactor.value,
        barcodeMargin: barcodeMargin.value,
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
    const variableTypeValue = variableSelect.selectr.getValue();
    if (variableTypeValue) {
      if (variableTypeValue === 'Static Barcode' && staticInputValue.value === '') {
        errBox.textContent = noStaticErr;
        errBox.removeAttribute('style');
      } else {
        save(MyLabel.selectedShape());
        UndoRedoModule.registerUndoEvent();

        varDialog.hide();
        errBox.setAttribute('style', 'display:none;');
      }
    } else {
      errBox.textContent = noVarErr;
      errBox.removeAttribute('style');
    }
  };

  const openDialog = (shape) => {
    if (shape) {
      const varSelectr = variableSelect.selectr;
      varForm.reset();
      varDialog.show();
      const info = shape.attrs;
      if (info) {
        varSelectr.setValue(info.variableType);
        staticInputValue.value = info.staticValue ? info.staticValue : '';
        if (info.isBarcode === 'true') {
          barcodeBool.checked = true;
          toggleBarcodeOptions(true);
          barcodeText.checked = info.showBarcodeText;
          barcodeTop.value = info.barcodeTop;
          barcodeWidthFactor.value = info.barcodeWidthFactor;
          barcodeSymbologySel.value = info.barcodeSymbology;
          barcodeMargin.value = info.barcodeMargin;
          barcodeOptions.removeAttribute('style');
        } else {
          barcodeOptions.setAttribute('style', 'display:none;');
        }
      } else {
        barcodeOptions.setAttribute('style', 'display:none;');
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

  barcodeBool.addEventListener('change', function barcodeChange() {
    toggleBarcodeOptions(this.checked);
  });

  const varChange = (value) => {
    if (value === 'Static Barcode') {
      staticInput.style.display = 'flex';
      staticInputValue.required = true;
      barcodeBool.checked = true;
      toggleBarcodeOptions(true);
      barcodeBool.disabled = true;
    } else {
      staticInputValue.required = false;
      staticInput.style.display = 'none';
      barcodeBool.disabled = false;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const holdSel = new Selectr(variableSelect, {
      customClass: 'cbl-input',
      defaultSelected: true,
      allowDeselect: false,
      clearable: true,
      // width: 'notset',
    });
    // Store a reference on the DOM node.
    variableSelect.selectr = holdSel;

    holdSel.on('selectr.change', (option) => {
      varChange(option === null ? null : option.value);
    });

    const dialogEl = document.getElementById('variable-info-dialog-form');
    varDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
    varDialog.on('hide', () => {
      const shape = MyLabel.selectedShape();
      if (shape.attrs.variableType === '0') {
        varDialog.show();
        errBox.textContent = noVarErr;
        errBox.removeAttribute('style');
      } else {
        errBox.setAttribute('style', 'display:none;');
        varForm.reset();
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
