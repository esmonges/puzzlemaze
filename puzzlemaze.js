var g = {};
g['W'] = 10;
g['H'] = 20;


var Game = function(){

    g['board'] = new Array(g['width']);
    for (var i = 0; i < g['width']; i++){
        g['board'][i] = new Array(g['height']);
    }

    loadImgs();
    initBoard();

}

var loadImgs = function(){

}

var initBoard = function(){
    
}

new Game();