let x = 600;
let y = 850;
let deployTile;
let mainGrid;
let score = 0;
let highscore = 0;
let gameWon = false;
let modeColour = [ 122, 122, 122 ];

const version = "v 1.0"

function makeGrid(columns, rows) {
	let grid = new Array(columns);
	for (let i = 0; i < grid.length; i++) {
		grid[i] = new Array(rows);
	}
	return grid;
}

function makeDeployTile() {
	let v = Math.pow(2, floor(random(1, 7)));
	return new Tile(v, 2, 5);
}

function setup() {
	createCanvas(x, y);
	reset();
}

function draw() {
	for (let i = 0; i < mainGrid.length; i++) {
		for (let j = 0; j < mainGrid[i].length; j++) {
			strokeWeight(5);
			stroke(modeColour[0], modeColour[1], modeColour[2]);
			fill(0);
			rect(100 * i + 50, j == 5 ? 100 * j + 150 : 100 * j + 100, 100, 100);
			if (mainGrid[i][j].value != 0) {
				drawTile(mainGrid[i][j]);
			}

		}
	}

	stroke(255);
	fill(255);
	rect(30, 10, 550, 80);
	stroke(0);
	strokeWeight(3);
	fill(0);
	textSize(50);
	textAlign(LEFT);
	text(score.toString().padStart(5, "0"), 50, 50);

	stroke(0);
	strokeWeight(3);
	fill(255, 215, 0);
	textSize(50);
	textAlign(RIGHT);
	text(highscore.toString().padStart(5, "0"), 550, 50);

	if (mouseX >= 550 && mouseX <= 575 && mouseY >= 800 && mouseY <= 825) {
		stroke(0, 128, 0);
	} else {
		stroke(0);
	}
	strokeWeight(4);
	fill(255, 0, 0);
	rect(550, 800, 25, 25);
}

function keyPressed() {
	switch (keyCode) {
	case LEFT_ARROW:
		deployTile.move(-1, 0);
		break;
	case RIGHT_ARROW:
		deployTile.move(1, 0);
		break;
	case 49: // '1'
	case 50: // '2'
	case 51: // '3'
	case 52: // '4'
	case 53: // '5'
		deployTile.move((keyCode - 49) - deployTile.xBox, 0);
		launch();
		break;
	case 32: // ' '
		launch();
	}
	// console.log(keyCode);
}

function drawTile(tile) {
	let x = tile.xBox;
	let y = tile.yBox;
	fill(tile.colour[0], tile.colour[1], tile.colour[2]);
	rect(100 * (x + 1) - 40, y < 5 ? (100 * (y + 1) + 10)
			: (100 * (y + 1) + 60), 80, 80);
	fill(255);
	stroke(0);
	strokeWeight(5);
	textAlign(CENTER, CENTER);
	let val = tile.value.toString();
	switch (val.length) {
	case 1:
	case 2:
		textSize(64);
		break;
	case 3:
		textSize(42);
		break;
	case 4:
		textSize(32);
		break;
	case 5:
		textSize(27);
		break;
	case 6:
		textSize(22);
		break;
	case 7:
		textSize(18);
		break;
	case 8:
		textSize(16);
		break;
	case 9:
		textSize(14);
		break;
	case 10:
		textSize(12);
		break;
	}
	text(tile.value, 100 * (x + 1), y < 5 ? (100 * (y + 1) + 50)
			: (100 * (y + 1) + 100));
}

function mouseClicked() {
	if (mouseX >= 550 && mouseX <= 575 && mouseY >= 800 && mouseY <= 825) {
		if (score > highscore) {
			highscore = score;
		}
		reset();
	}
}
