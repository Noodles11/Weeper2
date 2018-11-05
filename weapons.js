function Tear( kier ){
	this.init( kier );
	window.Files.shotSound();
	window.Shots.push( this );
}
Tear.prototype = {

	size: 6,
	dmg: 1,
	color: 'rgb(200,240,240)',
	life: 0,
	kierunek: 'w',
	speed: 6,
	killing: false,
	stroke: 'rgb(0,0,0)',

	init: function( kier ){

		this.size = (Math.random()*(9-6)+6);
		this.speed = Me.speed+1;
		this.dmg = Me.dmg;

		this.kierunek = (kier ? kier : 'w');

		this.posX = Me.posX+Me.size/2;
		this.posY = Me.posY+Me.size/2;
	},

	draw: function(){

		Sys.ctx.beginPath();
	    Sys.ctx.arc( this.posX, this.posY, this.size, 0, 2*Math.PI, false);
		Sys.ctx.fillStyle = this.color;
		Sys.ctx.fill();
		Sys.ctx.lineWidth = 2;
		Sys.ctx.strokeStyle = this.stroke;
		Sys.ctx.stroke();
	},

	move: function(){

		switch( this.kierunek ){
			case 'w': this.posY-=this.speed;
			break;
			case 's': this.posY+=this.speed;
			break;
			case 'a': this.posX-=this.speed;
			break;
			case 'd': this.posX+=this.speed;
			break;
			default:
			break;
		}

		if ((this.posX-this.size) < 5) this.life=false;
        if ((this.posX+this.size) > Sys.canvas.width-5) this.life=false;
        if ((this.posY-this.size) < 5) this.life=false;
        if ((this.posY+this.size) > Sys.canvas.height-5) this.life=false;

		if(this.life!==false) this.life++;
	},

	kill: function( delay ){

		if( !this.killing ){ //zeby sie wykonalo raz - flaga

			window.Files.shotSplat();

			this.dmg = 0;

				 if( this.kierunek=='w' ) this.kierunek='s';
			else if( this.kierunek=='s' ) this.kierunek='w';
			else if( this.kierunek=='a' ) this.kierunek='d';
			else if( this.kierunek=='d' ) this.kierunek='a';
			this.speed = 0.5;
			if( delay==0 ) this.stroke = 'rgba(0,0,0,0.6)';

			this.killing = setInterval(function(){
				if( delay==0 ){
					this.size+=1;
				} //hit mob
				else {
					this.size>1 ? this.size-=2 : this.size = 0;
				} //hit wall or die

				this.move();

				if( (delay!=0 && this.size<=0) || (delay==0 && this.size>=15) ){
					window.Shots.splice(window.Shots.indexOf(this),1);
					clearInterval(this.killing);
					delete this;
				}
			}.bind(this),delay);

		}
	},

};