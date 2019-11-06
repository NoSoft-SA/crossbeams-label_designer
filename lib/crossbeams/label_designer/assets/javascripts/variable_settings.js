VariableSettings = (function () {
  let varDialog;

  // UI controls
  const variableSelect = document.querySelector('#vars');
  const barcodeOptions = document.querySelector('.barcode-options');
  const compoundVars = document.querySelector('#compound_vars');
  const compoundSel = document.querySelector('#varsCmp');
  const compoundTxt = document.querySelector('#textCmp');
  const compoundRes = document.querySelector('#compound_result');
  const compoundDisp = document.querySelector('#compound_display');
  const staticInput = document.querySelector('#static_barcode');
  const staticInputValue = document.querySelector('#static_barcode_value');
  const barcodeSymbologySel = document.querySelector('#barcode_symbology');
  const barcodeBoolWrapper = document.querySelector('#barcode_bool_wrapper');
  const barcodeBool = document.querySelector('#barcode_bool');
  const barcodeText = document.querySelector('#barcode_text');
  const barcodeTop = document.querySelector('#barcode_top');
  const barcodeWidthFactor = document.querySelector('#barcode_width_factor');
  const barcodeMargin = document.querySelector('#barcode_margin');
  const varForm = document.querySelector('form.variable-info-form');
  const errBox = document.querySelector('form.variable-info-form .notice');

  // Error messages
  const noVarErr = 'Please ensure that a Variable type is saved';
  const noStaticErr = 'Please fill in text for a Static Barcode';

  const toggleBarcodeOptions = (checked) => {
    if (checked) {
      barcodeOptions.style.display = 'block';
    } else {
      barcodeOptions.style.display = 'none';
    }
  };

  const toggleErrorNotice = (show) => {
    if (show) {
      errBox.style.display = 'block';
    } else {
      errBox.style.display = 'none';
    }
  };

  const clearCompoundTexts = () => {
    // compoundSel.selectr.clear();
    // compoundSel.selectr.clearChoices();
    compoundTxt.value = '';
    compoundRes.value = 'CMP:';
    compoundDisp.textContent = '';
  };

  const save = (shape) => {
    if (shape.variableBoxType()) {
      const pos = Library.actualPosition(shape.group);

      // let variableTypeValue = variableSelect.selectr.getValue();
      let variableTypeValue = variableSelect.selectr.getValue(true);
      const barcodeSymbology = barcodeSymbologySel.value;
      const squared = ((barcodeSymbology === 'QR_CODE') || (barcodeSymbology === 'DATA_MATRIX'));

      if (variableTypeValue === 'Compound Variable') {
        // For a compound, store "CMP:${var} / ${var}" instead of "Compound Variable"
        variableTypeValue = compoundRes.value;
      }

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
    }
  };

  const dialogSaveButton = () => {
    // const variableTypeValue = variableSelect.selectr.getValue();
    const variableTypeValue = variableSelect.selectr.getValue(true);
    if (variableTypeValue) {
      if (variableTypeValue === 'Static Barcode' && staticInputValue.value === '') {
        errBox.textContent = noStaticErr;
        toggleErrorNotice(true);
      } else {
        save(MyLabel.selectedShape());
        UndoRedoModule.registerUndoEvent();

        varDialog.hide();
        toggleErrorNotice(false);
      }
    } else {
      errBox.textContent = noVarErr;
      toggleErrorNotice(true);
    }
  };

  const openDialog = (shape) => {
    if (shape) {
      const varSelectr = variableSelect.selectr;
      varForm.reset();
      varDialog.show();
      const info = shape.attrs;
      let varName;
      if (info) {
        varName = info.variableType;
        if (varName.indexOf('CMP:') === 0) {
          compoundRes.value = varName;
          compoundDisp.textContent = varName.replace(/CMP:|[${}]/g, '');
          varName = 'Compound Variable';
          compoundVars.hidden = false;
          barcodeBoolWrapper.hidden = true;
        } else {
          compoundVars.hidden = true;
          clearCompoundTexts();
          barcodeBoolWrapper.hidden = false;
        }
        // varSelectr.setValue(varName);
        varSelectr.setChoiceByValue(varName);
        staticInputValue.value = info.staticValue ? info.staticValue : '';
        if (info.isBarcode === 'true') {
          barcodeBool.checked = true;
          toggleBarcodeOptions(true);
          barcodeText.checked = info.showBarcodeText === 'true';
          barcodeTop.value = info.barcodeTop;
          barcodeWidthFactor.value = info.barcodeWidthFactor;
          barcodeSymbologySel.value = info.barcodeSymbology;
          barcodeMargin.value = info.barcodeMargin;
        } else {
          toggleBarcodeOptions(false);
        }
      } else {
        toggleBarcodeOptions(false);
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
      barcodeBoolWrapper.hidden = false;
      compoundVars.hidden = true;
      clearCompoundTexts();
    } else if (value === 'Compound Variable') {
      staticInputValue.required = false;
      staticInput.style.display = 'none';
      barcodeBool.disabled = false;
      barcodeBool.checked = false;
      barcodeBoolWrapper.hidden = true;
      toggleBarcodeOptions(false);
      compoundVars.hidden = false;
    } else {
      staticInputValue.required = false;
      staticInput.style.display = 'none';
      barcodeBool.disabled = false;
      barcodeBoolWrapper.hidden = false;
      compoundVars.hidden = true;
      clearCompoundTexts();
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // const holdSel = new Selectr(variableSelect, {
    //   customClass: 'cbl-input',
    //   defaultSelected: true,
    //   allowDeselect: false,
    //   clearable: true,
    //   // width: 'notset',
    // });
    const holdSel = new Choices(variableSelect, {
      searchEnabled: true,
      searchResultLimit: 100,
      removeItemButton: false,
      renderSelectedChoices: 'always',
      itemSelectText: '',
      classNames: {
        containerOuter: 'choices cbl-input',
        containerInner: 'choices__inner_cbl',
        highlightedState: 'is-highlighted_cbl',
      },
      shouldSort: false,
      searchFields: ['label'],
      fuseOptions: {
        include: 'score',
        threshold: 0.25,
      },
    });
    // Store a reference on the DOM node.
    variableSelect.selectr = holdSel;

    // holdSel.on('selectr.change', (option) => {
    //   varChange(option === null ? null : option.value);
    // });
    variableSelect.addEventListener('change', (event) => {
      // varChange(option === null ? null : event.detail.value);
      varChange(event.detail.value);
    });

    // const holdCmpSel = new Selectr(compoundSel, {
    //   customClass: 'cbl-input',
    //   defaultSelected: true,
    //   allowDeselect: false,
    //   clearable: true,
    //   width: 'notset',
    // });
    const holdCmpSel = new Choices(compoundSel, {
      searchEnabled: true,
      searchResultLimit: 100,
      removeItemButton: true,
      itemSelectText: '',
      classNames: {
        containerOuter: 'choices cbl-input',
        containerInner: 'choices__inner_cbl',
        highlightedState: 'is-highlighted_cbl',
      },
      shouldSort: false,
      searchFields: ['label'],
      fuseOptions: {
        include: 'score',
        threshold: 0.25,
      },
    });
    // Store a reference on the DOM node.
    compoundSel.selectr = holdCmpSel;

    const dialogEl = document.getElementById('variable-info-dialog-form');
    varDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
    varDialog.on('hide', () => {
      const shape = MyLabel.selectedShape();
      if (shape.attrs.variableType === '0') {
        varDialog.show();
        errBox.textContent = noVarErr;
        toggleErrorNotice(true);
      } else {
        toggleErrorNotice(false);
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

  /*
   * Build up a compound variable when the user presses the add or clear buttons.
   */
  compoundVars.addEventListener('click', (event) => {
    const elem = event.target.closest('[type=button]');
    if (!elem) {
      return;
    }
    if (compoundRes.value === '') {
      compoundRes.value = 'CMP:';
    }
    if (elem.name === 'add_compound_sel') {
      // compoundDisp.textContent += compoundSel.selectr.getValue();
      // compoundRes.value += `\${${compoundSel.selectr.getValue()}}`;
      compoundDisp.textContent += compoundSel.selectr.getValue(true);
      compoundRes.value += `\${${compoundSel.selectr.getValue(true)}}`;
    }
    if (elem.name === 'add_compound_txt') {
      compoundDisp.textContent += compoundTxt.value;
      compoundRes.value += compoundTxt.value;
    }
    if (elem.name === 'clear_compound') {
      compoundDisp.textContent = '';
      compoundRes.value = 'CMP:';
    }
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
