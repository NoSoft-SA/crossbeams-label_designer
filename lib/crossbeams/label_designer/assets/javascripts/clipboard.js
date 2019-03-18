Clipboard = (function () {
  let clipboard = '';

  const copyButton = () => document.querySelector('.label-designer-copy-button');
  const pasteButton = () => document.querySelector('.label-designer-paste-button');
  const enableCopyButton = () => {
    copyButton().removeAttribute('disabled');
  };
  const disableCopyButton = () => {
    copyButton().setAttribute('disabled', 'disabled');
  };
  const enablePasteButton = () => {
    pasteButton().removeAttribute('disabled');
  };
  const disablePasteButton = () => {
    pasteButton().setAttribute('disabled', 'disabled');
  };
  const canCopy = (label) => {
    const shape = label.selectedShape();
    return shape;
  };
  const canPaste = () => (clipboard !== '');

  const updateCopyButton = (label) => {
    if (canCopy(label)) {
      enableCopyButton();
    } else {
      disableCopyButton();
    }
  };
  const updatePasteButton = () => {
    if (canPaste()) {
      enablePasteButton();
    } else {
      disablePasteButton();
    }
  };

  document.querySelector('.label-designer-copy-button').addEventListener('click', () => {
    const shape = MyLabel.selectedShape();
    Clipboard.copy(shape);
  });
  document.querySelector('.label-designer-paste-button').addEventListener('click', () => {
    Clipboard.paste(MyLabel);
  });

  const createShapeFromJSON = () => {
    const shape = JSON.parse(clipboard);
    const myShape = new Ld.Shape();
    shape.shapeId = undefined;

    const newGroup = Konva.Node.create(shape.group);
    if (shape.imageID) {
      myShape.shapeId = MyLabel.nextId();
      MyLabel.shapes.push(myShape);
      myShape.reinitialise(newGroup, shape);
      ImageUploader.reUploadImage(shape);
    } else {
      myShape.reinitialise(newGroup, shape);
      MyLabel.shapes.push(myShape);
    }

    if (shape.attrs.name === 'VariableBox') {
      Canvas.variableLayer().add(newGroup);
      MyLabel.variables.push(myShape);
    } else {
      Canvas.imageLayer().add(newGroup);
    }

    MyLabel.selectShape(myShape);
    return myShape;
  };

  const changeCopiedPosition = (newShape) => {
    newShape.group.move({ x: 10, y: 10 });
  };
  const updateClipboard = (shape) => {
    clipboard = JSON.stringify(shape);
  };
  const updateCopyPasteButtons = (label) => {
    updateCopyButton(label);
    updatePasteButton();
  };

  const copy = (shape) => {
    clipboard = JSON.stringify(shape);
    updatePasteButton();
  };
  const paste = (label) => {
    const copiedShape = createShapeFromJSON(label);
    changeCopiedPosition(copiedShape);
    Canvas.drawCanvas();
    updateClipboard(copiedShape);
    UndoRedoModule.registerUndoEvent();
  };

  return {
    copy,
    paste,
    updateCopyPasteButtons,
  };
}());
