function Item( what, x, y, action ){
	this.init( what, action ).place( x, y );
	window.Items.push( this );
}
Item.prototype = {

	posX: 0,
	posY: 0,
	size: 20,
	contact: false,

	init: function( what, action ){

		this.img = new Image();
	    this.img.src = window.Files.items[what];

	    // window.Files.plum();

	    this.action = (action ? action : function(){});

		return this;
	},

	place: function( x, y ){

		this.posX = x;
		this.posY = y;
	},

	draw: function(){

		Sys.ctx.drawImage(this.img, this.posX, this.posY, this.size, this.size);
		
	},

	touched: function( flag ){

		if( flag && !this.contact )
		{
			this.contact = true;
			this.action();
			this.kill();
		}
	},

	kill: function(){
		window.Items.splice(window.Items.indexOf(this),1);
		delete this;
	},

};

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------

Heart = function( x, y, ile ){ new Item('heart',x,y,function(){ window.Files.plum(); Me.changeHP(ile); }.bind(this)); };
Exp = function( x, y, ile ){ new Item('exp',x,y,function(){ window.Files.sparkle(); Me.addExp(ile); }.bind(this)); };