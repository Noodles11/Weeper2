window.addEventListener("load", function(){ 

	StatBar = {
		hp: document.getElementById('myHP'),
		mp: document.getElementById('myMP'),
		exp: document.getElementById('myEXP'),
		time: document.getElementById('gameTime')
	};

	WIDTH = 900;
	HEIGHT = 400;
	scale = 1;
	belka = 50;
	pause = true;
	fps = 60;
	gameStart = 0;
	prevTime = 0;
	lastMobTime = 0;
	hitDelay = 700; //ms

	pauseMask = document.getElementById('pause');

	Files = {
		playerAvatar: 'av.png',
		items: {
			heart: 'items/heart.png',
			exp: 'items/exp.png',
		},
		shotSound: function(){ var a=new Audio("shot.wav"); a.volume=0.3; a.play();},
		shotSplat: function(){new Audio("splat2.wav").play();},
		mobKill: function(){new Audio("kill.wav").play();},
		ouch: function(){ var a=new Audio("ouch.mp3"); a.play();},
		lvlup: function(){ var a=new Audio("lvlup.mp3"); a.play();},
		plum: function(){ var a=new Audio("plum.mp3"); a.play();},
		sparkle: function(){ var a=new Audio("sparkle.wav"); a.play();},
	};

	LevelExp = [
		100,
		250,
		600,
		1400,
		2000,
		4500,
		6500,
		10000
	];

	Sys = new Main();
	Visual = new Graphics();
	Me = new Player();
	Shots = [];
	Mobs = [];
	Items = [];	

}.bind(this), false);

function restart(){

	window.close();
    	
}
function Main(){
	this.init();
}
function Player(){
	this.init();
	// this.shot = new Shot();
}
//---------------------------------------------------------------------------------------PLAYER
Player.prototype = {

	defSize: 32,
	size: 32,
	level: 1,

	avatar: null,

	posX: 0,
	posY: 0,

	speed: 5,
	acc: 0.7,

	shotDelay: 360, //ms
	shotRange: 70, //px
	prevHitTime: 0,

	stats: {
		hp: [100,100],
		mp: [100,100],
		exp: [0,100]
	},

	weapon: 'tear',
	dmg: 1,

	getPosition: function(){

		return [this.posX, this.posY];
	},

	shoot: function( kierunek ){
		switch( this.weapon )
		{
			case 'tear':
			default:
				new Tear( kierunek );
				break;
		}
	},

	init: function(){

		this.level = 1;

		this.avatar = new Image();
	    this.avatar.src = window.Files.playerAvatar;

		this.move( Sys.canvas.width/2, Sys.canvas.height/2 );

	},

	shadow: function(){

		Visual.shadow( this.posX+this.size/2, this.posY, this.size+10, this.size/4.5, 'rgba(0,0,0,0.06)' );
	},

	draw: function(){

		Sys.ctx.drawImage(this.avatar, this.posX, this.posY, this.size, this.size);
	},

	scaleSize: function( scale ){

		this.size = this.defSize*(scale ? scale : window.scale);

		return this.size;
	},

	move: function( x, y ){

		this.posX = x;
		this.posY = y;
	},

	kill: function(){

		this.stats.hp[0] = 0;

		Sys.canvas.remove();
	},

	addExp: function( exp ){

		this.stats.exp[0] += exp;
		console.log('exp +'+exp);
		this.checkLevel();
	},

	checkLevel: function(){

		while( this.stats.exp[0] >= this.stats.exp[1] ){
			this.addLevel();
			console.info('nowy poziom! -> '+this.level);
			this.stats.exp[0] -= this.stats.exp[1];
			this.stats.exp[1] = (window.LevelExp[ this.level-1 ] ? window.LevelExp[ this.level-1 ] : window.LevelExp[ 7 ]);
		}
	},

	addLevel: function(){

		window.Files.lvlup();

		//add level
		this.level++;

		//better stats
		this.stats.hp[1] += this.level*10;
		this.stats.mp[1] += this.level*5;
		this.dmg = this.level;

		//refill
		this.stats.hp[0] = this.stats.hp[1];
		this.stats.mp[0] = this.stats.mp[1];
	},

	changeHP: function( ile ){

		if( ile > 0 ){
			if( Me.stats.hp[0]+ile > Me.stats.hp[1] ) Me.stats.hp[0]=Me.stats.hp[1];
			else Me.stats.hp[0]+=ile;

			console.info('+'+ile+' HP');
		} else {
			if( Me.stats.hp[0]+ile <= 0 ) this.kill();
			else{
				window.Files.ouch();
				Me.stats.hp[0]+=ile;
			}

			console.info(ile+' HP');
		}
	},

};
//---------------------------------------------------------------------------------------MAIN
Main.prototype = {

	keys: { 
		38:false, 40:false, 37:false, 39:false, //gora dol lewo prawo
		87:false, 83:false, 65:false, 68:false, //w s a d
	},
	deltaKeys: { 37:0, 38:0, 39:0, 40:0 },
    rightKey: false,
    leftKey: false,
    upKey: false,
    downKey: false,

    init: function(){

    	window.pause = true;
    	window.pauseMask.style.display = 'block';

    	this.canvas = document.getElementById('canvas') ? document.getElementById('canvas') : document.createElement('canvas');
    	this.ctx = this.canvas.getContext('2d');

    	window.addEventListener("keydown", this.onKeyDown.bind(this), false);
    	window.addEventListener("keyup", this.onKeyUp.bind(this), false);
    	window.addEventListener("resize", this.onResizeWindow.bind(this), false);
    	// window.addEventListener("click", this.onMouseClick.bind(this), false);

    	this.canvas.width = window.WIDTH*window.scale;
        this.canvas.height = window.HEIGHT*window.scale;
        
        // this.onResizeWindow();
        window.gameStart = new Date();

        this.gameLoop();
        // setInterval(this.gameLoop.bind(this), 1000/window.fps);
    },

    gameLoop: function(){

    	requestAnimationFrame( this.gameLoop.bind(this) );

    	if( !window.pause )
    	{

    	var time = new Date().getTime() - window.gameStart.getTime();
    	StatBar.time.innerHTML = (new Date(time).getHours()-1 < 10 ? '0'+new Date(time).getHours()-1 : new Date(time).getHours()-1)+':'+(new Date(time).getMinutes() < 10 ? '0'+new Date(time).getMinutes() : new Date(time).getMinutes());

    	//chodzenie
	    	$.each([37,38,39,40],function(i,el){
	    		if( this.keys[el] && (time-window.prevTime > Me.shotDelay) ){
	    			var kierunek = 'w';
		    		switch( el ){
		    			case 38: kierunek = 'w';
		    			break;
		    			case 40: kierunek = 's';
		    			break;
		    			case 37: kierunek = 'a';
		    			break;
		    			case 39: kierunek = 'd';
		    			break;
		    		}
		    		Me.shoot( kierunek );
		    		window.prevTime = time;
		       	}
	    	}.bind(this));

    	//strzalki
    	$.each([87,83,65,68],function(i,el){
    		if( this.keys[el] ){ //speed up

    			var addSpeed = (this.deltaKeys[el]>1 ? this.deltaKeys[el]*Me.acc : Me.acc);

	    		if( this.deltaKeys[el]+addSpeed < Me.speed ) this.deltaKeys[el] += addSpeed;
	    		else this.deltaKeys[el] = Me.speed;

	       	} else { //speed down

	       		if( this.deltaKeys[el]-Me.acc > 0 ) this.deltaKeys[el] -= Me.acc;
	       		else this.deltaKeys[el] = 0;

	       	}
    	}.bind(this));


    	this.move();
    	this.draw();
    	this.updatePlayerStats();

    	this.makeMobs();

    	}
    },

    makeMobs: function(){

    	var time = new Date().getTime();

    	if( time-window.lastMobTime > Math.random()*(7000-2000)+2000 ) //ms
    		new Mob();
    },

    onResizeWindow: function(){

    	window.resizeTo(window.WIDTH+15,window.HEIGHT+120);

    	// var prevScale = window.scale;

    	// var scaleX = window.innerWidth / window.WIDTH;
    	// var scaleY = window.innerHeight / window.HEIGHT;
    	// window.scale = ( window.innerWidth < window.innerHeight ? scaleX : scaleY );

     //    this.canvas.width = window.WIDTH*window.scale - window.belka;
     //    this.canvas.height = window.HEIGHT*window.scale - window.belka;

     //    Me.scaleSize();
     //    Me.move( (Me.posX/prevScale)*window.scale, (Me.posY/prevScale)*window.scale );
    },

    clearCanvas: function(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    move: function(){

    	if (this.deltaKeys[68]) Me.posX += this.deltaKeys[68];
        else if (this.deltaKeys[65]) Me.posX -= this.deltaKeys[65];
        if (this.deltaKeys[87]) Me.posY -= this.deltaKeys[87];
        else if (this.deltaKeys[83]) Me.posY += this.deltaKeys[83];

        if (Me.posX <= 0) Me.posX = 0;
        if ((Me.posX + Me.size) >= this.canvas.width) Me.posX = this.canvas.width - Me.size;
        if (Me.posY <= 0) Me.posY = 0;
        if ((Me.posY + Me.size) >= this.canvas.height) Me.posY = this.canvas.height - Me.size;
    },

    draw: function(){

        this.clearCanvas();
        
		Me.shadow();

		//draw mobs shadows
    	for(var i in window.Mobs){
    		if( window.Mobs[i] ){
    			Mobs[i].move();
	    		Mobs[i].shadow();
    		}
    	}

    	//draw mobs
    	for(var i in window.Mobs){
    		if( window.Mobs[i] ){
	    		Mobs[i].draw();
	    		this.isMobShot( Mobs[i] );
	    		this.playerTouch( Mobs[i] );
    		}
    	} 

    	//draw items
    	for(var i in window.Items){
    		if( window.Items[i] ){
	    		var el = Items[i];
	    		el.draw();
	    		this.playerTouch( el );
    		}
    	} 

    	//draw shots
    	for(var i in window.Shots){
    		if( window.Shots[i] ){
	    		var el = Shots[i];
	    		el.draw();
	    		el.move();
	    		if( (el.life===false || el.life > Me.shotRange) && !el.killing ){
	    			el.kill(100);
	    		}
    		}
    	}

        //draw player
        Me.draw();
    },

    updatePlayerStats: function(){

    	StatBar.hp.children[0].innerHTML = Math.floor(Me.stats.hp[0]);
    	StatBar.mp.children[0].innerHTML = Math.floor(Me.stats.mp[0]);
    	StatBar.exp.children[0].innerHTML = Math.floor(Me.stats.exp[0]);
    	StatBar.hp.setAttribute('max',Me.stats.hp[1]);
    	StatBar.mp.setAttribute('max',Me.stats.mp[1]);
    	StatBar.exp.setAttribute('max',Me.stats.exp[1]);

    	//pasek
    	StatBar.hp.children[1].style.width = Math.ceil((Me.stats.hp[0]/Me.stats.hp[1])*100)+'%';
    	StatBar.mp.children[1].style.width = Math.ceil((Me.stats.mp[0]/Me.stats.mp[1])*100)+'%';
    	StatBar.exp.children[1].style.width = Math.ceil((Me.stats.exp[0]/Me.stats.exp[1])*100)+'%';
    },

    isMobShot: function( mob ){

    	mob.stroke = 'rgb(100,100,100)';

    	for(var i in window.Shots){
    		if( window.Shots[i] ){
    			var shot = window.Shots[i];

    			if( (shot.posX+(shot.size*2) > mob.posX-(mob.size/2) && shot.posX-(shot.size*2) < mob.posX+(mob.size/2)) && (shot.posY+(shot.size*2) > mob.posY-(mob.size/2) && shot.posY-(shot.size*2) < mob.posY+(mob.size/2)) ){
    				mob.stroke = 'red';
    				mob.hit( shot.dmg );
    				shot.kill(0);
    			}
    		}
    	}

    },

    playerTouch: function( el ){

    	if( (Me.posX+(Me.size) > el.posX-(el.size/2) && Me.posX < el.posX+(el.size/2)) && (Me.posY+(Me.size) > el.posY-(el.size/2) && Me.posY < el.posY+(el.size/2)) ){
			el.touched( true );
       	} else {
       		el.touched( false );
       	}
    },

    onKeyDown: function(evt){

    	if( evt.keyCode==37 || evt.keyCode==38 || evt.keyCode==39 || evt.keyCode==40 || 
    		evt.keyCode==87 || evt.keyCode==83 || evt.keyCode==65 || evt.keyCode==68 )
    		this.keys[ evt.keyCode ] = true;

    	if( evt.keyCode==32 )
    	{
    		window.pause = !window.pause;
	        window.pause ? window.pauseMask.style.display = 'block' : window.pauseMask.style.display = 'none';
        }

        evt.preventDefault();
        evt.stopPropagation();
    },

    onKeyPress: function(evt){

    	
    },

    onKeyUp: function(evt){

    	this.keys[ evt.keyCode ] = false;

        evt.preventDefault();
        evt.stopPropagation();
    },

    onMouseClick: function(evt){

        window.pause = !window.pause;
        window.pause ? window.pauseMask.style.display = 'block' : window.pauseMask.style.display = 'none';
    },
}