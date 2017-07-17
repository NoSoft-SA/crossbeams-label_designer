var UndoEngine = (function () {
  "use strict";

  var returnObject = {};

  var undoStack = [];
  var undoIndex = -1;

  returnObject.canUndo = function() {
    return (undoStack.length > 0) && (undoIndex >= 0);
  };

  returnObject.canRedo = function() {
    return undoIndex < undoStack.length - 1;
  };

  // Add a command to the undo list and discard redos
  // beyond the current position if we've performed any.
  returnObject.addCommand = function(cmd) {
    undoIndex += 1;
    undoStack.splice(undoIndex);
    undoStack.push(cmd);
  };

  returnObject.undo = function() {
    if(!returnObject.canUndo()) {
      throw "ERROR: Cannot call undo at this time.";
    }
    var cmd = undoStack[undoIndex];
    cmd.executeUndo();
    undoIndex -= 1;
  };

  returnObject.redo = function() {
    if(!returnObject.canRedo()) {
      throw "ERROR: Cannot call redo at this time.";
    }
    var cmd = undoStack[undoIndex + 1];
    cmd.executeRedo();
    undoIndex += 1;
  };

  // // JUST FOR DEMO PURPOSES.
  // returnObject.listU = function() {
  //   return JSON.stringify(undoStack);
  // };

  return returnObject;

}());
