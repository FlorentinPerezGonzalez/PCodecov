/**
 * @author
 */
let nPoints = 0;
let originalSetOfPoints;
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
  const DEVICE_PIXEL_RATIO = window.devicePixelRatio;
  const CANVAS = document.getElementById('canvas');
  const CONTEXT = canvas.getContext('2d');
  fixDpi();
  originalSetOfPoints = generatePoints();
  drawPoints(originalSetOfPoints, CONTEXT);
  quickHull(originalSetOfPoints, CONTEXT, CANVAS);
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
  const slopeCalculated = Math.round(((secondPoint.y - firstPoint.y) /
                          (secondPoint.x - firstPoint.x)) * 1000) / 1000;
  const yInterceptCalculated = Math.round(((firstPoint.y) -
                            (slopeCalculated * firstPoint.x)) * 1000) / 1000;
  return {
    slope: slopeCalculated,
    yIntercept: yInterceptCalculated,
  };
}

/**
 *
 * @param {*} point
 * @param {*} line
 */
function calculateDistancePointToLine(point, line) {
  return Math.round(((line.slope * point.x - point.y + line.yIntercept) /
    Math.sqrt(line.slope * line.slope + 1)));
}

/**
 * @desc Función que genera un conjunto de puntos con
 * coordenadas contenidas dentro de las dimensiones de un canvas.
 * @return {Array} - Conjunto de puntos generado
 */
function generatePoints() {
  const canvas = document.getElementById('canvas');
  const setOfPoints = [];
  nPoints = prompt('Enter the number of points', '0');
  if (nPoints > 0) {
    for (let i = 0; i < nPoints; i++) {
      const yCoordiante = Math.round(Math.random() * canvas.height - 1);
      const xCoordinate = Math.round(Math.random() * canvas.width - 1);
      setOfPoints.push(createPoint(xCoordinate, yCoordiante));
    }
  } else {
    alert('Input must be a number greater than 0');
  }
  return makeUnique(setOfPoints);
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
 * @param {*} setOfPoints
 */
function quickHull(setOfPoints, CONTEXT, CANVAS) {
  const result = [];
  setOfPoints.sort( (firstPoint, secondPoint) => {
    if (firstPoint.x < secondPoint.x) {
      return -1;
    } else if (firstPoint.x > secondPoint.x) {
      return 1;
    } else {
      return 0; // Considerar la Y
    }
  });
  const localSetOfPoint = setOfPoints.slice();
  const maximunXPoint = localSetOfPoint.pop();
  const minimunXPoint = localSetOfPoint.shift();
  result.push(minimunXPoint);
  result.push(maximunXPoint);
  // Refactorizar
  drawConvexHull(result, CONTEXT, CANVAS);
  const line = lineFromTo(minimunXPoint, maximunXPoint);
  const subSets = divideSetByALine(line, localSetOfPoint);
  //findHull(subSets[0], line, CONTEXT, minimunXPoint, maximunXPoint, result, CANVAS);
  findHull(subSets[1], line, CONTEXT, minimunXPoint, maximunXPoint, result, CANVAS);
}

/**
 *
 * @param {*} line
 * @param {*} setOfPoints
 * @return {Array} - Array de dos elementos. Cada uno siendo un array
 * que representa a las mitades del convexHull.
 */
function divideSetByALine(line, setOfPoints) {
  console.log('divide');
  const result = [firstSet = [], secondSet = []];
  for (const point of setOfPoints) {
    const distance = calculateDistancePointToLine(point, line);
    console.log(distance);
    if (distance < 0) {
      firstSet.push(point);
    } else {
      secondSet.push(point);
    }
  }
  return result;
}


/**
 *
 * @param {*} setOfPoints
 * @param {*} line
 * @param {*} CONTEXT
 * @param {*} minimunXPoint
 * @param {*} maximunXPoint
 * @param {*} convexHull
 */
function findHull(setOfPoints, line, CONTEXT, minimunXPoint, maximunXPoint,
    convexHull, CANVAS) {
  if (setOfPoints.length === 0) {
    return;
  }
  // Find the farthest point
  let farthestPoint;
  let farthestDistance = -Infinity;
  for (const point of setOfPoints) { // Refactorizar
    const currentDistance = Math.abs(calculateDistancePointToLine(point, line));
    if (farthestDistance < currentDistance) {
      farthestDistance = currentDistance;
      farthestPoint = point;
    }
  }
  convexHull.push(farthestPoint);
  convexHull.sort((firstPoint, secondPoint) => { // Refactorizar
    if (firstPoint.x < secondPoint.x) {
      return -1;
    } else if (firstPoint.x > secondPoint.x) {
      return 1;
    } else {
      return 0; // Considerar la Y
    }
  });
  // Refactorizar
  drawConvexHull(convexHull, CONTEXT, CANVAS);
  const tri = { // Cambiarlo
    first: minimunXPoint,
    second: maximunXPoint,
    third: farthestPoint,
  };
  const index = setOfPoints.indexOf(farthestPoint);
  setOfPoints.splice(index, 1);
  setOfPoints = discardInnerPoints(setOfPoints, createTriangle(tri));
  const firstSubSets = divideSetByALine(
      lineFromTo(minimunXPoint, farthestPoint), setOfPoints);
  const secondSubSets = divideSetByALine(
      lineFromTo(maximunXPoint, farthestPoint), setOfPoints);
  console.log(firstSubSets[0]);
  console.log(firstSubSets[1]);
  findHull(firstSubSets[0], lineFromTo(minimunXPoint, farthestPoint),
      CONTEXT, minimunXPoint, farthestPoint, convexHull, CANVAS);
  findHull(secondSubSets[1], lineFromTo(maximunXPoint, farthestPoint),
      CONTEXT, maximunXPoint, farthestPoint, convexHull, CANVAS);
}

/**
 *
 * @param {*} threePoints
 * @return {*}
 */
function createTriangle(threePoints) {
  return {
    firstSide: {
      initialPoint: threePoints.first,
      finalPoint: threePoints.second,
      line: lineFromTo(threePoints.first, threePoints.second),
    },
    secondSide: {
      initialPoint: threePoints.second,
      finalPoint: threePoints.third,
      line: lineFromTo(threePoints.second, threePoints.third),
    },
    thirdSide: {
      initialPoint: threePoints.first,
      finalPoint: threePoints.third,
      line: lineFromTo(threePoints.first, threePoints.third),
    },
  };
}

/**
 *
 * @param {*} setOfPoints
 * @param {*} triangle
 */
function discardInnerPoints(setOfPoints, triangle) {
  const result = [];
  for (const point of setOfPoints) {
    let coincidence = 0;
    const lineToOrigin = lineFromTo(createPoint(0, 0), point);
    for (const side in triangle) {
      if (Object.prototype.hasOwnProperty.call(triangle, side)) {
        if (checkIfTwoLinesCrossed(lineToOrigin, triangle[side], point)) {
          coincidence++;
        }
      }
    }
    if (parseInt(coincidence % 2) === 0) {
      result.push(point);
    }
  }
  return result;
}

/**
 *
 * @param {*} convexHull
 * @param {*} CONTEXT
 */
function drawConvexHull(convexHull, CONTEXT, CANVAS) {
  CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  drawPoints(originalSetOfPoints, CONTEXT);
  CONTEXT.beginPath();
  CONTEXT.strokeStyle = 'orange';
  const localHull = convexHull.slice();
  CONTEXT.moveTo(localHull[0].x, localHull[0].y);
  localHull.shift();
  for (const point of localHull) {
    CONTEXT.lineTo(point.x, point.y);
  }
  CONTEXT.closePath();
  CONTEXT.stroke();
}

/**
 *
 * @param {*} firstLine
 * @param {*} side
 * @return {*}
 */
function checkIfTwoLinesCrossed(firstLine, side, point) {
  const xIntersect = Math.round(
      ((side.line.yIntercept - firstLine.yIntercept) /
      (firstLine.slope - side.line.slope)) * 1000) / 1000;
  const yIntersect = xIntersect * firstLine.slope + firstLine.yIntercept;
  if (xIntersect === Infinity || xIntersect === -Infinity) {
    if (yIntersect !== 0) {
      return false;
    } else {
      if ((point.x >= side.initialPoint.x && point.x <= side.finalPoint.x) ||
      (point.x <= side.initialPoint.x && point.x >= side.finalPoint.x)) {
        if ((point.y >= side.initialPoint.y && point.y <= side.finalPoint.y) ||
        (point.y <= side.initialPoint.y && point.y >= side.finalPoint.y)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  } else {
    if (xIntersect > point.x) {
      return false;
    } else {
      if ((xIntersect >= side.initialPoint.x && xIntersect <= side.finalPoint.x) ||
      (xIntersect <= side.initialPoint.x && xIntersect >= side.finalPoint.x)) {
        if ((yIntersect >= side.initialPoint.y && yIntersect <= side.finalPoint.y) ||
        (yIntersect <= side.initialPoint.y && yIntersect >= side.finalPoint.y)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
}
