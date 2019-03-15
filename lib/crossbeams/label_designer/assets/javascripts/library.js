Library = (function () {
  const getChildrenOfType = (type, group) => {
    const children = group.getChildren(node => node.getClassName() === type);
    return children;
  };

  const getChildOfType = (type, group) => {
    const child = getChildrenOfType(type, group);
    return child[0];
  };

  const actualPosition = (group) => {
    // Meant for variables
    const rect = getChildOfType('Rect', group);
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
      default:
        object = {
          x0: group.x(),
          x1: group.x(),
          y0: group.y(),
          y1: group.y(),
        };
    }
    return object;
  };

  const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const setCursorName = (cursorName) => {
    document.body.style.cursor = cursorName;
  };
  const getCursorName = () => document.body.style.cursor;

  const parseBool = (value) => {
    if (value.toLowerCase() === 'true'
       || value.toLowerCase() === 'yes'
       || value === '1'
       || value === 1
       || value === true
       || value === '') {
      return true;
    }
    return false;
  };

  const overlap = (rectangle) => {
    const overlaps = [];
    const set = [];

    const rectGroup = rectangle.findAncestor('Group');
    const rectPosition = Library.actualPosition(rectGroup);

    Canvas.variableLayer().getChildren().forEach((group) => {
      const object = Library.actualPosition(group);
      set.push(object);
    });

    if (rectangle && (set[0] !== undefined)) {
      const { x0, x1, y0, y1 } = rectPosition;

      set.forEach((e) => {
        const { x0: ex0, x1: ex1, y0: ey0, y1: ey1 } = e;

        if (!(JSON.stringify(rectPosition) == JSON.stringify(e))) {
          const a = (((y0 <= ey0 && ey0 <= y1) || (y0 <= ey1 && ey1 <= y1)) &&
                    ((x0 <= ex0 && ex0 <= x1) || (x0 <= ex1 && ex1 <= x1)));
          const b = (((ey0 <= y0 && y0 <= ey1) || (ey0 <= y1 && y1 <= ey1)) &&
                    ((ex0 <= x0 && x0 <= ex1) || (ex0 <= x1 && x1 <= ex1)));
          const c = ((x0 > ex0 && x1 < ex1 && y0 < ey0 && y1 > ey1) ||
                    (ex0 > x0 && ex1 < x1 && ey0 < y0 && ey1 > y1));
          overlaps.push(a || b || c);
        }
      });
    }
    return overlaps.includes(true);
  };
  const imageName = () => {
    let formattedName;
    if (labelConfig.labelName) {
      formattedName = `${labelConfig.labelName}`.toLowerCase().replace(/[^a-zA-Z0-9 \\-]/g, '').replace(/ /g, '_');
    } else {
      formattedName = 'default';
    }
    return `${formattedName}.png`;
  };

  return {
    actualPosition,
    toTitleCase,
    setCursorName,
    getCursorName,
    getChildOfType,
    getChildrenOfType,
    overlap,
    parseBool,
    imageName,
  };
}());
