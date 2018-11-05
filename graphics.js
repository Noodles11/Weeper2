function Graphics(){
	this.shadow();
}
Graphics.prototype = {

	shadow: function( posX, posY, space, radius, color ){

	    Sys.ctx.beginPath();
		for (var i = 0.03 * Math.PI; i < 2 * Math.PI; i += 0.01 ) {
		    xPos = posX - (radius*0.7 * Math.sin(i)) * Math.sin(0 * Math.PI) + (radius*2.3 * Math.cos(i)) * Math.cos(0 * Math.PI);
		    yPos = posY+space + (radius*2.3 * Math.cos(i)) * Math.sin(0 * Math.PI) + (radius*0.7 * Math.sin(i)) * Math.cos(0 * Math.PI);

		    if (i == 0) {
		        Sys.ctx.moveTo(xPos, yPos);
		    } else {
		        Sys.ctx.lineTo(xPos, yPos);
		    }
		}
		Sys.ctx.fillStyle = color;
		Sys.ctx.fill();
		Sys.ctx.closePath();
	},

};