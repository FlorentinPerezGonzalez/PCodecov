let originalPoints;
const ABOVE = 1;
const UNDER = 0;
/**
 *
 */
function mainCoordinator() {
  /**
   *
   */
  function fixDpi() {
    const styleHeight =
      +getComputedStyle(CANVAS).getPropertyValue('height').slice(0, -2);
    const styleWidth =
      +getComputedStyle(CANVAS).getPropertyValue('width').slice(0, -2);
    CANVAS.setAttribute('height', styleHeight * DEVICE_PIXEL_RATIO);
    CANVAS.setAttribute('width', styleWidth * DEVICE_PIXEL_RATIO);
  }
  const CANVAS = document.getElementById('canvas');
  const DEVICE_PIXEL_RATIO = window.devicePixelRatio;
  const CONTEXT = canvas.getContext('2d');
  fixDpi();
  originalPoints = generatePoints(CANVAS);
  const setOfPoints = originalPoints.slice();
  drawPoints(setOfPoints, CONTEXT);
  quickHull(CONTEXT, setOfPoints, CANVAS);
}

/**
  * @desc Función que permite crear un punto con coordenadas
  * xCoordinate e yCoordiante.
  * @param {Numeric} xCoordinate - Coordenada X
  * @param {Numeric} yCoordinate - Coordenada Y
  * @return {Object} - Objeto que representa un punto
  */
function createPoint(xCoordinate, yCoordinate) {
  return {
    x: xCoordinate,
    y: yCoordinate,
  };
}

/**
 * Función que permite obtener una recta a través de la especificación
 * de dos de sus puntos.
 * @param {Object} firstPoint - Un punto cualquiera de la recta
 * @param {Object} secondPoint - Otro punto cualquiera de la recta
 * @return {Object} - Un objeto que representa la recta que une ambos puntos
 */
function lineFromTo(firstPoint, secondPoint) {
  return {
    initialPoint: firstPoint,
    finalPoint: secondPoint,
  };
}

/**
 * @desc Función que permite eliminar los puntos duplicados en un
 * array de puntos
 * @param {Array} originalArray - Array en su estado original
 * @return {Array} - Array original sin elementos duplicados
 */
function makeUnique(originalArray) {
  const result = [];
  for (const item of originalArray) {
    if (!result.find((object) => {
      return (object.x === item.x) && (object.y === item.y);
    })) {
      result.push(item);
    }
  }
  return result;
}

/**
 * @desc Función que genera un conjunto de puntos con
 * coordenadas contenidas dentro de las dimensiones de un canvas.
 * @param {*} CANVAS
 * @return {*}
 */
function generatePoints(CANVAS) {
  const setOfPoints = [];
  nPoints = prompt('Enter the number of points', '0');
  if (nPoints > 0) {
    for (let i = 0; i < nPoints; i++) {
      const yCoordiante = Math.round(Math.random() * CANVAS.height - 1);
      const xCoordinate = Math.round(Math.random() * CANVAS.width - 1);
      setOfPoints.push(createPoint(xCoordinate, yCoordiante));
    }
  } else {
    alert('Input must be a number greater than 0');
  }
  return makeUnique(setOfPoints);
}

/**
 *
 * @param {*} setOfPoints
 * @param {*} CONTEXT
 */
function drawPoints(setOfPoints, CONTEXT) {
  CONTEXT.strokeStyle = 'black';
  for (const point of setOfPoints) {
    CONTEXT.beginPath();
    CONTEXT.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
    CONTEXT.fill();
    CONTEXT.stroke();
  }
}

/**
 *
 * @param {*} point
 * @param {*} line
 * @return {*}
 */
function calculateDistancePointToLine(point, line) {
  const aCoefficient = line.initialPoint.y - line.finalPoint.y;
  const bCoefficient = line.finalPoint.x - line.initialPoint.x;
  const cCoefficient = line.initialPoint.x * line.finalPoint.y -
    line.finalPoint.x * line.initialPoint.y;
  return Math.round((Math.abs(aCoefficient * point.x + bCoefficient * point.y +
    cCoefficient) / Math.sqrt(aCoefficient * aCoefficient +
    bCoefficient * bCoefficient)) * 1000) / 1000;
}

/**
 *
 * @param {*} line
 * @param {*} setOfPoints
 * @return {Array} - Array de dos elementos. Cada uno siendo un array
 * que representa a las mitades del convexHull.
 */
function divideSetByALine(line, setOfPoints) {
  // Crear función checkIfVertical
  if (line.finalPoint.x - line.initialPoint.x === 0) {
    return [[], []];
  }
  const slope = (line.finalPoint.y - line.initialPoint.y) /
    (line.finalPoint.x - line.initialPoint.x);
  const yIntercept = -1 * slope * line.initialPoint.x + line.initialPoint.y;
  const result = [underSet = [], aboveSet = []];
  for (const point of setOfPoints) {
    if (point.y > slope * point.x + yIntercept) {
      aboveSet.push(createPoint(point.x, point.y));
    } else if (point.y < slope * point.x + yIntercept) {
      underSet.push(createPoint(point.x, point.y));
    }
  }
  return result;
}

/**
 *
 * @param {*} CONTEXT
 * @param {*} setOfPoints
 * @param {*} CANVAS
 */
function quickHull(CONTEXT, setOfPoints, CANVAS) {
  const convexHull = [];
  setOfPoints.sort( (firstPoint, secondPoint) => {
    if (firstPoint.x < secondPoint.x) {
      return -1;
    } else if (firstPoint.x > secondPoint.x) {
      return 1;
    } else {
      return 0;
    }
  });
  const minimunXPoint = setOfPoints.shift();
  const maximunXPoint = setOfPoints.pop();
  convexHull.push(minimunXPoint, maximunXPoint);
  const convexHullcopy = convexHull.slice();
  setTimeout(function() {
    drawConvexHull(CONTEXT, convexHullcopy, CANVAS);
  }, 1000);
  const initialLine = lineFromTo(minimunXPoint, maximunXPoint);
  const subSetOfPoints = divideSetByALine(initialLine, setOfPoints);
  setTimeout(function() {
    findHull(CONTEXT, CANVAS, convexHull, subSetOfPoints[UNDER],
        initialLine, UNDER);
  }, 1000);
  setTimeout(function() {
    findHull(CONTEXT, CANVAS, convexHull, subSetOfPoints[ABOVE],
        initialLine, ABOVE);
  }, 1500);
  // drawConvexHull(CONTEXT, convexHull.slice(), CANVAS);
}

/**
 *
 * @param {*} CONTEXT
 * @param {*} convexHull
 */
function drawConvexHull(CONTEXT, convexHull, CANVAS) {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  drawPoints(originalPoints, CONTEXT);
  CONTEXT.closePath();
  CONTEXT.strokeStyle = 'red';
  for (const point of convexHull) {
    CONTEXT.beginPath();
    CONTEXT.arc(point.x, point.y, 1.5, 0, 2 * Math.PI);
    CONTEXT.fill();
    CONTEXT.stroke();
  }
  convexHull.sort( (firstPoint, secondPoint) => {
    if (firstPoint.y < secondPoint.y) {
      return -1;
    } else if (firstPoint.y > secondPoint.y) {
      return 1;
    } else {
      return 0;
    }
  });
  CONTEXT.beginPath();
  let flag = true;
  CONTEXT.moveTo(convexHull[0].x, convexHull[0].y);
  let point = convexHull.shift();
  while (flag) {
    flag = false;
    for (const pointOfHull of convexHull) {
      if (pointOfHull.x >= point.x) {
        CONTEXT.lineTo(pointOfHull.x, pointOfHull.y);
        point = pointOfHull;
        convexHull.splice(convexHull.indexOf(pointOfHull), 1);
        flag = true;
        break;
      }
    }
  }
  flag = true;
  while (flag) {
    flag = false;
    let nearestPoint;
    let distance = Infinity;
    for (const pointOfHull of convexHull) {
      if ((pointOfHull.y >= point.y) && (point.x - pointOfHull.x) < distance) {
        flag = true;
        nearestPoint = pointOfHull;
        distance = (point.x - pointOfHull.x);
      }
    }
    if (flag) {
      CONTEXT.lineTo(nearestPoint.x, nearestPoint.y);
      point = nearestPoint;
      convexHull.splice(convexHull.indexOf(nearestPoint), 1);
    }
  }
  flag = true;
  while (flag) {
    flag = false;
    let nearestPoint;
    let distance = Infinity;
    for (const pointOfHull of convexHull) {
      if ((point.y - pointOfHull.y) < distance) {
        flag = true;
        nearestPoint = pointOfHull;
        distance = (point.y - pointOfHull.y);
      }
    }
    if (flag) {
      CONTEXT.lineTo(nearestPoint.x, nearestPoint.y);
      point = nearestPoint;
      convexHull.splice(convexHull.indexOf(nearestPoint), 1);
    }
  }
  CONTEXT.closePath();
  CONTEXT.stroke();
}

/**
 *
 * @param {*} CONTEXT
 * @param {*} CANVAS
 * @param {*} convexHull
 * @param {*} setOfPoints
 * @param {*} currentLine
 * @param {*} flag
 */
function findHull(CONTEXT, CANVAS, convexHull, setOfPoints, currentLine, flag) {
  if (setOfPoints.length === 0) {
    return;
  }
  let farthestPoint;
  let farthestDistance = -Infinity;
  for (const point of setOfPoints) {
    const distance = calculateDistancePointToLine(point, currentLine);
    if (distance > farthestDistance) {
      farthestDistance = distance;
      farthestPoint = point;
    }
  }
  convexHull.push(farthestPoint);
  const convexHullcopy = convexHull.slice();
  //drawConvexHull(CONTEXT, convexHullcopy, CANVAS);
  setTimeout(function() {
    drawConvexHull(CONTEXT, convexHullcopy, CANVAS);
  }, 1000);
  const index = setOfPoints.indexOf(farthestPoint);
  setOfPoints.splice(index, 1);
  const firstSubSetLine = lineFromTo(currentLine.initialPoint, farthestPoint);
  const secondSubSetLine = lineFromTo(currentLine.finalPoint, farthestPoint);
  const firstSubSet = divideSetByALine(firstSubSetLine, setOfPoints);
  const secondSubSet = divideSetByALine(secondSubSetLine, setOfPoints);
  if (flag === UNDER) {
    setTimeout(function() {
      findHull(CONTEXT, CANVAS, convexHull, firstSubSet[UNDER], firstSubSetLine,
          UNDER);
    }, 1000);
    setTimeout(function() {
      findHull(CONTEXT, CANVAS, convexHull, secondSubSet[UNDER], secondSubSetLine,
          UNDER);
    }, 1500);
  } else {
    setTimeout(function() {
      findHull(CONTEXT, CANVAS, convexHull, firstSubSet[ABOVE], firstSubSetLine,
          ABOVE);
    }, 1000);
    setTimeout(function() {
      findHull(CONTEXT, CANVAS, convexHull, secondSubSet[ABOVE], secondSubSetLine,
          ABOVE);
    }, 1500);
  }
}
