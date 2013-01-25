var g = { };
g['boardW'] = 10;
g['boardH'] = 15;
g['INTERVAL'] = 1000 / 60;
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
g['mouseDown'] = false;
g['clicked'] = []; //contains index pairs for which blocks have been clicked


var Game = function() {
  g['canvas'] = document.getElementById('myCanvas');
  g['canvasW'] = g['canvas'].width;
  g['canvasH'] = g['canvas'].height;
  g['squareW'] = Math.round(g['canvasW'] / g['boardW']);
  g['squareH'] = Math.round(g['canvasH'] / g['boardH']);
  g['ctx'] = g['canvas'].getContext('2d');

  /*
   * Board will mimic canvas layout, with origin at left-top, [x][y] corresponds
   * x indices right of of the origin, and y indices down from the origin.
   */
  g['board'] = new Array(g['boardW']);
  for (var i = 0; i < g['boardW']; i++) {
    g['board'][i] = new Array(g['boardH']);
  }

  loadImgs();
  // g['ctx'].fillRect(50, 150, 50, 100); //test code for canvas
  initBoard();

  setInterval(update, g['INTERVAL']);

  g['canvas'].addEventListener('mousedown', onMouseDown, false);
  g['canvas'].addEventListener('mouseup', onMouseUp, false);
}

var onMouseDown = function(event){
  g['mouseDown'] = true;
}

var onMouseUp = function(event){
  /*TODO: Make this do things*/
  var canvasX = event.pageX - g['canvas'].offsetLeft;
  var canvasY = event.pageY - g['canvas'].offsetTop;

  var xInd = Math.floor(canvasX/g['squareW']);
  var yInd = Math.floor(canvasY/g['squareH']);

  if (xInd == g['boardW']){
    xInd--;
  }
  if (yInd == g['boardH']){
    yInd--;
  }

  if(g['clicked'].length === 0){
    g['clicked'].push(new Pair(xInd, yInd));
  }
  else{
    if((Math.abs((g['clicked'][0]['x'] - xInd)) 
        + Math.abs((g['clicked'][0]['y'] - yInd))) === 1){
      g['clicked'].push(new Pair(xInd, yInd));
      swapBlocks();
      g['clicked'] = [];
    }
  }

  g['mouseDown'] = false;
}

var Pair = function(xi, yi){
  this.x = xi;
  this.y = yi;
}

var swapBlocks = function(){
  //TODO: Swap and check for removal
}

/* Sprite loader. */
var loadImgs = function() {

}

/* Fill in blocks. */
var initBoard = function() {
  for (var col = 0; col < g['boardW']; col++) {
     addBlocks(col, g['boardH']);
  }
}

/*
 * Drop in blocks in each column.
 * REQUIRES: Board has empty cells for the first numBlocks indices
 */
var addBlocks = function(col, numBlocks) {
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

/** A Block is an object placed at each cell on the game board. */
var Block = function(choices) {
  var iconIndex = Math.floor(Math.random() * choices.length);
  this['icon'] = choices[iconIndex];
}

/* Function to execute at each interval. */
var update = function() {
  checkUserIn();
  draw();
}

/* Check and update based on user mouse input. */
var checkUserIn = function() {

}

/* Update the canvas with the current game state. */
var draw = function() {
  g['ctx'].fillStyle = 'white';
  g['ctx'].fillRect(0, 0, g['canvasW'], g['canvasH']);
  drawBoxes();
  drawGrid();
}

/* Draw the boxes the player needs to line up */
var drawBoxes = function(){
  var i;
  var j;
  var k;

  for (i = 0; i < g['boardW']; i++) {
    for (j = 0; j < g['boardH']; j++) {

      g['ctx'].fillStyle = g['colorMap'][g['board'][i][j]['icon']];
      for (k = 0; k < g['clicked'].length; k++){
        if((g['clicked'][k].x === i) && (g['clicked'][k].y === j)){
          //TODO: clicked indication
        }
      }
      
      g['ctx'].fillRect(
        i * g['squareW'],
        j * g['squareH'],
        g['squareW'],
        g['squareH']
      );
    }
  }
}

/* Draw a grid to distinguish the boxes */
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

new Game();

