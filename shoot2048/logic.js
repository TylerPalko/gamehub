let launchX = -1;

function launch() {
	launchX = deployTile.xBox;
	for (let y = 0; y < 5; y++) {
		if (mainGrid[launchX][y].value == 0) {
			deployTile.move(0, y - 5);
			deployTile.joinable = true;
			joinTiles(deployTile);
			deployTile = makeDeployTile();
			checkFinal();
			break;
		}
	}
}

function joinTiles(tile) {
	tile.joinable = false;
	let tileX = tile.xBox;
	let tileY = tile.yBox;
	let valCheck = tile.value;
	if (valCheck == 0) {
		return;
	}
	let count = 0;
	if (tileX != 0) {
		if (mainGrid[tileX - 1][tileY].value == valCheck) {
			count++;
			mainGrid[tileX - 1][tileY].setValue(0);
		}
	}
	if (tileX != 4) {
		if (mainGrid[tileX + 1][tileY].value == valCheck) {
			count++;
			mainGrid[tileX + 1][tileY].setValue(0);
		}
	}
	if (tileY != 0) {
		if (mainGrid[tileX][tileY - 1].value == valCheck) {
			count++;
			mainGrid[tileX][tileY - 1].setValue(0);
		}
	}
	if (count >= 1) {
		tile.setValue(tile.value * pow(2, count));
		tile.joinable = true;
		score += tile.value;
	}
	for (let x = constrain(tileX - 1, 0, 4); x <= constrain(tileX + 1, 0, 4); x++) {
		for (let y = 1; y < 5; y++) {
			if (mainGrid[x][y - 1].value == 0 && mainGrid[x][y].value != 0) {
				mainGrid[x][y - 1].swap(mainGrid[x][y]);
				mainGrid[x][y - 1].joinable = true;
				break;
			}
		}
	}

	for (let i = 0; i < mainGrid.length; i++) {
		for (let j = 0; j < mainGrid[i].length; j++) {
			if (mainGrid[i][j].joinable) {
				joinTiles(mainGrid[i][j]);
			}
		}
	}
}

function checkFinal() {
	let gameOver = true;
	
	for (let i = 0; i < mainGrid.length; i++) {
		for (let j = 0; j < mainGrid[i].length - 1; j++) {
			if(mainGrid[i][j].value == 0){
				gameOver = false;
			}else if(mainGrid[i][j].value == 2048 && !gameWon){
				gameWon = true;
				alert("You Won, Continue if You Wish :)");
			}
		}
	}
	
	if(gameOver){
		alert("You lost :(");
		if(score > highscore){
			highscore = score;
			reset();
		}
	}
}

function reset(){
	score = 0;
	stroke(0);
	strokeWeight(2);
	fill(255);
	rect(0, 0, x - 1, y - 1);
	mainGrid = makeGrid(5, 6);
	for (let i = 0; i < mainGrid.length; i++) {
		for (let j = 0; j < mainGrid[i].length; j++) {
			stroke(modeColour[0], modeColour[1], modeColour[2]);
			fill(0);
			new Tile(0, i, j);
			rect(100 * i + 50, j == 5 ? 100 * j + 150 : 100 * j + 100, 100, 100);
		}
	}

	deployTile = makeDeployTile();
	drawTile(deployTile);

	stroke(0);
	strokeWeight(3);
	fill(0);
	textSize(50);
	textAlign(LEFT);
	text(score.toString().padStart(5, "0"), 50, 50);

	strokeWeight(1);
	textSize(11);
	text(version, 50, height - 20);

	stroke(255, 215, 0);
	strokeWeight(3);
	fill(255, 215, 0);
	textSize(50);
	textAlign(RIGHT);
	text(highscore.toString().padStart(5, "0"), 550, 50);

	stroke(0);
	strokeWeight(4);
	fill(132,112,255);
	rect(550, 800, 25, 25);
}