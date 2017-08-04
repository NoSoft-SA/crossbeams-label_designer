const Library = (function() {
  'use strict'

  const actualPosition = (group) => {
    // Meant for variables
    const rect = this.getChildOfType('Rect', group);
    const theta = group.rotation() % 360;
    let object;
    switch (theta) {
      case 0:
        object = {
          x0: group.x(),
          x1: group.x() + rect.width(),
          y0: group.y(),
          y1: group.y() + rect.height(),
        };
        break;
      case 90:
        object = {
          x0: group.x() - rect.height(),
          x1: group.x(),
          y0: group.y(),
          y1: group.y() + rect.width(),
        };
        break;
      case 180:
        object = {
          x0: group.x() - rect.width(),
          x1: group.x(),
          y0: group.y() - rect.height(),
          y1: group.y(),
        };
        break;
      case 270:
        object = {
          x0: group.x(),
          x1: group.x() + rect.height(),
          y0: group.y() - rect.width(),
          y1: group.y(),
        };
        break;
    }
    return object;
  }

  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  const setCursorName = (cursorName) => {
    document.body.style.cursor = cursorName;
  }
  const getCursorName = () => {
    return document.body.style.cursor;
  }

  const getChildOfType = (type, group) => {
    const child = this.getChildrenOfType(type, group);
    return child[0];
  }
  const getChildrenOfType = (type, group) => {
    const children = group.getChildren(node => node.getClassName() === type);
    return children;
  }

  const afterUndoable = () => {
    UndoRedoModule.registerUndoEvent(myLabel);
  }

  return {
    actualPosition,
    toTitleCase,
    setCursorName,
    getCursorName,
    getChildOfType,
    getChildrenOfType,
    afterUndoable
  };

})();
