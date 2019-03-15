UndoEngine = (function () {
  const returnObject = {};

  const undoStack = [];
  let undoIndex = -1;

  returnObject.canUndo = function canUndo() {
    return (undoStack.length > 0) && (undoIndex >= 0);
  };

  returnObject.canRedo = function canRedo() {
    return undoIndex < undoStack.length - 1;
  };

  // Add a command to the undo list and discard redos
  // beyond the current position if we've performed any.
  returnObject.addCommand = function addCommand(cmd) {
    undoIndex += 1;
    undoStack.splice(undoIndex);
    undoStack.push(cmd);
  };

  returnObject.undo = function undo() {
    if (!returnObject.canUndo()) {
      throw 'ERROR: Cannot call undo at this time.';
    }
    const cmd = undoStack[undoIndex];
    cmd.executeUndo();
    undoIndex -= 1;
  };

  returnObject.redo = function redo() {
    if (!returnObject.canRedo()) {
      throw 'ERROR: Cannot call redo at this time.';
    }
    const cmd = undoStack[undoIndex + 1];
    cmd.executeRedo();
    undoIndex += 1;
  };

  // // JUST FOR DEMO PURPOSES.
  // returnObject.listU = function() {
  //   return JSON.stringify(undoStack);
  // };
  // FOR DEBUGGING: Return the undo stack.
  returnObject.debugUndoStack = function debugUndo() {
    return undoStack;
  };

  return returnObject;
}());
