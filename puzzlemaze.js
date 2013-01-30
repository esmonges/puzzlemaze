/**
 * 15-237 Project #1
 * Omer Zach          ozach
 * Edward Smongeski   esmonges
 *
 */

var g = { };
g['boardW'] = 8;
g['boardH'] = 12;
g['INTERVAL'] = 1000 / 60;
g['REMOVE_TIME'] = 50;
g['timer'] = 0;
g['N_ROT_DEGREES'] = 180;
g['icons'] = ['evan', 'tomer', 'brandon', 'dillon', 'arthur', 'chris', 'liz', 'kosbie'];
g['icons'].splice(Math.floor(Math.random() * 6), 1);
g['colorMap'] = {
  'evan' : 'green',
  'tomer' : 'blue',
  'brandon' : 'pink',
  'dillon' : 'yellow',
  'arthur' : 'orange',
  'chris' : 'cyan',
  'liz' : 'red',
  'kosbie' : 'black'
};

/** Whether the mouse is down or not. */
g['mouseDown'] = false;
/** Array of pairs of indices representing clicked blocks. */
g['clicked'] = [];
/** Array of arrays of blocks to be removed. */
g['toRemove'] = [];
/** Timer for removal. */
g['removeTimer'] = [];
/** Array of messages to be displayed to user on board. */
g['displayMessages'] = [];
/** Map of images */
g['images'] = [];

g['bed'] = new Image();
g['bed'].src = "cartoon-bed.gif"; // nezta.com

var Game = function() {
  g['canvas'] = document.getElementById('myCanvas');
  g['canvasW'] = g['canvas'].width;
  g['canvasH'] = g['canvas'].height;
  g['squareW'] = Math.round(g['canvasW'] / g['boardW']);
  g['squareH'] = Math.round(g['canvasH'] / g['boardH']);
  g['ctx'] = g['canvas'].getContext('2d');

  /* Board will mimic canvas layout, with origin at left-top, [x][y] corresponds
   * x indices right of of the origin, and y indices down from the origin. */
  g['board'] = new Array(g['boardW']);
  for (var i = 0; i < g['boardW']; i++) {
    g['board'][i] = new Array(g['boardH']);
  }

  loadImgs();
  // g['ctx'].fillRect(50, 150, 50, 100); // Test code for canvas
  initBoard();

  setInterval(update, g['INTERVAL']);

  g['canvas'].addEventListener('mousedown', onMouseDown, false);
  g['canvas'].addEventListener('mouseup', onMouseUp, false);
}

var onMouseDown = function(event) {
  g['mouseDown'] = true;
}

var onMouseUp = function(event) {
  var canvasX = event.pageX - g['canvas'].offsetLeft;
  var canvasY = event.pageY - g['canvas'].offsetTop;

  var xInd = Math.floor(canvasX / g['squareW']);
  var yInd = Math.floor(canvasY / g['squareH']);

  if (xInd === g['boardW']) {
    xInd--;
  }
  if (yInd === g['boardH']) {
    yInd--;
  }

  if (g['clicked'].length === 0) {
    g['clicked'].push(new Pair(xInd, yInd));
  }
  if ((g['clicked'].length >= 1) &&
      (Math.abs((g['clicked'][0]['x'] - xInd))
       + Math.abs((g['clicked'][0]['y'] - yInd))) === 1) {
    g['clicked'].push(new Pair(xInd, yInd));
    swapBlocks();
  } else {
    g['clicked'] = [];
    g['clicked'].push(new Pair(xInd, yInd));
  }

  g['mouseDown'] = false;
}

var Pair = function(xi, yi) {
  this.x = xi;
  this.y = yi;
}

var Message = function(message, color) {
  this.message = message;
  this.color = color;
}

var isZZZ = function(x, y) {
  return x >= g['boardW'] - 2 && y >= g['boardH'] - 2;
}

var isAdjacentToZZZ = function(x, y) {
  return (g[x][y]['icon'] === 'kosbie') &&
         ((x === g['boardW'] - 3 && y === g['boardH'] - 3) ||
          (x === g['boardW'] - 3 && y === g['boardH'] - 2) ||
          (x === g['boardW'] - 3 && y === g['boardH'] - 1) ||
          (x === g['boardW'] - 2 && y === g['boardH'] - 3) ||
          (x === g['boardW'] - 1 && y === g['boardH'] - 3));
}

var swapBlocks = function() {
  var x1, y1, x2, y2;

  if (g['clicked'].length === 2) {
    if ((isZZZ(x1, y1) && isKosbieAndAdjacentToZZZ(x2, y2)) ||
        (isZZZ(x2, y2) && isKosbieAndAdjacentToZZZ(x1, y1))) {
      // TODO: YOU WIN!
    } else if (isZZZ(x1, y1) || isZZZ(x2, y2)) {
      // Can't swap with Zs
      if (x1 >= g['boardW'] - 2 && y1 >= g['boardH'] - 2) {
        g['clicked'] = [];
      }
    } else {
      x1 = g['clicked'][0].x;
      y1 = g['clicked'][0].y;
      x2 = g['clicked'][1].x;
      y2 = g['clicked'][1].y;

      swap(x1, y1, x2, y2);

      // Check for matches in each direction on each block
      matched1 = countMatches(x1, y1);
      matched2 = countMatches(x2, y2);

      if (!(matched1 || matched2)) {
        g['displayMessages'].push(new Message('No Match!', 'red'));
        swap(x1, y1, x2, y2);
      } else {
        //g['removeTimer'] = g['REMOVE_TIME'];//relocated to removeBlocks
        g['displayMessages'].push(new Message('Match!', 'green'));
      }
    }
  }

  g['clicked'] = [];
}

/** Takes two pairs of indices and swaps their corresponding cells. */
var swap = function(x1, y1, x2, y2) {
  var temp = g['board'][x1][y1];
  g['board'][x1][y1] = g['board'][x2][y2];
  g['board'][x2][y2] = temp;
}

/**
 * Checks for matches adjacent to block at position (x, y)
 * If there are sufficient matches to remove the string of blocks, calls remove.
 * Returns true if any blocks were removed, otherwise false.
 */
var countMatches = function(x, y) {
  // Counters set to -1 to avoid double counting the current block
  var nLeft = -1;
  var nRight = -1;
  var nUp = -1;
  var nDown = -1;
  var curX = x;
  var curY = y;
  var valid = false;
  var vAndH = false;

  // Count left
  do {
    nLeft++;
    curX--;
  } while ((curX >= 0) &&
           (g['board'][curX][curY] !== undefined && g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  // Count right
  curX = x;
  do {
    nRight++;
    curX++;
  } while ((curX < g['boardW'])
           && (g['board'][curX][curY] !== undefined && g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  if ((nLeft + nRight + 1) >= 3) {
    valid = true;
    vAndH = true;
    removeBlocks(x, y, nLeft, nRight, 'h', false);
  }

  // Count up
  curX = x;
  do {
    nUp++;
    curY--;
  } while ((curY >= 0)
           && (g['board'][curX][curY] !== undefined && g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  // Count down
  curY = y;
  do {
    nDown++;
    curY++;
  } while ((curY < g['boardH'])
           && (g['board'][curX][curY] !== undefined && g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  if ((nUp + nDown + 1) >= 3) {
    valid = true;
    removeBlocks(x, y, nUp, nDown, 'v', vAndH);
  }

  return valid;

  //g['toRemove'].forEach(function(e) { alert(e.x + " " + e.y); });
}

/**
 * Pushes indices of blocks to be removed for main interval to handle.
 * Takes coordinate of starting block, number adjacent in first direction,
 * number adjacent in second direction, and an option for the direction in which
 * it's checking; 'h' for horizontal, 'v' for vertical.
 */
var removeBlocks = function(x, y, nD1, nD2, dir, doubleCount) {
  var curCoord = [x, y];
  var dirInd;
  var i;
  var blocks = [];

  if (dir === 'h') {
    dirInd = 0;
  } else if (dir === 'v') {
    dirInd = 1;
  } else {
    console.log('Invalid argument to removeBlocks');
  }

  // Tag cells up or left, include the original cell if we are not doubleCounting
  if (!doubleCount) {
    curCoord[dirInd]++;
  } else {
    nD1--;
  }

  for (i = 0; i >= -nD1; i--) {
    curCoord[dirInd]--;
    blocks.push(new Pair(curCoord[0], curCoord[1]));
  }

  curCoord = [x, y];

  // Tag cells down or right, don't include original cell
  for (i = 1; i <= nD2; i++) {
    curCoord[dirInd]++;
    blocks.push(new Pair(curCoord[0], curCoord[1]));
  }

  g['removeTimer'].push(g['REMOVE_TIME']);
  console.log(blocks);
  g['toRemove'].push(blocks);
}

/** Sprite loader. */
var loadImgs = function() {
  var arthur = new Image();
  arthur.src = "arthur.jpg";
  var brandon = new Image();
  brandon.src = "brandon.jpg";
  var chris = new Image();
  chris.src = "chris.jpg";
  var dillon = new Image();
  dillon.src = "dillon.jpg";
  var evan = new Image();
  evan.src = "evan.jpg";
  var liz = new Image();
  liz.src = "liz.jpg";
  var tomer = new Image();
  tomer.src = "tomer.jpg";

  var kosbie0 = new Image();
  kosbie0.src = "kosbie0.png";
  var kosbie1 = new Image();
  kosbie1.src = "kosbie1.png";
  var kosbie2 = new Image();
  kosbie2.src = "kosbie2.png";
  var kosbie3 = new Image();
  kosbie3.src = "kosbie3.png";
  g['kosbies'] = [kosbie0, kosbie1, kosbie2, kosbie3];

  // Just a filler image; bed goes over this.
  var goal = new Image();
  goal.src = "tomer.jpg";

  g['images'] = {
    'arthur': arthur,
    'brandon': brandon,
    'chris': chris,
    'dillon': dillon,
    'evan': evan,
    'liz': liz,
    'tomer': tomer,
    'goal': goal
  }
}

/** Fill in blocks. */
var initBoard = function() {
  for (var col = 0; col < g['boardW']; col++) {
     addBlocksToColumn(col, g['boardH']);
  }
  // Force the top-left to start as Kosbie
  g['board'][0][0] = new Block(['kosbie']);
  // Force the bottom-right corner to be Zs
  // TODO: Disallow swapping with Zs
  // /*
  g['board'][g['boardW'] - 2][g['boardH'] - 2] = new Block(['goal']);
  g['board'][g['boardW'] - 2][g['boardH'] - 1] = new Block(['goal']);
  g['board'][g['boardW'] - 1][g['boardH'] - 2] = new Block(['goal']);
  g['board'][g['boardW'] - 1][g['boardH'] - 1] = new Block(['goal']);
}

/**
 * Drop in numBlocks blocks to specified column.
 * REQUIRES: Board has empty cells for the first numBlocks indices
 */
var addBlocksToColumn = function(col, numBlocks) {
  var banned = [];
  var choices = [];

  var inBounds = function(col, row) {
    return 0 <= col && col < g['boardW'] &&
           0 <= row && row < g['boardH'];
  }

  var getIcon = function(col, row) {
    if (g['board'][col][row] === undefined) {
      return undefined;
    } else {
      return g['board'][col][row]['icon'];
    }
  }

  for (var row = 0; row < numBlocks; row++) {
    // Check left
    if (inBounds(col - 2, row) && inBounds(col - 1, row) &&
        getIcon(col - 2, row) === getIcon(col - 1, row) &&
        getIcon(col - 1, row) !== undefined) {
      banned.push(getIcon(col - 1, row));
    }
    // Check right
    if (inBounds(col + 2, row) && inBounds(col + 1, row) &&
        getIcon(col + 2, row) === getIcon(col + 1, row) &&
        getIcon(col + 1, row) !== undefined) {
      banned.push(getIcon(col + 1, row));
    }
    // Check up
    if (inBounds(col, row - 2) && inBounds(col, row - 1) &&
        getIcon(col, row - 2) === getIcon(col, row - 1) &&
        getIcon(col, row - 1) !== undefined) {
      banned.push(getIcon(col, row - 1));
    }
    // Check down
    if (inBounds(col, row + 2) && inBounds(col, row + 1) &&
        getIcon(col, row + 2) === getIcon(col, row + 1) &&
        getIcon(col, row + 1) !== undefined) {
      banned.push(getIcon(col, row + 1));
    }
    // Check horizontal sandwich
    if (inBounds(col - 1, row) && inBounds(col + 1, row) &&
        getIcon(col - 1, row) === getIcon(col + 1, row) &&
        getIcon(col - 1, row) !== undefined) {
      banned.push(getIcon(col - 1, row));
    }
    // Check vertical sandwich
    if (inBounds(col, row - 1) && inBounds(col, row + 1) &&
        getIcon(col, row - 1) === getIcon(col, row + 1) &&
        getIcon(col, row - 1) !== undefined) {
      banned.push(getIcon(col, row - 1));
    }

    // Consider all non-banned options except Kosbie.
    for (var i = 0; i < g['icons'].length - 1; i++) {
      if (banned.indexOf(g['icons'][i]) === -1) {
        choices.push(g['icons'][i]);
      }
    }

    g['board'][col][row] = new Block(choices);
    banned = [];
    choices = [];
  }
}

/**
 * Drop in numBlocks blocks to specified column.
 * REQUIRES: Board has empty cells for the first numBlocks indices
 */
var addBlocksToRow = function(row, numBlocks) {
  var banned = [];
  var choices = [];

  var inBounds = function(col, row) {
    return 0 <= col && col < g['boardW'] && 0 <= row && row < g['boardH'];
  }

  var getIcon = function(col, row) {
    if (g['board'][col][row] === undefined) {
      return undefined;
    } else {
      return g['board'][col][row]['icon'];
    }
  }

  for (var col = 0; col < numBlocks; col++) {
    if (inBounds(col - 2, row) && inBounds(col - 1, row) &&
        getIcon(col - 2, row) === getIcon(col - 1, row) &&
        getIcon(col - 1, row) !== undefined) {
      banned.push(getIcon(col - 1, row));
    }
    if (inBounds(col + 2, row) && inBounds(col + 1, row) &&
        getIcon(col + 2, row) === getIcon(col + 1, row) &&
        getIcon(col + 1, row) !== undefined) {
      banned.push(getIcon(col + 1, row));
    }
    if (inBounds(col, row - 2) && inBounds(col, row - 1) &&
        getIcon(col, row - 2) === getIcon(col, row - 1) &&
        getIcon(col, row - 1) !== undefined) {
      banned.push(getIcon(col, row - 1));
    }
    if (inBounds(col, row + 2) && inBounds(col, row + 1) &&
        getIcon(col, row + 2) === getIcon(col, row + 1) &&
        getIcon(col, row + 1) !== undefined) {
      banned.push(getIcon(col, row + 1));
    }

    // Consider all non-banned options except Kosbie.
    for (var i = 0; i < g['icons'].length - 1; i++) {
      if (banned.indexOf(g['icons'][i]) === -1) {
        choices.push(g['icons'][i]);
      }
    }

    g['board'][col][row] = new Block(choices);
    banned = [];
    choices = [];
  }
}

/** A Block is an object placed at each cell on the game board. */
var Block = function(choices) {
  var iconIndex = Math.floor(Math.random() * choices.length);
  this['icon'] = choices[iconIndex];
}

/** Function to execute at each interval. */
var update = function() {
  checkRemove();
  draw();
  g['timer']++;
}

/** Handle removal timer and refilling board. */
var checkRemove = function() {
  while (g['removeTimer'].length > 0) {
    for (var i = 0; i < g['removeTimer'].length; i++) {
      if (g['removeTimer'][i] > 0) {
        g['removeTimer'][i]--;
      } else {
        removeShiftAndReplace(i);
        g['removeTimer'].splice(i, 1);
        g['toRemove'].splice(i, 1);
      }
    }
  }
}

/** TODO: Documentation. */
var isHorizontal = function(blocks) {
  if (blocks.length < 2) {
    throw new Error;
  } else {
    return blocks[0].y === blocks[1].y;
  }
}

/** TODO: Documentation. */
var getRightmostCoord = function(blocks) {
  var maxX = -1;
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].x > maxX) {
      maxX = blocks[i].x;
    }
  }
  return maxX;
}

/** TODO: Documentation. */
var getBottommostCoord = function(blocks) {
  var maxY = -1;
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].y > maxY) {
      maxY = blocks[i].y;
    }
  }
  return maxY;
}

/**
 * Remove each array of blocks in toRemove, shift the respective row or column
 * over, then replace the missing blocks.
 * TODO: OMER: Rewrite to take an index and remove only the blocks in g['toRemove'][index]
 */
var removeShiftAndReplace = function(i) {
  var numBlocks;
  var blocks;

  blocks = g['toRemove'][i];
  if (isHorizontal(blocks)) {
    var y = blocks[0].y;
    numBlocks = blocks.length;
    rightmostCoord = getRightmostCoord(blocks);

    // Shift row over, overwriting blocks that were to be removed.
    for (var x = rightmostCoord; x >= numBlocks; x--) {
      g['board'][x][y] = g['board'][x - numBlocks][y];
      g['board'][x - numBlocks][y] = undefined;
    }

    // Check for new cascading matches.
    for (x = rightmostCoord; x >= numBlocks; x--) {
      countMatches(x, y);
    }

    addBlocksToRow(y, numBlocks);
  } else {
    var x = blocks[0].x;
    numBlocks = blocks.length;
    bottommostCoord = getBottommostCoord(blocks);

    // Shift column down, overwriting blocks that were to be removed.
    for (var y = bottommostCoord; y >= numBlocks; y--) {
      g['board'][x][y] = g['board'][x][y - numBlocks];
      g['board'][x][y - numBlocks] = undefined;
    }

    // Check for new cascading matches.
    for (y = bottommostCoord; y >= numBlocks; y--) {
      countMatches(x, y);
    }

    addBlocksToColumn(x, numBlocks);
  }
}

/** Update the canvas with the current game state. */
var draw = function() {
  g['ctx'].fillStyle = 'white';
  g['ctx'].fillRect(0, 0, g['canvasW'], g['canvasH']);
  drawBoxes();
  drawGrid();
  drawMessages();
  g['ctx'].drawImage(
    g['bed'],
    g['canvasW'] - (2 * g['squareW']),
    g['canvasH'] - (2 * g['squareH']),
    2 * g['squareW'],
    2 * g['squareH']
  );
}

/**
 * Given an array of arrays, return an array containing the contents of each
 * array. Does not do a "deep flatten"---only one level.
 */
var flatten = function(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      result.push(array[i][j]);
    }
  }

  return result;
}

/** Draw the boxes the player needs to line up. */
var drawBoxes = function() {
  var i, j, k, l;
  var drawLeft, drawTop, drawWidth, drawHeight;
  var transformed = false;
  var clicked = false;
  var removeFrac;
  var image;
  //var flattenedToRemove = flatten(g['toRemove']);//removed for simultaneous animation

  for (i = 0; i < g['boardW']; i++) {
    for (j = 0; j < g['boardH']; j++) {
      if (g['board'][i][j]['icon'] === 'kosbie') {
        image = g['kosbies'][Math.floor(g['timer'] / 15) % 4];
      } else {
        image = g['images'][g['board'][i][j]['icon']];
      }


      drawLeft = i * g['squareW'];
      drawTop = j * g['squareH'];
      drawWidth = g['squareW'];
      drawHeight = g['squareH'];

      for (k = 0; k < g['clicked'].length; k++) {
        if ((g['clicked'][k].x === i) && (g['clicked'][k].y === j)) {
          clicked = true;
          g['ctx'].fillStyle = '#FF6EC7';
          g['ctx'].fillRect(
            drawLeft,
            drawTop,
            drawWidth,
            drawHeight
          );

          drawLeft = i * g['squareW'] + g['squareW'] / 4;
          drawTop = j * g['squareH'] + g['squareH'] / 4;
          drawWidth = g['squareW'] / 2;
          drawHeight = g['squareH'] / 2;
        }
      }

      for (k = 0; k < g['toRemove'].length; k++) {
        for (l = 0; l < g['toRemove'][k].length; l++) {
          if ((g['toRemove'][k][l].x === i) && (g['toRemove'][k][l].y === j)) {
            transformed = true;
            removeFrac = (g['removeTimer'][k] / g['REMOVE_TIME']);
            g['ctx'].save();
            g['ctx'].translate(
              drawLeft + g['squareW'] / 2,
              drawTop + g['squareH'] / 2
            );
            g['ctx'].rotate(
              (removeFrac * g['N_ROT_DEGREES']) * (Math.PI / 180)
            );
            break;
          }
        }
      }

      g['ctx'].fillStyle = g['colorMap'][g['board'][i][j]['icon']];

      if (transformed) {
        g['ctx'].fillRect(
          (-g['squareW'] / 2) * removeFrac,
          (-g['squareH'] / 2) * removeFrac,
          drawWidth * removeFrac,
          drawHeight * removeFrac
        );

        g['ctx'].drawImage(
          image,
          ((-g['squareW'] / 2) + (g['squareW'] / 6)) * removeFrac,
          ((-g['squareH'] / 2) + (g['squareH'] / 6)) * removeFrac,
          ((2 * drawWidth) / 3) * removeFrac,
          ((2 * drawHeight) / 3) * removeFrac
        );

        g['ctx'].restore();
        transformed = false;
      } else {
        g['ctx'].fillRect(
          drawLeft,
          drawTop,
          drawWidth,
          drawHeight
        );
        if (!clicked) {
          g['ctx'].drawImage(
            image,
            drawLeft + (g['squareW'] / 6),
            drawTop + (g['squareH'] / 6),
            (2 * drawWidth) / 3,
            (2 * drawHeight) / 3
          );
        } else {
          clicked = false;
        }
      }
    }
  }
}

/** Draw a grid to distinguish the boxes */
var drawGrid = function() {
  var i;
  var j;

  for (i = 0; i < g['boardW']; i++) {
    g['ctx'].beginPath();
    g['ctx'].moveTo(i * g['squareW'], 0);
    g['ctx'].lineTo(i * g['squareW'], g['canvasH']);
    g['ctx'].stroke();
  }

  for (j = 0; j < g['boardH']; j++) {
    g['ctx'].beginPath();
    g['ctx'].moveTo(0, j * g['squareH']);
    g['ctx'].lineTo(g['canvasW'], j * g['squareH']);
    g['ctx'].stroke();
  }

}

/** Draw messages to the user contained in g['displayMessages']. */
var drawMessages = function() {

}

new Game();

