Clipboard = (function () {
  let clipboard = '';

  document.querySelector('.label-designer-copy-button').addEventListener('click', () => {
    const shape = MyLabel.selectedShape();
    Clipboard.copy(shape);
  });
  document.querySelector('.label-designer-paste-button').addEventListener('click', () => {
    Clipboard.paste(MyLabel, new Shape());
  });

  const copy = (shape) => {
    clipboard = JSON.stringify(shape);
    updatePasteButton();
  };
  const paste = (label, newShape) => {
    const copiedShape = newShape.loadFromJSON(clipboard);
    addShapeToLabel(copiedShape, label);
    changeCopiedPosition(copiedShape);
    Canvas.drawCanvas();
    updateClipboard(copiedShape);
    UndoRedoModule.registerUndoEvent();
  };
  const createShapeFromJSON = (newShape) => {
    const newGroup = Konva.Node.create(clipboard.group);
    if (shape.attrs.name === 'VariableBox') {
      Canvas.variableLayer().add(newGroup);
    } else {
      Canvas.imageLayer().add(newGroup);
    }
    newShape.reinitialise(newGroup, clipboard);
    return newShape;
  };
  const addShapeToLabel = (shape, label) => {
    shape.shapeId = label.nextId();
    label.shapes.push(shape);
    label.selectShape(shape);
  };
  const changeCopiedPosition = (newShape) => {
    newShape.group.move({ x: 10, y: 10 });
  };
  const updateClipboard = (shape) => {
    clipboard = JSON.stringify(shape);
  };
  const canCopy = (label) => {
    const shape = label.selectedShape();
    return shape;
  };
  const canPaste = () => (clipboard !== '');
  const updateCopyPasteButtons = (label) => {
    updateCopyButton(label);
    updatePasteButton();
  };
  const updateCopyButton = (label) => {
    canCopy(label) ? enableCopyButton() : disableCopyButton();
  };
  const updatePasteButton = () => {
    canPaste() ? enablePasteButton() : disablePasteButton();
  };
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

  return {
    copy,
    paste,
    updateCopyPasteButtons,
  };
}());
