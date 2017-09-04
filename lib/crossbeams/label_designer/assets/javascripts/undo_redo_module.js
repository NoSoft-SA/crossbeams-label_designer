UndoRedoModule = (function() {
  'use strict'

  let previousState;

  document.querySelector('.label-designer-undo-button').addEventListener('click', () => {
    UndoRedoModule.callUndo();
    Canvas.drawCanvas();
  });
  document.querySelector('.label-designer-redo-button').addEventListener('click', () => {
    UndoRedoModule.callRedo();
    Canvas.drawCanvas();
  });

  const saveCurrentState = () => {
    previousState = getCurrentState();
  }
  const getCurrentState = () => {
    const currentState = MyLabel.exportToJSON();
    return currentState['label'];
  }
  const registerUndoEvent = () => {
    addUndoEngineCommand();
    updateUndoRedoButtons();
    saveCurrentState();
  }
  const addUndoEngineCommand = () => {
    UndoEngine.addCommand({
      action: 'undoable',
      current: getCurrentState(),
      previous: previousState,
      executeUndo() {
        MyLabel.initialise(undefined, undefined, undefined, undefined, this.previous);
      },
      executeRedo() {
        MyLabel.initialise(undefined, undefined, undefined, undefined, this.current);
      }
    });
    return true;
  }
  const updateUndoRedoButtons = () => {
    updateUndoButton();
    updateRedoButton();
  }
  const updateUndoButton = () => {
    UndoEngine.canUndo() ? enableUndoButton() : disableUndoButton();
  }
  const enableUndoButton = () => {
    undoButton().removeAttribute('disabled');
  }
  const disableUndoButton = () => {
    undoButton().setAttribute('disabled', 'disabled');
  }
  const undoButton = () => {
    return document.querySelector('.label-designer-undo-button');
  }
  const updateRedoButton = () => {
    UndoEngine.canRedo() ? enableRedoButton() : disableRedoButton();
  }
  const enableRedoButton = () => {
    redoButton().removeAttribute('disabled');
  }
  const disableRedoButton = () => {
    redoButton().setAttribute('disabled', 'disabled');
  }
  const redoButton = () => {
    return document.querySelector('.label-designer-redo-button');
  }
  const callUndo = () => {
    disableUndoButton();
    UndoEngine.undo();
    updateUndoRedoButtons();
  }
  const callRedo = () => {
    disableRedoButton();
    UndoEngine.redo();
    updateUndoRedoButtons();
  }

  // TODO: control cursor
  // setCursorName('default'); // I removed this because its a side-effect here and does not belong,
  //  where to put it now?
  return {
    saveCurrentState,
    registerUndoEvent,
    callUndo,
    callRedo
  };

})();
