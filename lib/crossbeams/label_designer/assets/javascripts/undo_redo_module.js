const UndoRedoModule = (function() {
  'use strict'

  let previousState,
      givenLabel;
  let config = {};

  const initialise = (currentLabel) => {
    keepLabel(currentLabel);
    saveCurrentState();
  }
  const keepLabel = (currentLabel) => {
    givenLabel = currentLabel;
  }
  const saveCurrentState = () => {
    previousState = getCurrentState();
  }
  const getCurrentState = () => {
    const currentState = givenLabel.exportToJSON();
    return currentState['label'];
  }
  const registerUndoEvent = (currentLabel) => {
    keepLabel(currentLabel);
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
        givenLabel.initialise(undefined, undefined, undefined, undefined, this.previous);
      },
      executeRedo() {
        givenLabel.initialise(undefined, undefined, undefined, undefined, this.current);
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
    return document.querySelector(`.${config.undoButtonClass || 'label-designer-undo-button'}`);
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
    return document.querySelector(`.${config.redoButtonClass || 'label-designer-redo-button'}`);
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
    initialise,
    registerUndoEvent,
    callUndo,
    callRedo
  };

})();
