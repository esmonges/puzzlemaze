var g = {};
g['boardW'] = 10;
g['boardH'] = 20;
g['INTERVAL'] = 1000/60;
g['icons'] = ['evan', 'tomer', 'brandon', 'dillon', 'arthur'];
g['colorMap'] = {'evan' : 'green',
                 'tomer' : 'blue',
                 'brandon' : 'red',
                 'dillon' : 'yellow',
                 'arthur' : 'orange'};



var Game = function(){

    g['canvas'] = document.getElementById('myCanvas');
    g['canvasW'] = g['canvas'].width;
    g['canvasH'] = g['canvas'].height;
    g['squareW'] = Math.round(g['canvasW']/g['boardW']);
    g['squareH'] = Math.round(g['canvasH']/g['boardH']);
    g['ctx'] = g['canvas'].getContext('2d');

    /*
     * Board will mimic canvas layout, with origin at left-top, [x][y] corresponds x indeces right of
     * of the origin, and y indeces down from the origin
     */
    g['board'] = new Array(g['boardW']);
    for (var i = 0; i < g['boardW']; i++){
        g['board'][i] = new Array(g['boardH']);
    }

    loadImgs();
    //g['ctx'].fillRect(50, 150, 50, 100); //test code for canvas
    initBoard();

    setInterval(update, g['INTERVAL']);

}

/*
 * sprite loader 
 */
var loadImgs = function(){

}

/*
 * fill in blocks
 */
var initBoard = function(){
    for(var i = 0; i < g['boardW']; i++){
        addBlocks(i, g['boardH']);
    }
}

/*
 * drop in blocks in each col
 * REQUIRES: board has empty cells for the first numBlocks indeces
 */
var addBlocks = function(col, numBlocks){
    for(var i = 0; i < numBlocks; i++){
        g['board'][col][i] = new Block();
    }
}

/*
 * Block - object placed at each cell on the game board

TODO: how do we ensure the game doesn't start with 3 adjacent colors
    pregenerate valid boards?
 */
var Block = function(){
    this['iconInd'] = Math.floor(Math.random()*g['icons'].length);
    this['icon'] = g['icons'][this['iconInd']];
}

/*
 * update - the function that executes at each interval
 */
var update = function(){
    checkUserIn();
    draw();
}

/*
 * checkUserIn - checks and updates based on user mouse input
 */
var checkUserIn = function(){

}

/*
 * draw - update the canvas with the current game state
 */
var draw = function(){
    for(var i = 0; i < g['boardW']; i++){
        for(var j = 0; j < g['boardH']; j++){
            g['ctx'].fillStyle = g['colorMap'][g['board'][i][j]['icon']];
            g['ctx'].fillRect(i*g['squareW'], j*g['squareH'], g['squareW'], g['squareH']);
        }
    }
}

new Game();