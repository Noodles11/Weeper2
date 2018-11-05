function Mob( x, y ){
	if( x && y )
		this.init( x, y );
	else
		this.init();

	window.Mobs.push( this );
	window.lastMobTime = new Date().getTime();
}
Mob.prototype = {

	size: 20,
	color: false,
	basecolor: 'rgb(0,0,0)',
	stroke: 'rgb(100,100,100)',
	exp: 1,

	hp: [10,10],
	dmg: 0,

	posX: 10,
	posY: 10,

	speed: 0.5,
	falling: false,

	init: function( x, y ){

		this.size = (Math.random()*(25-13)+13);
		this.exp = Math.ceil((Math.random()/10)*Me.stats.exp[1]);

		this.hp = [Me.level*3,Me.level*3];
		this.dmg = this.size*Me.level;

		var r = Math.ceil(Math.random()*(255-230)+230);
		var g = Math.ceil(Math.random()*(100-50)+50);
		var b = Math.ceil(Math.random()*(100-50)+50);
		this.basecolor = 'rgb('+r+','+g+','+b+')';

		this.posX = (x ? x : (Math.random()*((Sys.canvas.width-20)-20)+20));
		this.posY = (y ? y : (Math.random()*((Sys.canvas.height-20)-20)+20));

		this.shadowspace = Math.random()*15;
		this.jump();

		// console.log('new Mob',this);
	},

	move: function( x, y ){

		if( !x && !y ){

			if( (!this.kierX || !this.kierY) || this.falling ){
				this.kierX = Math.random()*2-1;
				this.kierY = Math.random()*2-1;
			}

			var x;
			if( this.kierX>0 || (this.posX + this.size/2 + this.speed <= 0) ){ x = this.posX + this.speed; }
			else if( this.kierX<0 || (this.posX - this.size/2 - this.speed >= Sys.canvas.width) ){ x = this.posX - this.speed; }
			else { x = this.posX; }

			var y;
			if( this.kierY>0 || (this.posY + this.size/2 + this.speed <= 0) ){ y = this.posY + this.speed }
			else if( this.kierY<0 || (this.posY - this.size/2 - this.speed >= Sys.canvas.height) ){ y = this.posY - this.speed }
			else { y = this.posY; }

		}

		this.posX = x;
		this.posY = y;
	},

	jump: function(){

		if( this.shadowspace >= 15 ) this.falling = true;
		else if( this.shadowspace <= 0 ) this.falling = false;

		if( this.falling ) this.shadowspace-=0.7;
		else this.shadowspace+=0.5;
	},

	shadow: function(){

		this.jump();

		Visual.shadow( this.posX, this.posY, this.size+this.shadowspace, this.size/2, 'rgba(0,0,0,0.05)' );
	},

	draw: function(){

		Sys.ctx.beginPath();
	    Sys.ctx.arc( this.posX, this.posY, this.size, 0, 2*Math.PI, false);
		Sys.ctx.fillStyle = (this.color ? this.color : this.basecolor);
		Sys.ctx.fill();
		Sys.ctx.lineWidth = 3;
		Sys.ctx.strokeStyle = this.stroke;
		Sys.ctx.stroke();
	},

	kill: function(){

		window.Files.mobKill();
		window.Mobs.splice(window.Mobs.indexOf(this),1);

		new Exp( this.posX, this.posY, this.exp );
		// Me.addExp( this.exp );

		if( Math.random() > 0.9 )
			new Heart( this.posX-30, this.posY, Math.ceil(Me.stats.hp[1]/10) );

		delete this;
	},

	getPosition: function(){

		return [this.posX, this.posY];
	},

	hit: function( dmg ){

		if( this.hp[0]-(dmg ? dmg : 1) <= 0 ){
			this.kill();
		}
		else{
			this.hp[0] -= (dmg ? dmg : 1);
		}
	},

	touched: function( flag ){

		if( flag )
		{
			var time = new Date().getTime();
			this.color = 'black';

			if( time-Me.prevHitTime > window.hitDelay ){
				Me.changeHP( (-this.dmg) );
				Me.prevHitTime = time;
			}
		}
		else
		{
			this.color = false;
		}
	},


};