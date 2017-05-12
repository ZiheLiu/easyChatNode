import config from './config';
import utils from './utils';
import Canvas from './canvas'

let socket = null;

$('#startButton').on('click', function () {
  config.player.username = $('#playerNameInput').val();
  console.log('user: [username]' + config.player.username + ' click start');

  socket = io();
  socket.on('connect', function () {
    $('#startMenu').hide();
    $('#gameAreaWrapper').show();
    $('html').addClass('body-game');
    console.log('serverWelcome: [socket.id]' + socket.id);
    socket.emit('clientRequestLogin', config.player.username);

    initGame();
  });

  socket.on('serverMove', function (curPlayer, seenPlayers) {
    config.player.x = curPlayer.x;
    config.player.y = curPlayer.y;
    config.player.radius = curPlayer.radius;
    config.player.color = curPlayer.color;

    config.originX = config.player.x - config.curWidth / 2;
    config.originY = config.player.y - config.curHeight / 2;

    Canvas.clearCanvas();
    drawGrid();

    for(let i = 0; i<seenPlayers.length; i++) {
      drawPlayer(seenPlayers[i]);
    }

    console.log('serverMove :', curPlayer.x, curPlayer.y, seenPlayers);
  });

});


function initGame() {
  config.curHeight = document.body.offsetHeight;
  config.curWidth = document.body.offsetWidth;
  Canvas.Canvas(document.getElementById("gameCanvas"), config.curWidth, config.curHeight);

  socket.emit('clientWindowResize', config.curWidth, config.curHeight);

  gameLoop();
}

function drawGrid() {
  let startX = Math.ceil((config.player.x - config.curWidth/2)/config.gridLen)*config.gridLen - config.originX;
  let endX = Math.ceil((config.player.x + config.curWidth/2)/config.gridLen)*config.gridLen - config.originX;
  let startY = Math.ceil((config.player.y - config.curHeight/2)/config.gridLen)*config.gridLen - config.originY;
  let endY = Math.ceil((config.player.y + config.curHeight/2)/config.gridLen)*config.gridLen - config.originY;

  Canvas.drawGrid(startX, endX, startY, endY);

  if(config.player.y <= config.curHeight/2){
    startX = Math.max(0, config.player.x-config.curWidth/2) - config.originX;
    endX = Math.min(config.maxWidth, config.player.x + config.curWidth/2) - config.originX;
    startY = 0 - config.originY;
    Canvas.drawLine(startX, startY, endX, startY);
  }
  else if(config.player.y + config.curHeight/2 >= config.maxHeight){
    startX = Math.max(0, config.player.x-config.curWidth/2) - config.originX;
    endX = Math.min(config.maxWidth, config.player.x + config.curWidth/2) - config.originX;
    startY = config.maxHeight - config.originY;
    Canvas.drawLine(startX, startY, endX, startY);
  }

  if(config.player.x <= config.curWidth/2) {
    startY = Math.max(0, config.player.y-config.curHeight/2) - config.originY;
    endY = Math.min(config.maxHeight, config.player.y + config.curHeight/2) - config.originY;
    startX = 0 - config.originX;
    Canvas.drawLine(startX, startY, startX, endY);
  }
  else if(config.player.x + config.curWidth/2 >= config.maxWidth){
    startY = Math.max(0, config.player.y-config.curHeight/2) - config.originY;
    endY = Math.min(config.maxHeight, config.player.y + config.curHeight/2) - config.originY;
    startX = config.maxWidth - config.originX;
    Canvas.drawLine(startX, startY, startX, endY);
  }

}

// function drawPlayer() {
//   let position = utils.getCanvasXY(config.player.x, config.player.y);
//   Canvas.drawCircle(position.x, position.y, config.player.radius, config.player.color, config.player.username);
// }

function drawPlayer(player) {
  let position = utils.getCanvasXY(player.x, player.y);
  Canvas.drawCircle(position.x, position.y, player.radius, player.color, player.username);
}

function gameLoopFun() {
  for(let i = 0; i<Canvas.isKeyPress.length; i++) {
    if(Canvas.isKeyPress[i]) {
      socket.emit('clientMove'+i);
    }
  }
}

window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.msRequestAnimationFrame     ||
    function( callback ) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function gameLoop() {
  window.requestAnimFrame(gameLoop);
  gameLoopFun();
}