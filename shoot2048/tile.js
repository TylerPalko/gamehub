class Tile{
	constructor(v, x, y){
		this.value = v;
		this.xBox = x;
		this.yBox = y;
		mainGrid[this.xBox][this.yBox] = this;
		this.joinable = false;
		this.colour = [ 0, 0, 0 ];
		colourPicker(this);
	}
	move(xMove, yMove) {
		if (!(xMove == 0 && yMove == 0)) {
			this.swap(mainGrid[constrain(this.xBox + xMove, 0, 4)][constrain(this.yBox + yMove, 0, 5)]);
		}
	}
	swap(tileS) {
		let tmp = mainGrid[this.xBox][this.yBox];
		mainGrid[this.xBox][this.yBox] = mainGrid[tileS.xBox][tileS.yBox];
		mainGrid[tileS.xBox][tileS.yBox] = tmp;
		let ox = this.xBox;
		let oy = this.yBox;
		this.xBox = tileS.xBox;
		this.yBox = tileS.yBox;
		tileS.xBox = ox;
		tileS.yBox = oy;
	}
	setValue(newValue) {
		this.value = newValue;
		colourPicker(this);
	}
}

function colourPicker(tile) {
	switch (tile.value) {
	case 2:
		tile.colour = [ 0, 255, 0 ];
		break;
	case 4:
		tile.colour = [ 0, 77, 0 ];
		break;
	case 8:
		tile.colour = [ 100, 180, 255 ];
		break;
	case 16:
		tile.colour = [ 0, 0, 255 ];
		break;
	case 32:
		tile.colour = [ 0, 128, 100 ];
		break;
	case 64:
		tile.colour = [ 64, 0, 128 ];
		break;
	case 128:
		tile.colour = [ 218, 112, 214 ];
		break;
	case 256:
		tile.colour = [ 250, 128, 114 ];
		break;
	case 512:
		tile.colour = [ 255, 165, 0 ];
		break;
	case 1024:
		tile.colour = [ 255, 207, 158 ];
		break;
	case 2048:
		tile.colour = [ 255, 255, 0 ];
		break;
	default:
		tile.colour = [ tile.value % 229, tile.value % 241, tile.value % 251 ]
		break;
	}
}