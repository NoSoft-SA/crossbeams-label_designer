const Positioner = (function() {
  'use strict'
  let currentXvalue,
      currentYvalue,
      startXvalue,
      startYvalue;

  const findAbsolutePos = obj => {
    // Source: http://www.quirksmode.org/js/findpos.html
    let currentLeft = 0,
        currentTop = 0;
    if (obj.offsetParent) {
      do {
        currentLeft += obj.offsetLeft;
        currentTop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return [currentLeft, currentTop];
    }
    return false;
  }
  const getContainerOffset = event => {
    const canvasOffset = findAbsolutePos(Canvas.container());
    const scrollOffsetLeft = document.querySelector('.designer-container').scrollLeft;
    const scrollOffsetTop = document.querySelector('.designer-container').scrollTop;

    const offsetLeft = parseInt(canvasOffset[0]) - parseInt(scrollOffsetLeft);
    const offsetTop = parseInt(canvasOffset[1]) - parseInt(scrollOffsetTop);
    return [offsetLeft, offsetTop];
  }
  const getMouseCoordsRelativeToPage = event => {
    event = event || window.event;
    if (event.pageX || event.pageY) {
      return { x: event.pageX, y: event.pageY };
    }
    return {
      x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: event.clientY + document.body.scrollTop - document.body.clientTop,
    };
  }
  const updateStartCoords = event => {
    [startXvalue, startYvalue] = getCoords(event);
  }
  const updateCurrentCoords = event => {
    [currentXvalue, currentYvalue] = getCoords(event);
  }
  const getCoords = event => {
    const mouseCoords = getMouseCoordsRelativeToPage(event);
    const offset = getContainerOffset(event);
    return [(mouseCoords.x - offset[0]), (mouseCoords.y - offset[1])];
  }
  const startX = () => {
    return startXvalue;
  }
  const startY = () => {
    return startYvalue;
  }
  const currentX = () => {
    return currentXvalue;
  }
  const currentY = () => {
    return currentYvalue;
  }

  return {
    updateStartCoords,
    updateCurrentCoords,
    getCoords,
    currentX,
    currentY,
    startX,
    startY
  };

})();
