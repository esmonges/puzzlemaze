var g = {};
g['boardW'] = 10;
g['boardH'] = 20;
g['squareL'] = 10;
g['icons'] = ['evan', 'tomer', 'brandon', 'dillon', 'arthur'];



var Game = function(){

    g['canvas'] = document.getElementById('myCanvas');
    g['canvasW'] = g['canvas'].width;
    g['canvasH'] = g['canvas'].height;
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

var Block = function(){
    this['iconInd'] = Math.floor(Math.random()*g['icons'].length);
    this['icon'] = g['icons'][this['iconInd']];
}

new Game();