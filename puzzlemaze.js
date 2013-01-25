var g = {};
g['boardW'] = 10;
g['boardH'] = 15;
g['INTERVAL'] = 1000/60;
g['icons'] = ['evan', 'tomer', 'brandon', 'dillon', 'arthur'];
g['colorMap'] = {
  'evan' : 'green',
  'tomer' : 'blue',
  'brandon' : 'red',
  'dillon' : 'yellow',
  'arthur' : 'orange'
};


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
}

/* Sprite loader. */
var loadImgs = function() {

}

/* Fill in blocks. */
var initBoard = function() {
  for (var i = 0; i < g['boardW']; i++) {
     addBlocks(i, g['boardH']);
  }
}

/*
 * Drop in blocks in each column.
 * REQUIRES: board has empty cells for the first numBlocks indeces
 */
var addBlocks = function(col, numBlocks) {
  for (var i = 0; i < numBlocks; i++) {
    g['board'][col][i] = new Block();
  }
}

/*
 * A Block is an object placed at each cell on the game board.
 *
 * TODO: How do we ensure the game doesn't start with 3 adjacent colors
 *       pregenerate valid boards?
 */
var Block = function() {
  this['iconInd'] = Math.floor(Math.random() * g['icons'].length);
  this['icon'] = g['icons'][this['iconInd']];
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
  var i;
  var j;

  for (i = 0; i < g['boardW']; i++) {
    for (j = 0; j < g['boardH']; j++) {
      g['ctx'].fillStyle = g['colorMap'][g['board'][i][j]['icon']];
      g['ctx'].fillRect(
        i * g['squareW'],
        j * g['squareH'],
        g['squareW'],
        g['squareH']
      );
    }
  }

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

