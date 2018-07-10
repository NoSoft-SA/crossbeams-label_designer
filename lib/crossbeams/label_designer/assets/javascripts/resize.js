Resize = (function () {
  let start = {x: 0, y: 0};
  let activeAnchor,
    previewBox,
    currentShape;

  const before = (anchor) => {
    if (anchor) {
      DrawApp.savePosition();
      setCurrentValues(anchor);
      Positioner.updateCurrentCoords(event);
      if (!currentShape.lineType()) {
        updateStartPosition();
        setPreviewBox();
      }
    } else {
      console.log('no anchor for resizing');
    }
  };

  const setCurrentValues = (anchor) => {
    if (anchor) {
      try {
        activeAnchor = anchor;
        currentShape = anchor.findAncestor('Group').shape;
      } catch (e) {
        console.log('error', e);

        console.log('anchor does not have a group');
        console.log('anchor', anchor);
        activeAnchor = undefined;
        currentShape = undefined;
      }
    }
  };

  const updateStartPosition = () => {
    try {
      const oppositeAnchor = getOppositeAnchor();
      start = oppositeAnchor.getAbsolutePosition();
    } catch (e) {
      console.log('error', e);
      start = undefined;
    }
  };

  const getOppositeAnchor = () => {
    if (activeAnchor) {
      try {
        const anchorName = getOppositeAnchorName(activeAnchor.getName());
        const anchors = currentShape.getAnchors();
        return anchors.find(item => item.getName() === anchorName);
      } catch (e) {
        console.log('error', e);
      }
    } else {
      console.log('no anchor was given');
    }
  };

  const getOppositeAnchorName = (anchorName) => {
    const oppositeAnchors = {
      topLeft: 'bottomRight',
      topRight: 'bottomLeft',
      bottomRight: 'topLeft',
      bottomLeft: 'topRight',
    };
    return oppositeAnchors[anchorName];
  };

  const setPreviewBox = () => {
    const rect = DrawApp.initRectangle();
    rect.dash([5, 2]);
    rect.strokeWidth(1);
    rect.x(start.x);
    rect.y(start.y);
    previewBox = rect;
  };

  const resizeStart = (event) => {
    if (currentShape) {
      if (currentShape.lineType()) {
        const group = currentShape.group;
        const anchorX = activeAnchor.getX();
        const anchorY = activeAnchor.getY();
        const endPoint = group.get('.endPoint')[0];
        const startPoint = group.get('.startPoint')[0];
        switch (activeAnchor.getName()) {
          case 'startPoint':
            var newX = ((drawEnv.shifted === true) ? currentShape.drawnShape.points()[2] : anchorX);
            var newY = ((drawEnv.controlled === true) ? currentShape.drawnShape.points()[3] : anchorY);
            startPoint.setX(newX);
            startPoint.setY(newY);
            currentShape.drawnShape.points()[0] = newX;
            currentShape.drawnShape.points()[1] = newY;
            break;
          case 'endPoint':
            var newX = ((drawEnv.shifted === true) ? currentShape.drawnShape.points()[0] : anchorX);
            var newY = ((drawEnv.controlled === true) ? currentShape.drawnShape.points()[1] : anchorY);
            endPoint.setX(newX);
            endPoint.setY(newY);
            currentShape.drawnShape.points()[2] = newX;
            currentShape.drawnShape.points()[3] = newY;
            break;
        }
      } else {
        Positioner.updateCurrentCoords(event);

        const distanceX = Positioner.currentX() - start.x;
        const distanceY = Positioner.currentY() - start.y;
        let height;
        const width = Math.abs(distanceX);
        if (currentShape.imageType()) {
          height = ((drawEnv.shifted || drawEnv.controlled) ? currentShape.attrs.aspectRatio * width : Math.abs(distanceY));
        } else {
          height = ((drawEnv.shifted || drawEnv.controlled) ? width : Math.abs(distanceY));
        }

        previewBox.width(width);
        previewBox.height(height);

        previewBox.position({
          x: ((distanceX < 0) ? (start.x + distanceX) : start.x),
          y: ((distanceY < 0) ? (start.y + distanceY) : start.y),
        });
        Canvas.imageLayer().add(previewBox);
        Canvas.drawCanvas();
      }
    }
  };

  const resizeEnd = () => {
    Canvas.container().onmousemove = null;
    const oldPosition = (currentShape.temporary ? Object.assign(currentShape.temporary) : undefined);
    try {
      if (currentShape.lineType()) {
        currentShape.resetRotationPoint(activeAnchor);
      } else if (currentShape.variableBoxType()) {
        place();
        setNewTemporary(oldPosition);
        if (VariableSettings.preventOverlap(currentShape)) {
          alert('Overlapping variables prevent resize.');
        }
        VariableSettings.update('position');
      } else {
        place();
      }
      Canvas.drawCanvas();
      UndoRedoModule.registerUndoEvent();
    } catch (e) {
      console.log('error', e);
      if (oldPosition) {
        currentShape.temporary = Object.assign(oldPosition);
      }
      DrawApp.setToTemporaryPosition(currentShape);
    }
  };

  const place = () => {
    setNewTemporary();
    removePreviewBox();
    DrawApp.setToTemporaryPosition(currentShape);
  };

  const setNewTemporary = (temporary = undefined) => {
    if (!temporary) {
      const theta = (currentShape.group.rotation() % 360);
      const rotPoint = newRotationPoint(theta, previewBox);
      currentShape.temporary = {
        theta,
        rotPoint,
        groupX: previewBox.x(),
        groupY: previewBox.y(),
        width: previewBox.width(),
        height: previewBox.height(),
      };
    } else {
      currentShape.temporary = temporary;
    }
  };

  const applicableCorner = {
    0: 'topLeft',
    90: 'topRight',
    180: 'bottomRight',
    270: 'bottomLeft',
  };

  const newRotationPoint = (theta, box) => {
    const cornerName = applicableCorner[theta];
    const newPoint = {
      x: (cornerName.includes('Left') ? box.x() : (box.x() + box.width())),
      y: (cornerName.includes('top') ? box.y() : (box.y() + box.height())),
    };
    return newPoint;
  };

  const removePreviewBox = () => {
    previewBox.destroy();
    previewBox = undefined;
  };

  return {
    before,
    resizeStart,
    resizeEnd,
  };
}());
