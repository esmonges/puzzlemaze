var g = { };
g['boardW'] = 10;
g['boardH'] = 15;
g['INTERVAL'] = 1000 / 60;
g['REMOVE_TIME'] = 50;
g['N_ROT_DEGREES'] = 180;
g['icons'] = ['evan', 'tomer', 'brandon', 'dillon', 'arthur', 'chris'];
g['colorMap'] = {
  'evan' : 'green',
  'tomer' : 'blue',
  'brandon' : 'red',
  'dillon' : 'yellow',
  'arthur' : 'orange',
  'chris' : 'cyan'
  // TODO: Lol there are more TAs...
  //yea these are the only ones i could remember
};

/** Whether the mouse is down or not. */
g['mouseDown'] = false;
/** Array of pairs of indices representing clicked blocks. */
g['clicked'] = [];
/** Array of blocks to be removed. */
g['toRemove'] = [];
/** Timer for removal. */
g['removeTimer'] = 0;
/** Array of messages to be displayed to user on board. */
g['displayMessages'] = [];

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

var swapBlocks = function() {
  var x1, y1, x2, y2;
  if (g['clicked'].length === 2) {
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
      g['removeTimer'] = g['REMOVE_TIME'];
      g['displayMessages'].push(new Message('Match!', 'green'));
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

  // Count left
  do {
    nLeft++;
    curX--;
  } while ((curX >= 0) &&
           (g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  // Count right
  curX = x;
  do {
    nRight++;
    curX++;
  } while ((curX < g['boardW']) 
           && (g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  if ((nLeft + nRight + 1) >= 3) {
    valid = true;
    removeBlocks(x, y, nLeft, nRight, 'h');
  }

  // Count up
  curX = x;
  do {
    nUp++;
    curY--;
  } while ((curY >= 0)
           && (g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  // Count down
  curY = y;

  do {
    nDown++;
    curY++;
  } while ((curY < g['boardH'])
           && (g['board'][curX][curY]['icon'] === g['board'][x][y]['icon']));

  if ((nUp + nDown + 1) >= 3) {
    valid = true;
    removeBlocks(x, y, nUp, nDown, 'v');
  }

  return valid;

  //g['toRemove'].forEach(function(e){alert(e.x + " " + e.y);});
}

/**
 * Pushes indices of blocks to be removed for main interval to handle.
 * Takes coordinate of starting block, number adjacent in first direction,
 * number adjacent in second direction, and an option for the direction in which
 * it's checking; 'h' for horizontal, 'v' for vertical.
 */
var removeBlocks = function(x, y, nD1, nD2, dir) {
  var curCoord = [x, y];
  var dirInd;
  var i;

  if (dir === 'h') {
    dirInd = 0;
  } else if (dir === 'v') {
    dirInd = 1;
  } else {
    console.log('Invalid argument to removeBlocks');
  }

  // Tag cells up or left, include the original cell
  curCoord[dirInd]++;
  for (i = 0; i >= -nD1; i--) {
    curCoord[dirInd]--;
    g['toRemove'].push(new Pair(curCoord[0], curCoord[1]));
  }

  curCoord = [x, y];

  // Tag cells down or right, don't include original cell
  for (i = 1; i <= nD2; i++) {
    curCoord[dirInd]++;
    g['toRemove'].push(new Pair(curCoord[0], curCoord[1]));
  }
}

/** Sprite loader. */
var loadImgs = function() {

}

/** Fill in blocks. */
var initBoard = function() {
  for (var col = 0; col < g['boardW']; col++) {
     addBlocksToColumn(col, g['boardH']);
  }
}

/**
 * Drop in numBlocks blocks to specified column.
 * REQUIRES: Board has empty cells for the first numBlocks indices
 */
var addBlocksToColumn = function(col, numBlocks) {
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

  for (var row = 0; row < numBlocks; row++) {
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

    g['icons'].forEach(function(icon) {
      if (banned.indexOf(icon) === -1) {
        choices.push(icon)
      }
    })

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

    g['icons'].forEach(function(icon) {
      if (banned.indexOf(icon) === -1) {
        choices.push(icon)
      }
    })

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
}

/** Handle removal timer and refilling board. */
var checkRemove = function() {
  if (g['removeTimer'] > 0) {
    g['removeTimer']--;
  } else {
    replaceRemoved();
    g['toRemove'] = [];
  }
}

/** Remove blocks in toRemove and replace them. */
var replaceRemoved = function() {

}

/** Update the canvas with the current game state. */
var draw = function() {
  g['ctx'].fillStyle = 'white';
  g['ctx'].fillRect(0, 0, g['canvasW'], g['canvasH']);

  drawBoxes();
  drawGrid();
  drawMessages();
}

/** Draw the boxes the player needs to line up. */
var drawBoxes = function() {
  var i, j, k;
  var drawLeft, drawTop, drawWidth, drawHeight;
  var transformed = false;
  var removeFrac;

  for (i = 0; i < g['boardW']; i++) {
    for (j = 0; j < g['boardH']; j++) {

      drawLeft = i * g['squareW'];
      drawTop = j * g['squareH'];
      drawWidth = g['squareW'];
      drawHeight = g['squareH'];

      for (k = 0; k < g['clicked'].length; k++){
        if ((g['clicked'][k].x === i) && (g['clicked'][k].y === j)) {
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
        if ((g['toRemove'][k].x === i) && (g['toRemove'][k].y === j)) {
          transformed = true;
          removeFrac = (g['removeTimer'] / g['REMOVE_TIME']);
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

      g['ctx'].fillStyle = g['colorMap'][g['board'][i][j]['icon']];

      if (transformed) {
        g['ctx'].fillRect(
          (-g['squareW'] / 2) * removeFrac,
          (-g['squareH'] / 2) * removeFrac,
          drawWidth * removeFrac,
          drawHeight * removeFrac
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
      }
    }
  }
}

/** Draw a grid to distinguish the boxes */
var drawGrid = function(){
  var i;
  var j;

  for (i = 0; i < g['boardW']; i++){
    g['ctx'].beginPath();
    g['ctx'].moveTo(i * g['squareW'], 0);
    g['ctx'].lineTo(i * g['squareW'], g['canvasH']);
    g['ctx'].stroke();
  }

  for (j = 0; j < g['boardH']; j++){
    g['ctx'].beginPath();
    g['ctx'].moveTo(0, j * g['squareH']);
    g['ctx'].lineTo(g['canvasW'], j * g['squareH']);
    g['ctx'].stroke();
  }

}

/** Draw messages to the user contained in g['displayMessages']. */
var drawMessages = function(){

}

new Game();

