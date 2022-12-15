# html5-space-invaders
A HTML5 implementation of the classic Space Invaders game.

This implementation supports one and two players.

The game is playable in the URL: https://toivjon.github.io/html5-space-invaders/

Development blog entry: https://toivjon.wordpress.com/2017/09/17/html5-space-invaders/

## Scenes
Game is split into following scenes:
1. A welcome scene, which contains the main menu and score descriptions.
2. A "play player" scene, which tells which player should prepare to play.
3. An in-game scene, which contains the actual gameplay.

The list of scene transitions:
* 1 to 2, when the number of players has been selected.
* 2 to 3, after 150 ticks.
* 3 to 2, after a level has been cleared i.e. all aliens has been destroyed.
* 3 to 2, after player has been killed and other player has still lives left (multiplayer only).
* 3 to 1, after pressing the enter key when game over text is being shown.

## Features
This Space Invaders implementation contains the following features:
* A support for one or two player (turn-based) games.
* Each player has three lives.
* Each level lasts until avatar or all aliens are destroyed or if any of the aliens invades.
* Game ends after each player has lost their lives.
* Player game state is stored when toggling between players in the two player mode.
* Aliens may shoot three different kind of missiles (rolling, plunger and squiggly).
* Plunger and squiggly alien shots follow predefined shoot patterns.
* Rolling shot is always launched from the players nearest alien.
* Game field contains four pixelwise destructable shields.
* Players earn points based on the destructed alien type.
* Alien movement speed is increased after the number of shown aliens decreases.
* Alien missile fire rate depends on the player score.
* Alien starting y-position depends on the level number.
* Flying saucer will be shown about periodically after each ~1200 ticks.
* Points received from the flying saucer is based on a lookup-table and player shot count.

## Screenshots
![alt text](https://github.com/toivjon/html5-space-invaders/blob/master/Screenshots/welcome-scene.png "WelcomeScene")
![alt text](https://github.com/toivjon/html5-space-invaders/blob/master/Screenshots/playplayer-scene.png "PlayerPlayerScene")
![alt text](https://github.com/toivjon/html5-space-invaders/blob/master/Screenshots/ingame-scene.png "IngameScene")
