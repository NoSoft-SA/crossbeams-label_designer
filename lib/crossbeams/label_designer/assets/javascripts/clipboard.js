const Clipboard = (function() {
  'use strict'

  let clipboard = '';

  const copy = (shape) => {
    clipboard = JSON.stringify(shape);
  }

  const paste = (label) => {
    const newShape = createShapeFromJSON();
    addShapeToLabel(newShape, label);
    changeCopiedPosition(newShape);
    updateClipboard(newShape);
    UndoRedoModule.registerUndoEvent(label);
  }
  const createShapeFromJSON = (shapeJSON) => {
    const newShape = new Shape();
    const newGroup = Konva.Node.create(clipboard.group);
    if (shape.name === 'VariableBox') {
      Canvas.variableLayer().add(newGroup);
    } else {
      Canvas.imageLayer().add(newGroup);
    }
    newShape.reinitialise(newGroup, clipboard);
    return newShape;
  }
  const addShapeToLabel = (shape, label) => {
    shape.shapeId = label.nextId();
    label.shapes.push(shape);
    label.selectShape(shape);
    this.stage.draw();
  }
  const changeCopiedPosition = (newShape) => {
    newShape.group.move({ x: 10 * value, y: 10 });
  }
  const updateClipboard = (shape) => {
    clipboard = JSON.stringify(newShape);
  }
  const canCopy = (label) => {
    const shape = label.selectedShape();
    return shape;
  }
  const canPaste = () => {
    return (clipboard !== '');
  }
  const updateCopyPasteButtons = (label) => {
    updateCopyButton(label);
    updatePasteButton();
  }
  const updateCopyButton = (label) => {
    Clipboard.canCopy(label) ? enableCopyButton() : disableCopyButton();
  }
  const updatePasteButton = () => {
    Clipboard.canPaste() ? enablePasteButton() : disablePasteButton();
  }
  const copyButton = () => {
    return document.querySelector('.label-designer-copy-button');
  }
  const pasteButton = () => {
    return document.querySelector('.label-designer-paste-button');
  }
  const enableCopyButton = () => {
    copyButton().removeAttribute('disabled');
  }
  const disableCopyButton = () => {
    copyButton().setAttribute('disabled', 'disabled');
  }
  const enablePasteButton = () => {
    pasteButton().removeAttribute('disabled');
  }
  const disablePasteButton = () => {
    pasteButton().setAttribute('disabled', 'disabled');
  }

  return {
    copy,
    paste,
    updateCopyPasteButtons

  };

})();
