TextSettings = (function () {
  document.querySelector('#textinput').addEventListener('input', function txtInput() {
    MyLabel.selectedShape().textBox.text(this.value);
    Canvas.drawCanvas();
  });
  document.querySelector('#textinput').addEventListener('change', () => {
    UndoRedoModule.registerUndoEvent();
  });
  document.querySelector('#font-size').addEventListener('change', function sizeChange() {
    MyLabel.selectedShape().textBox.fontSize(this.value);
    VariableSettings.update('font-size');
    TextSettings.afterAction();
  });
  document.querySelector('[id=font-family]').addEventListener('change', function fontChange() {
    TextSettings.updateText('fontFamily', this.value);
    TextSettings.afterAction();
  });
  document.querySelectorAll('[data-alignment]').forEach((elem) => {
    elem.addEventListener('click', function alignClick() {
      document.querySelectorAll('[data-alignment]').forEach((daElem) => {
        daElem.dataset.selected = false;
      });
      this.dataset.selected = true;
      MyLabel.selectedShape().textBox.align(this.dataset.alignment);
      VariableSettings.update('alignment');
      TextSettings.afterAction();
    });
  });
  ['bold', 'underline', 'italic'].forEach((textType) => {
    document.querySelector(`button.${textType}`).addEventListener('click', function decorationClick() {
      const newValue = !Library.parseBool(this.dataset.selected);
      this.dataset.selected = newValue;
      TextSettings.updateText(`${textType}`, newValue);
      TextSettings.afterAction();
    });
  });

  const getFontFamily = (shape) => {
    const fontFamily = shape.attrs.fontFamily;
    if (fontFamily.startsWith('A')) {
      return 'arial';
    } else if (fontFamily.startsWith('C')) {
      return 'cour';
    } else if (fontFamily.startsWith('L')) {
      return 'lato';
    }
    return 'tnr';
  };
  const getFontOption = (shape) => {
    const settings = shape.attrs;
    let fontOption = 'normal';
    if (settings.bold && settings.italic) {
      fontOption = 'boldItalic';
    } else if (settings.bold) {
      fontOption = 'bold';
    } else if (settings.italic) {
      fontOption = 'italic';
    }
    return fontOption;
  };
  const displayFont = (fontOptions) => {
    const fontFamilies = {
      arial: {
        normal: 'Arial',
        bold: 'ArialB',
        italic: 'ArialI',
        boldItalic: 'ArialBI',
      },
      cour: {
        normal: 'Cour',
        bold: 'CourB',
        italic: 'CourI',
        boldItalic: 'CourBI',
      },
      lato: {
        normal: 'LatoL',
        bold: 'LatoLB',
        italic: 'LatoLI',
        boldItalic: 'LatoLBI',
      },
      tnr: {
        normal: 'TNR',
        bold: 'TNRB',
        italic: 'TNRI',
        boldItalic: 'TNRBI',
      },
    };
    return fontFamilies[fontOptions.font][fontOptions.styleOption];
  };
  const updateDisplayFont = (shape) => {
    const fontOptions = {
      font: getFontFamily(shape),
      styleOption: getFontOption(shape),
    };
    shape.textBox.fontFamily(displayFont(fontOptions));
    Canvas.drawCanvas();
  };
  const updateText = (attribute, value) => {
    const shape = MyLabel.selectedShape();
    if (shape) {
      shape.attrs[attribute] = value;
      if (attribute === 'underline') {
        shape.textBox.textDecoration((value ? 'underline' : ''));
        Canvas.drawCanvas();
      } else {
        updateDisplayFont(shape);
      }
    }
  };
  const afterAction = () => {
    Canvas.drawCanvas();
    UndoRedoModule.registerUndoEvent();
  };

  const focusTextbox = () => {
    const currentScroll = document.querySelector('.designer-container').scrollTop;
    document.querySelector('#textinput').focus();
    document.querySelector('.designer-container').scrollTop = currentScroll;
  };

  return {
    updateText,
    afterAction,
    focusTextbox,
  };
}());
