UndoRedoModule = (function () {
  let previousState;

  document.querySelector('.label-designer-undo-button').addEventListener('click', () => {
    UndoRedoModule.callUndo();
    Canvas.drawCanvas();
    // Set the drawing area's background to white.
    const konvaDiv = document.querySelector('div.konvajs-content');
    konvaDiv.classList.add('bg-white');
  });
  document.querySelector('.label-designer-redo-button').addEventListener('click', () => {
    UndoRedoModule.callRedo();
    Canvas.drawCanvas();
    // Set the drawing area's background to white.
    const konvaDiv = document.querySelector('div.konvajs-content');
    konvaDiv.classList.add('bg-white');
  });
  const getCurrentState = () => {
    const currentState = MyLabel.exportToJSON();
    return currentState.label;
  };

  const saveCurrentState = () => {
    previousState = getCurrentState();
  };
  const addUndoEngineCommand = () => {
    UndoEngine.addCommand({
      action: 'undoable',
      current: getCurrentState(),
      previous: previousState,
      executeUndo() {
        MyLabel.initialise(undefined, undefined, this.previous);
      },
      executeRedo() {
        MyLabel.initialise(undefined, undefined, this.current);
      },
    });
    return true;
  };
  const undoButton = () => document.querySelector('.label-designer-undo-button');
  const redoButton = () => document.querySelector('.label-designer-redo-button');
  const enableUndoButton = () => {
    undoButton().removeAttribute('disabled');
  };
  const disableUndoButton = () => {
    undoButton().setAttribute('disabled', 'disabled');
  };
  const enableRedoButton = () => {
    redoButton().removeAttribute('disabled');
  };
  const disableRedoButton = () => {
    redoButton().setAttribute('disabled', 'disabled');
  };
  const updateUndoButton = () => {
    if (UndoEngine.canUndo()) {
      enableUndoButton();
    } else {
      disableUndoButton();
    }
  };
  const updateRedoButton = () => {
    if (UndoEngine.canRedo()) {
      enableRedoButton();
    } else {
      disableRedoButton();
    }
  };
  const updateUndoRedoButtons = () => {
    updateUndoButton();
    updateRedoButton();
  };
  const registerUndoEvent = () => {
    drawEnv.changesMade = true;
    addUndoEngineCommand();
    updateUndoRedoButtons();
    saveCurrentState();
  };
  const callUndo = () => {
    disableUndoButton();
    UndoEngine.undo();
    updateUndoRedoButtons();
  };
  const callRedo = () => {
    disableRedoButton();
    UndoEngine.redo();
    updateUndoRedoButtons();
  };

  // TODO: control cursor
  // setCursorName('default'); // I removed this because its a side-effect here and does not belong,
  //  where to put it now?
  return {
    saveCurrentState,
    registerUndoEvent,
    callUndo,
    callRedo,
  };
}());
