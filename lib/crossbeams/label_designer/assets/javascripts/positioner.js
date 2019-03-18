Positioner = (function () {
  let currentXvalue;
  let currentYvalue;
  let startXvalue;
  let startYvalue;

  document.addEventListener('mousemove', (event) => {
    Positioner.updateMarkers(event);
  });

  const findAbsolutePos = (obj) => {
    // Source: http://www.quirksmode.org/js/findpos.html
    let currentLeft = 0;
    let currentTop = 0;
    if (obj.offsetParent) {
      do { // eslint-disable-line no-cond-assign
        currentLeft += obj.offsetLeft;
        currentTop += obj.offsetTop;
      } while (obj = obj.offsetParent); // eslint-disable-line no-param-reassign
      return [currentLeft, currentTop];
    }
    return false;
  };
  const getContainerOffset = () => {
    const canvasOffset = findAbsolutePos(Canvas.container());
    const scrollOffsetLeft = document.querySelector('.designer-container').scrollLeft;
    const scrollOffsetTop = document.querySelector('.designer-container').scrollTop;

    const offsetLeft = parseInt(canvasOffset[0], 10) - parseInt(scrollOffsetLeft, 10);
    const offsetTop = parseInt(canvasOffset[1], 10) - parseInt(scrollOffsetTop, 10);
    return [offsetLeft, offsetTop];
  };
  const getMouseCoordsRelativeToPage = (event) => {
    const evt = event || window.event;
    if (evt.pageX || evt.pageY) {
      return { x: evt.pageX, y: evt.pageY };
    }
    return {
      x: (evt.clientX + document.body.scrollLeft) - document.body.clientLeft,
      y: (evt.clientY + document.body.scrollTop) - document.body.clientTop,
    };
  };
  const getCoords = (event) => {
    const mouseCoords = getMouseCoordsRelativeToPage(event);
    const offset = getContainerOffset(event);
    return [(mouseCoords.x - offset[0]), (mouseCoords.y - offset[1])];
  };
  const updateStartCoords = (event) => {
    [startXvalue, startYvalue] = getCoords(event);
  };
  const updateCurrentCoords = (event) => {
    // event can be undef...
    [currentXvalue, currentYvalue] = getCoords(event);
  };
  const startX = () => startXvalue;
  const startY = () => startYvalue;
  const currentX = () => currentXvalue;
  const currentY = () => currentYvalue;

  const updateDisplay = (coords) => {
    const text = coords.map(item => (item < 0 ? 0 : item)).join(', ');
    document.querySelector('span.currentCoords').textContent = `(${text})`;
  };
  const getTopMarker = () => document.querySelector('.top-marker');
  const getLeftMarker = () => document.querySelector('.left-marker');
  const updateTopMarker = (coords) => {
    getTopMarker().setAttribute('style', `padding-left:${coords[0]}px;`);
  };
  const updateLeftMarker = (coords) => {
    getLeftMarker().setAttribute('style', `padding-top:${coords[1]}px;`);
  };

  const updateMarkers = (event) => {
    const coords = getCoords(event);
    updateDisplay(coords);
    updateTopMarker(coords);
    updateLeftMarker(coords);
  };
  return {
    updateMarkers,
    updateStartCoords,
    updateCurrentCoords,
    getCoords,
    currentX,
    currentY,
    startX,
    startY,
  };
}());
