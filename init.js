window.addEventListener("load", function(){ 

	WIDTH = 900;
	HEIGHT = 450;
	scale = 1;

}.bind(this), false);

function initgame(){
	window.gameWindow = window.open("game.html","gameWindow","width="+window.WIDTH+",height="+window.HEIGHT+
		",scrollbars=no,titlebar=no,menubar=no,location=no,directories=no,toolbar=no,resizable=no,status=no");
	window.gameWindow.focus();
}