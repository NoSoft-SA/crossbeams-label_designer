TextSettings = (function () {
  document.querySelector('#textinput').addEventListener('input', function () {
    MyLabel.selectedShape().textBox.text(this.value);
    Canvas.drawCanvas();
  });
  document.querySelector('#textinput').addEventListener('change', () => {
    UndoRedoModule.registerUndoEvent();
  });
  document.querySelector('#font-size').addEventListener('change', function () {
    MyLabel.selectedShape().textBox.fontSize(this.value);
    VariableSettings.update('font-size');
    TextSettings.afterAction();
  });
  document.querySelector('[id=font-family]').addEventListener('change', function () {
    TextSettings.updateText('fontFamily', this.value);
    TextSettings.afterAction();
  });
  document.querySelectorAll('[data-alignment]').forEach((elem) => {
    elem.addEventListener('click', function () {
      document.querySelectorAll('[data-alignment]').forEach((elem) => {
        elem.dataset.selected = false;
      });
      this.dataset.selected = true;
      MyLabel.selectedShape().textBox.align(this.dataset.alignment);
      VariableSettings.update('alignment');
      TextSettings.afterAction();
    });
  });
  ['bold', 'underline', 'italic'].forEach((textType) => {
    document.querySelector(`button.${textType}`).addEventListener('click', function () {
      const newValue = !Library.parseBool(this.dataset.selected);
      this.dataset.selected = newValue;
      TextSettings.updateText(`${textType}`, newValue);
      TextSettings.afterAction();
    });
  });

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
  const updateDisplayFont = (shape) => {
    const fontOptions = {
      font: getFontFamily(shape),
      styleOption: getFontOption(shape),
    };
    shape.textBox.fontFamily(displayFont(fontOptions));
    Canvas.drawCanvas();
  };
  const getFontFamily = (shape) => {
    const fontFamily = shape.attrs.fontFamily;
    return (fontFamily.startsWith('A') ? 'arial' : (fontFamily.startsWith('C') ? 'cour' : 'tnr'));
  };
  const getFontOption = (shape) => {
    const settings = shape.attrs;
    let fontOption;
    if (settings.bold && settings.italic) {
      fontOption = 'boldItalic';
    } else {
      fontOption = (settings.bold ? 'bold' : (settings.italic ? 'italic' : 'normal'));
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
      tnr: {
        normal: 'TNR',
        bold: 'TNRB',
        italic: 'TNRI',
        boldItalic: 'TNRBI',
      },
    };
    return fontFamilies[fontOptions.font][fontOptions.styleOption];
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
