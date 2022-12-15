/** A namespace for the Space Invaders game. */
var SpaceInvaders = SpaceInvaders || {};

/** *************************************************************************
 * A helper utility to create a four digit string from the given score.
 *
 * Four digit string is ensured by prepending additional zeroes to the given
 * value when necessary. For example value 12 is transformed to "0012" string.
 *
 * @param {number} score The score to be converted into a string.
 */
SpaceInvaders.toScoreString = function (score) {
  var result = "NaN";
  if (typeof score == 'number') {
    result = score.toString();
    var difference = (4 - result.length);
    if (difference >= 0) {
      result = "0000" + result;
    }
    result = result.substring(result.length - 4);
  }
  return result;
}

/** ***************************************************************************
 * The container that holds player specific data and state.
 *
 * Space invaders contains a support for single- and multiplayer game modes. It
 * is a good idea to store player specific data in a special container called a
 * context. It contains all player specific data, which helps us to keep player
 * data in a centralized place and also helps us to reconstruct the game state
 * when the player switch is requested after a player destruction in the game.
 *
 * @param {SpaceInvaders.Game} game A reference to parent game instance.
 */
SpaceInvaders.PlayerContext = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  /** A constant count definition of initial lives. */
  this.INITIAL_LIVE_COUNT = 3;

  /** The current level of the player. */
  var level = 1;
  /** The current score of the player. */
  var score = 0;
  /** The current amount of player lives. */
  var lives = this.INITIAL_LIVE_COUNT;
  /** The previous state of the aliens within the game. */
  var alienStates = undefined;
  /** The previous state of the shields within the game. */
  var shieldStates = undefined;

  /** *************************************************************************
   * Reset the context back to the original state.
   *
   * This function is used to reset the context to contain the initial values
   * for each of the contained value. Useful for example, when the game is over
   * and a new game should be started.
   */
  this.reset = function () {
    level = 1;
    score = 0;
    lives = this.INITIAL_LIVE_COUNT;
    shieldStates = undefined;
    alienStates = undefined;
  }

  this.getLevel = function () { return level; }
  this.getScore = function () { return score; }
  this.getLives = function () { return lives; }
  this.getAlienStates = function () { return alienStates; }
  this.getShieldStates = function () { return shieldStates; }

  this.setLevel = function (newLevel) { level = newLevel; }
  this.setScore = function (newScore) { score = newScore; }
  this.setLives = function (newLives) { lives = newLives; }
  this.setAlienStates = function (newStates) { alienStates = newStates; }
  this.setShieldStates = function (newStates) { shieldStates = newStates; }

  this.addScore = function (additionalScore) { score += additionalScore; }
}

/** ***************************************************************************
 * The root game structure for the Space Invaders game.
 *
 * This object module contains the necessary structure to glue the game objects
 * as a working game. It acts as the main entry point for the application which
 * is used to start the game and to provide a support for the scene system.
 *
 * The application can be created and started with the following way:
 *
 * var game = new SpaceInvaders();
 * game.start();
 *
 * After being constructed and called with the previously mentioned way, the
 * application starts running and will run until the browser window is being
 * closed or whether an application execption is raised.
 */
SpaceInvaders.Game = function () {
  /** A constant id of the canvas to be used as the rendering target. */
  var CANVAS_ID = "game-canvas";
  /** A constant definition for the game framerate. */
  var FPS = (1000.0 / 60.0);

  /** A constant for the number one keycode. */
  this.KEY_1 = 49;
  /** A constant for the number two keycode. */
  this.KEY_2 = 50;
  /** A constant for the right-arrow keycode. */
  this.KEY_RIGHT = 39;
  /** A constant for the left-arrow keycode. */
  this.KEY_LEFT = 37;
  /** A constant for the spacebar keycode. */
  this.KEY_SPACEBAR = 32;
  /** A constant for the enter keycode. */
  this.KEY_ENTER = 13;

  /** A definition whether the game is initialized or not. */
  var initialized = false;
  /** A reference to the HTML5 canvas used as the rendering target. */
  var canvas = undefined;
  /** A reference to the 2D drawing context from the HTML5 canvas. */
  var ctx = undefined;
  /** A reference to the currently active scene. */
  var scene = undefined;
  /** A definition of the time when the game was previously updated. */
  var previousTickTime = 0;
  /** A delta accumulator that collects the exceeding update time delta. */
  var deltaAccumulator = 0;

  /** A container for the state and data of the 1st player. */
  var player1Context = new SpaceInvaders.PlayerContext(this);
  /** A container for the state and data of the 2nd player. */
  var player2Context = new SpaceInvaders.PlayerContext(this);

  /** The hi-score of the current game instace. */
  var hiScore = 0;

  /** The amount of players. */
  var playerCount = 2;
  /** The currently active player. */
  var activePlayer = 1;

  /** The sprite sheet containing all image assets for the game. */
  var spriteSheet = undefined;

  /** *************************************************************************
   * Set the active player for the game.
   *
   * When this function is called, the active player will be changed. This
   * makes the game to show the "PLAY PLAYER<?>" state to notify the next
   * player to prepare to play the game. This function is typically only used
   * when playing the game in a multiplayer mode.
   *
   * @param {integer} newActivePlayer A number {1|2} based on the target player.
   */
  this.setActivePlayer = function (newActivePlayer) {
    activePlayer = newActivePlayer;
    if (scene) {
      if (activePlayer == 1) {
        // blink and show only score for the 1st player.
        scene.getScore1Text().setVisible(true);
        scene.getScore1Text().blink();
        scene.getScore2Text().setVisible(false);
      } else if (activePlayer == 2) {
        // blink and show only score for the 2nd player.
        scene.getScore2Text().setVisible(true);
        scene.getScore2Text().blink();
        scene.getScore1Text().setVisible(false);
      }
      scene.setState(new SpaceInvaders.PlayPlayerState(this));
    }
  }

  /** ***********************************************************************
    * Get the definition whether the game is initialized.
    *
    * This function provides a simple way to externally check whether the game
    * has been inited successfully and is ready to run (or already running).
    *
    * @return {[]} A definition whether the game is inited.
    */
  this.isInitialized = function () {
    return initialized;
  };

  /** ***********************************************************************
   * Get a reference to the currently active scene.
   *
   * This function returns a reference to currently active scene. If there is
   * currently no active scene, then this function returns the default value
   * (undefined) as a result.
   *
   * @return {SpaceInvaders.Scene} The currently active scene or undefined.
   */
  this.getScene = function () {
    return scene;
  }

  /** ***********************************************************************
   * Initialize the game.
   *
   * Initialization will ensure that the game will get a reference to the 2D
   * drawing context from the game canvas element. It also provides a way to
   * define a game wide initializations for game scenes etc.
   *
   * @return {boolean} A definition whether the initialization succeeded.
   */
  this.init = function () {
    // a sanity check to prevent re-initialization.
    if (initialized == true) {
      console.error("Unable to re-initialize the game.")
      return false;
    }

    // get a reference to the target <canvas> element.
    if (!(canvas = document.getElementById(CANVAS_ID))) {
      console.error("Unable to find the required canvas element.");
      return false;
    }

    // get a reference to the 2D drawing context.
    if (!(ctx = canvas.getContext("2d"))) {
      console.error("Unable to get a reference to 2D draw context.");
      return false;
    }

    // TODO make this a synchronous load to avoid invalid references?
    // load the source sprite sheet as an image.
    spriteSheet = new Image();
    spriteSheet.src = "space_invaders_spritesheet.png";

    // initialize the only scene used within the application.
    scene = new SpaceInvaders.Scene(this);

    // construct and assign the initial welcoming state.
    scene.setState(new SpaceInvaders.WelcomeState(this));

    // when the code reaches this point, the initialization succeeded.
    initialized = true;
    return true;
  };

  /** ***********************************************************************
   * Run the game.
   *
   * Running the game means that the game will execute an infinite loop that
   * runs the game logic updates and draw operations until the user closes
   * the browser tab or the JavaScript catches and exception from the code.
   *
   * It's quite important to note that the requestAnimationFrame provides the
   * tickTime automatically when it uses the function as a callback.
   *
   * @param {double} tickTime A timestamp when the function is called.
   */
  this.run = function (tickTime) {
    // calculate a delta time and store the current tick time.
    var dt = (tickTime - previousTickTime);
    previousTickTime = tickTime;

    // update and draw the scene only when we have reasonable delta.
    if (dt < 100) {
      deltaAccumulator += dt;
      while (deltaAccumulator >= FPS) {
        scene.update(FPS);
        deltaAccumulator -= FPS;
      }

      // swipe old contents from the draw buffer and draw the scene.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      scene.render(ctx);
    }

    // perform a main loop iteration.
    requestAnimationFrame(this.run.bind(this));
  };

  /** ***********************************************************************
   * Start the game.
   *
   * Game will be first initialized and the started. Game will be using an
   * infinite loop (via requestAnimationFrame) as the main loop, so the game
   * will not stop running until the user closes the browser tab or if an
   * error is detected by the browser JavaScript engine.
   */
  this.start = function () {
    if (this.init()) {
      this.run(0);
    }
  };

  /** ***********************************************************************
   * Get the context container of the currently active player.
   *
   * Game will always contain a context container for each player. The active
   * context instance will be changed whenever the active player is changed.
   *
   * @returns {SpaceInvaders.PlayerContext} Context of the active player.
   */
  this.getActiveContext = function () {
    return (activePlayer == 1 ? player1Context : player2Context);
  }

  this.getPlayer1Context = function () { return player1Context; }
  this.getPlayer2Context = function () { return player2Context; }

  this.getHiScore = function () { return hiScore; }
  this.getSpriteSheet = function () { return spriteSheet; }
  this.getPlayerCount = function () { return playerCount; }
  this.getActivePlayer = function () { return activePlayer; }
  this.getCanvasCtx = function () { return ctx; }

  this.setHiScore = function (newScore) { hiScore = newScore; }
  this.setPlayerCount = function (newCount) { playerCount = newCount; }
};

/** ***************************************************************************
 * An entity abstraction for all game objects within the Space Invaders game.
 *
 * This class acts as the root of all entities within the game scene. It does
 * contain all the shared definitions that must be present within all entities
 * that are created into the game scene. This also includes the root game and
 * scene instances as well as the 2d-coordinates of the entity.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.Entity = function (game) {
  /** A reference to the root game instance. */
  this.game = game;
  /** A reference to the used scene instance. */
  this.scene = game.getScene();

  /** A constant default value for the y-position. */
  this.DEFAULT_X = 0;
  /** A constant default value for the x-position. */
  this.DEFAULT_Y = 0;

  /** The x-coordinate position of the entity. */
  var x = this.DEFAULT_X;
  /** The y-coordinate position of the entity. */
  var y = this.DEFAULT_Y;

  this.getX = function () { return x; }
  this.getY = function () { return y; }

  this.setX = function (newX) { x = newX; }
  this.setY = function (newY) { y = newY; }
}

/** ***************************************************************************
 * An entity abstraction for all entities that are collideable.
 *
 * This class encapsulates the required definitions for an entity to perform a
 * collision check with an another entity. The abstraction uses an axis-aligned
 * bounding box to encapsulate and check whether a collision is executed.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.CollideableEntity = function (game) {
  SpaceInvaders.Entity.call(this, game);

  /** A constant default value for the AABB extent in the x-axis. */
  this.DEFAULT_EXTENT_X = 0;
  /** A constant default value for the AABB extent in the y-axis. */
  this.DEFAULT_EXTENT_Y = 0;
  /** A constant default value for the enabled state. */
  this.DEFAULT_ENABLED = true;

  /** The AABB x-axis extent (i.e. half-width). */
  var extentX = this.DEFAULT_EXTENT_X;
  /** The AABB y-axis extent (i.e. half-height). */
  var extentY = this.DEFAULT_EXTENT_Y;
  /** The x-axis center of the AABB. */
  var centerX = this.getX() + extentX;
  /** The y-axis center of the AABB. */
  var centerY = this.getY() + extentY;
  /** The definition whether the entity can be collided. */
  var enabled = this.DEFAULT_ENABLED;

  /** A stored reference to the original parent x-axis setter. */
  var parentSetX = this.setX;
  /** A stored reference to the original parent y-axis setter. */
  var parentSetY = this.setY;

  /****************************************************************************
   * Check whether this entity collides with an another entity.
   * @param {SpaceInvades.CollideableEntity} o Another entity to check against.
   */
  this.collides = function (o) {
    // no collision if either entity is currently not collideable.
    if (!this.isEnabled() || !o.isEnabled()) return false;

    // check whether we have a collisions between the two AABBs.
    var x = Math.abs(centerX - o.getCenterX()) < (extentX + o.getExtentX());
    var y = Math.abs(centerY - o.getCenterY()) < (extentY + o.getExtentY());
    return x && y;
  }

  /****************************************************************************
   * Check whether this entity contains the specified pixel.
   * @param {number} x The x-coordinate of the pixel.
   * @param {number} y The y-coordinate of the pixel.
   * @returns {boolean} Boolean indivating whether pixel is included.
   */
  this.containsPixel = function (x, y) {
    return !(x < (centerX - extentX)
      || x > (centerX + extentX)
      || y < (centerY - extentY)
      || y > (centerY + extentY));
  }

  this.setX = function (newX) {
    parentSetX(newX);
    centerX = this.getX() + extentX;
  }

  this.setY = function (newY) {
    parentSetY(newY);
    centerY = this.getY() + extentY;
  }

  this.setExtentX = function (newExtent) {
    extentX = newExtent;
    centerX = this.getX() + extentX;
  }

  this.setExtentY = function (newExtent) {
    extentY = newExtent;
    centerY = this.getY() + extentY;
  }

  this.getExtentX = function () { return extentX; }
  this.getExtentY = function () { return extentY; }
  this.getCenterX = function () { return centerX; }
  this.getCenterY = function () { return centerY; }
  this.isEnabled = function () { return enabled; }

  this.setEnabled = function (newEnabled) { enabled = newEnabled; }
}

/** ***************************************************************************
 * A sprite entity for image sprites for the Space Invaders game.
 *
 * This entity presents a drawable sprite entity that is drawn from an external
 * image file provided with the #setImage function. Note that it is typically
 * a good idea to put all sprites in a single sprite sheet so the same image is
 * being loaded only once and can be therefore used with all sprites.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.SpriteEntity = function (game) {
  SpaceInvaders.CollideableEntity.call(this, game);

  /** A constant default for the sprite width. */
  this.DEFAULT_WIDTH = 0;
  /** A constant default for the sprite height. */
  this.DEFAULT_HEIGHT = 0;
  /** A constant default for the sprite clipping x-coordinate. */
  this.DEFAULT_CLIP_X = 0;
  /** A constant default for the sprite clipping y-coordinate. */
  this.DEFAULT_CLIP_Y = 0;
  /** A constant default for the sprite image. */
  this.DEFAULT_IMAGE = undefined;
  /** A constant default for the sprite visibility. */
  this.DEFAULT_VISIBLE = true;

  /** The width of the sprite. */
  var width = this.DEFAULT_WIDTH;
  /** The height of the sprite. */
  var height = this.DEFAULT_HEIGHT;
  /** The clipping x-coordinate of the image. */
  var clipX = this.DEFAULT_CLIP_X;
  /** The clipping y-coordinate of the image. */
  var clipY = this.DEFAULT_CLIP_Y;
  /** The source image to render sprite from. */
  var image = this.DEFAULT_IMAGE;
  /** The definition whether the sprite is visible. */
  var visible = this.DEFAULT_VISIBLE;

  /** Ensure initial parent collideable boundary x-axis. */
  this.setExtentX(width / 2);
  /** Ensure initial parent collideable boundary y-axis. */
  this.setExtentY(height / 2);

  this.render = function (ctx) {
    if (image && this.isVisible()) {
      ctx.drawImage(image,
        this.getClipX(),
        this.getClipY(),
        this.getWidth(),
        this.getHeight(),
        this.getX(),
        this.getY(),
        this.getWidth(),
        this.getHeight());
    }
  }

  this.setWidth = function (newWidth) {
    width = newWidth;
    this.setExtentX(width / 2);
  }

  this.setHeight = function (newHeight) {
    height = newHeight;
    this.setExtentY(height / 2)
  }

  this.getWidth = function () { return width; }
  this.getHeight = function () { return height; }
  this.getClipX = function () { return clipX; }
  this.getClipY = function () { return clipY; }
  this.getImage = function () { return image; }
  this.isVisible = function () { return visible; }

  this.setClipX = function (newClip) { clipX = newClip; }
  this.setClipY = function (newClip) { clipY = newClip; }
  this.setImage = function (newImage) { image = newImage; }
  this.setVisible = function (newVisible) { visible = newVisible; }
}

/** ***************************************************************************
 * An abstraction of all entities that are movable and have a sprite image.
 *
 * This class encapsulates the all necessary functionality for all entities for
 * collideable, movable and drawable sprite entities. For example the player
 * avatar and all enemies should be constructed from this structure.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.MovableSpriteEntity = function (game) {
  SpaceInvaders.SpriteEntity.call(this, game);

  /** A constant default for the velocity of the movement. */
  this.DEFAULT_VELOCITY = 0.0;
  /** A constant default x-axis direction of the movement. */
  this.DEFAULT_DIRECTION_X = 0.0;
  /** A constant default y-axis direction of the movement. */
  this.DEFAULT_DIRECTION_Y = 0.0;
  /** A constant default step size for the movement. */
  this.DEFAULT_STEP_SIZE = 0;

  /** The velocity of the entity. */
  var velocity = this.DEFAULT_VELOCITY;
  /** The x-axis direction. */
  var directionX = this.DEFAULT_DIRECTION_X;
  /** The y-axis direction. */
  var directionY = this.DEFAULT_DIRECTION_Y;

  /** The size of the movement step (i.e. updates before movement is applied). */
  var stepSize = 0;
  /** The step counter to track when to perform a movement step. */
  var stepCounter = 0;

  /** The step counter to track when to perform an automatic disappear. */
  var disappearCountdown = 0;

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the entity.
   * @param {number} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    if (disappearCountdown > 0) {
      disappearCountdown--;
      if (disappearCountdown <= 0) {
        this.setEnabled(false);
        this.setVisible(false);
      }
    }
    stepCounter = Math.max(0, stepCounter - 1);
    if (stepCounter <= 0) {
      this.setX(this.getX() + directionX * velocity * dt);
      this.setY(this.getY() + directionY * velocity * dt);
      stepCounter = stepSize;
    }
  }

  /** *************************************************************************
   * Apply the given step size and clear the current step counter of the entity.
   * @param {number} newStepSize A new step size for the movable entity.
   */
  this.setStepSize = function (newStepSize) {
    stepSize = newStepSize;
    stepCounter = stepSize;
  }

  /** *************************************************************************
   * Apply the given amount of ticks to perform before automatically disappear.
   * @param {number} countdown The amount of ticks before disappearing.
   */
  this.setDisappearCountdown = function (countdown) {
    disappearCountdown = Math.max(0, countdown);
  }

  this.getVelocity = function () { return velocity; }
  this.getDirectionX = function () { return directionX; }
  this.getDirectionY = function () { return directionY; }
  this.getStepSize = function () { return stepSize; }
  this.getStepCounter = function () { return stepCounter; }

  this.setVelocity = function (newVelocity) { velocity = newVelocity; }
  this.setDirectionX = function (newDirection) { directionX = newDirection; }
  this.setDirectionY = function (newDirection) { directionY = newDirection; }
}

/** ***************************************************************************
 * An abstraction for the player avatar entity.
 *
 * This structure contains the additional definitions required for the player
 * avatar object, which is the cannon tower that can be moved by the player.
 */
SpaceInvaders.AvatarEntity = function (game, scene) {
  SpaceInvaders.AnimatedMovableSpriteEntity.call(this, game);

  this.explode = function () {
    // stop and disable the movement of the avatar.
    this.setDirectionX(0);
    this.setEnabled(false);

    // assign the explosion animation for the avatar.
    this.clearAnimationFrames();
    this.addAnimationFrame(128, 91, 45, 24);
    this.addAnimationFrame(178, 91, 45, 24);
    this.setAnimationFrameIndex(0);
    this.setAnimationStepSize(6);
    this.setDisappearCountdown(6 * 8);

    // decrement lives and start the scene relaunch counter.
    scene.decrementPlayerLives(game.getActivePlayer());
    scene.startRelaunchCounter();
  }

  this.reset = function () {
    // reset the starting position of the avatar.
    this.setX(45);

    // set avatar back to collideable and visible.
    this.setEnabled(true);
    this.setVisible(true);

    // reset the visual presentation of the avatar.
    this.clearAnimationFrames();
    this.addAnimationFrame(86, 5, 40, 24);
    this.setAnimationFrameIndex(0);
  }

}

/** ***************************************************************************
 * An abstraction for all alien shots.
 *
 * This structure contains the additional definitions and methods for the alien
 * shots. There are three different alien shots available; rolling, plumbing
 * and the squiggly shot. Each shot has a bit different behavior, which are
 * described in the following table.
 *
 * Rolling shot
 * A "homing" shot that is always launched from the players nearest alien.
 *
 * Plunger shot
 * A shot that follows a predefined alien columns list and is not used when there
 * is only one alien left.
 *
 * Squiggly shot
 * A shot that follows a predefined alien columns list and is not used when the
 * flying saucer is being shown.
 *
 * Table is based on foundings from the following URL:
 * http://www.computerarcheology.com/Arcade/SpaceInvaders/Code.html
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.AlienShotEntity = function (game, scene) {
  SpaceInvaders.AnimatedMovableSpriteEntity.call(this, game);

  /** A counter to keep track of the amount of update calls. */
  var progressTicks = 0;

  this.animateAndUpdate = function (dt) {
    if (this.isVisible()) {
      this.animate();
      this.update(dt);
      progressTicks++;
    }
  }

  this.fire = function () {
    var animationFrames = this.getAnimationFrames();
    if (animationFrames.length > 3) {
      animationFrames.pop();
    }
    this.setAnimationFrameIndex(0);
    this.setAnimationStepSize(4);
    this.setVisible(true);
    this.setEnabled(true);
    this.setDirectionY(1);
    progressTicks = 1;
  }

  this.explode = function () {
    this.addAnimationFrame(218, 5, 18, 24);
    this.setAnimationStepSize(0);
    this.setAnimationFrameIndex(3);
    this.setEnabled(false);
    this.setDisappearCountdown(10);
    this.setDirectionY(0);
  }

  this.isReadyToBeFired = function () {
    // do not allow shot to be re-fired when still in progress.
    if (this.isVisible()) {
      return false;
    }

    // get a reference to the array of alien shots and the reload rate.
    var shots = scene.getAlienShots();
    var reloadRate = scene.getAlienReloadRate();

    // iterate over shots to check whether aliens have reloaded their weapons.
    for (i = 0; i < shots.length; i++) {
      var shotTicks = shots[i].getProgressTicks();
      if (shots[i] != this) {
        if (shotTicks > 0) {
          if (reloadRate >= shotTicks) {
            return false;
          }
        }
      }
    }

    // aliens have been reloaded and it's ok to fire now.
    return true;
  }

  this.getProgressTicks = function () { return progressTicks; }

}

/** ***************************************************************************
 * An abstraction for all player shields.
 *
 * This structure contains the logics required for the player avatar shields.
 * In the original Space Invaders, there are four shields that player mayer use
 * to protect the avatar against the alien laser shots.
 *
 * Shields are destructable, where destructions consume a part of the shield. In
 * fact, there are three different things that must consume shields.
 *
 * 1. Alien shots
 * 2. Player shots
 * 3. Alien contact
 *
 * Each collision with the previously mentioned entity must consume a part of
 * the shield where the collision occurs. Collided shots must be first exploded
 * and then use the explosion sprite to consume part of the shield pixels away.
 * Note that avatar and alien lasers collides with a different explosion sprite.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.Shield = function (game) {
  SpaceInvaders.SpriteEntity.call(this, game);

  /** Sprite pixels from left-to-right and top-to-bottom order. */
  var pixels = undefined;
  /** A definition whether the shields pixels have been modified. */
  var pixelsDirty = false;

  /** *************************************************************************
   * Check whether the shield precisely collides with the target object.
   *
   * This function is used to perform two-phase collision detection. Here we
   * use a broad (AABB-ABB) and narrow (pixel-pixel) phases to detect whether
   * the provided object hits the shield.
   *
   * @param {SpaceInvaders.CollideableEntity} other Entity to check against.
   */
  this.preciseCollides = function (other) {
    if (this.collides(other)) {
      // get a reference to current position and size.
      var x = this.getX();
      var y = this.getY();
      var width = this.getWidth();

      // iterate pixels based on the object movement direction.
      if (pixels == undefined) {
        this.refreshPixels();
      }
      var data = pixels.data;

      if (other instanceof SpaceInvaders.AvatarLaser) {
        for (var i = (data.length - 1); i >= 0; i -= 4) {
          if (data[i + 3] != 0 && this.preciseCollide(data, (i / 4), other)) {
            break;
          }
        }
      } else {
        for (var i = 0; i < data.length; i += 4) {
          if (data[i + 3] != 0 && this.preciseCollide(data, (i / 4), other)) {
            break;
          }
        }
      }
    }
  }

  /** *************************************************************************
   * Check whether the target pixel collides with the specified object.
   *
   * This function checks whether the provided pixel does a pixel-wide hit with
   * the provided object instance bounding box (AABB). If there is an collision
   * then the target object will be exploded and the explosion pixels will be
   * consumed i.e. removed from the shield sprite object to indicate destruct.
   *
   * @param pixels A map of pixels.
   * @param pixelIdx The index of the target index.
   * @param object Object to check collision against.
   */
  this.preciseCollide = function (pixels, pixelIdx, object) {
    var pixelX = (this.getX() + (pixelIdx % this.getWidth()));
    var pixelY = (this.getY() + Math.floor(pixelIdx / this.getWidth()));
    if (object.containsPixel(pixelX, pixelY)) {
      object.explode();
      object.setY(pixelY - object.getExtentY());
      object.render(game.getCanvasCtx());
      this.refreshPixels();
      this.eraseWhitePixels();
      pixelsDirty = true;
      return true;
    }
    return false;
  }

  /** *************************************************************************
   * Erase all white pixels from the wrapped sprite pixels.
   *
   * This function removes all white pixels from the currently wrapped sprite
   * image pixels. It is used to remove explosion specific pixels from the map
   * of pixels that function and indicate the condition of a player shield.
   */
  this.eraseWhitePixels = function () {
    var data = pixels.data;
    for (var j = 0; j < data.length; j++) {
      if (data[j] == 255 && data[j + 1] == 255 && data[j + 2] == 255) {
        data[j] = 0;
        data[j + 1] = 0;
        data[j + 2] = 0;
        data[j + 3] = 0;
      }
    }
  }

  /** *************************************************************************
   * Refresh the pixels belonging to the shield object.
   *
   * This function refreshes the wrapped sprite image pixel map that visually
   * indicate the condition as well as is being used in the collision detection.
   */
  this.refreshPixels = function () {
    pixels = game.getCanvasCtx().getImageData(
      this.getX(),
      this.getY(),
      this.getWidth(),
      this.getHeight());
  }

  this.render = function (ctx) {
    if (this.isVisible()) {
      if (pixelsDirty) {
        ctx.putImageData(pixels, this.getX(), this.getY());
      } else {
        if (this.getImage()) {
          ctx.drawImage(this.getImage(),
            this.getClipX(),
            this.getClipY(),
            this.getWidth(),
            this.getHeight(),
            this.getX(),
            this.getY(),
            this.getWidth(),
            this.getHeight());
        }
      }
    }
  }

}

/** ***************************************************************************
 * An abstraction for all movable sprite entities that can be animated.
 *
 * This structure contains the logics required to make an movable entity to be
 * animated. Animation can be used in two different modes:
 *
 * 1. Automatically animated mode.
 * 2. Manually animated mode.
 *
 * Automatically animated mode where the entity is automatically animated when
 * enough animation steps have been passed. Manually animated mode will only
 * act as a placeholder for multiple sprites that must be manually assigned to
 * make the sprite image to change.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.AnimatedMovableSpriteEntity = function (game) {
  SpaceInvaders.MovableSpriteEntity.call(this, game);

  /** A constant default for the animation step size (0 = disable animation). */
  this.DEFAULT_ANIMATION_STEP_SIZE = 0;

  /** A definition for animation step (i.e. number of ticks) count. */
  var animationStepSize = this.DEFAULT_ANIMATION_STEP_SIZE;
  /** A variable used to keep trakc of  the animation change rate. */
  var animationCounter = 0;

  /** The index of the current animation frame. */
  var animationFrameIndex = 0;
  /** The frames for the animation. */
  var animationFrames = [];

  /** *************************************************************************
   * Perform an animation step of the animated entity and change the frame when
   * and if necessary.This function must be called from the parent scene object.
   */
  this.animate = function () {
    if (animationStepSize > 0) {
      animationCounter = Math.max(0, animationCounter - 1);
      if (animationCounter <= 0) {
        var nextFrame = ((animationFrameIndex + 1) % animationFrames.length);
        this.setAnimationFrameIndex(nextFrame);
        animationCounter = animationStepSize;
      }
    }
  }

  /** *************************************************************************
   * Apply the given step size and clear the current step counter of the animation.
   * @param {number} newStepSize A new step size for the animated entity.
   */
  this.setAnimationStepSize = function (newStepSize) {
    animationStepSize = newStepSize;
    animationCounter = animationStepSize;
  }

  /** *************************************************************************
   * Specify the currently shown animation frame index.
   * @param {number} newIndex The index of the animation frame to be shown.
   */
  this.setAnimationFrameIndex = function (newIndex) {
    animationFrameIndex = Math.min(animationFrames.length, newIndex);

    // calculate the dimensions for the next animation frame.
    var newWidth = animationFrames[animationFrameIndex][2];
    var newHeight = animationFrames[animationFrameIndex][3];
    var newX = this.getCenterX() - (newWidth / 2);
    var newY = this.getCenterY() - (newHeight / 2);

    // assign the next animation frame as the current frame.
    this.setClipX(animationFrames[animationFrameIndex][0]);
    this.setClipY(animationFrames[animationFrameIndex][1]);
    this.setWidth(newWidth);
    this.setHeight(newHeight);
    this.setX(newX);
    this.setY(newY);
  }

  /** *************************************************************************
   * Add an new animation frame for the animated entity.
   * @param {number} clipX The sprite-to-image clip x-coordinate.
   * @param {number} clipY The sprite-to-image clip y-coordinate.
   * @param {number} width The width of the sprite.
   * @param {number} height The height of the sprite.
   */
  this.addAnimationFrame = function (clipX, clipY, width, height) {
    animationFrames.push([clipX, clipY, width, height]);
  }

  /** *************************************************************************
   * Clear all available animation frames from the entity.
   */
  this.clearAnimationFrames = function () {
    animationFrames = [];
  }

  this.getAnimationStepSize = function () { return animationStepSize; }
  this.getAnimationFrameIndex = function () { return animationFrameIndex; }
  this.getAnimationFrames = function () { return animationFrames; }
}

SpaceInvaders.AvatarLaser = function (game) {
  SpaceInvaders.AnimatedMovableSpriteEntity.call(this, game);

  /** *************************************************************************
   * Explode (i.e. destroy) the avatar laser shot explosion animation.
   *
   * This animation replaces the currently shown sprite or sprite animation
   * with an sprite that indicates that the player shot is exploding. It
   * will also trigger a timer after which the player shot will be disabled.
   */
  this.explode = function () {
    this.setAnimationStepSize(0);
    this.setAnimationFrameIndex(3);
    this.setEnabled(false);
    this.setDisappearCountdown(10);
    this.setDirectionY(0);
  }

}

/** ***************************************************************************
 * A textual entity for all texts used in the Space Invaders game.
 *
 * This class presents a textual entity within the game scene. It does really
 * an encapsulation of the 2d drawing context textual presentation functions.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.TextEntity = function (game) {
  SpaceInvaders.Entity.call(this, game);

  /** A constant default value for the text to be drawn. */
  this.DEFAULT_TEXT = "";
  /** A constant default fill style (i.e. color) for the text. */
  this.DEFAULT_FILL_STYLE = "white";
  /** A constant default font definition for the text. */
  this.DEFAULT_FONT = "24pt monospace";
  /** A constant default text alignment for the rendering. */
  this.DEFAULT_ALIGN = "start";
  /** A constant default visibility state for the text. */
  this.DEFAULT_VISIBLE = true;
  /** A constant amount of toggles to perform after #blink is called. */
  this.DEFAULT_BLINK_COUNT = 30;
  /** A constant amount of updates (i.e. interval) between the blinking. */
  this.DEFAULT_BLINK_FREQUENCY = 5;

  /** The text to be rendered. */
  var text = this.DEFAULT_TEXT;
  /** The fill style (i.e. color) used to draw the text. */
  var fillStyle = this.DEFAULT_FILL_STYLE;
  /** The target font description i.e. size, font family, etc. */
  var font = this.DEFAULT_FONT;
  /** The text align definition (start|end|center|left|right). */
  var align = this.DEFAULT_ALIGN;
  /** The definition whether the entity should be rendered. */
  var visible = this.DEFAULT_VISIBLE;
  /** The amount of remaining blinks (visible/invisible toggles). */
  var blinks = 0;
  /** The blink timer that will perform the blink frequency calculation. */
  var blinkTimer = 0;
  /** Amount of blinks to be perfomed after #blink is called (-1: infinite).*/
  var blinkCount = this.DEFAULT_BLINK_COUNT;
  /** The amount of updates (i.e. interval) between the blinks. */
  var blinkFrequency = this.DEFAULT_BLINK_FREQUENCY;

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the entity.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    if (blinks > 0 || blinks == -1) {
      blinkTimer--;
      if (blinkTimer == 0) {
        this.setVisible(!this.isVisible());
        blinks--;
        blinks = Math.max(blinks, -1);
        if (blinks > 0 || blinks == -1) {
          blinkTimer = blinkFrequency;
        }
      }
    }
  }

  /** *************************************************************************
   * Render (i.e. draw) the text on the screen.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    if (this.isVisible()) {
      ctx.fillStyle = this.getFillStyle();
      ctx.textAlign = this.getAlign();
      ctx.font = this.getFont();
      ctx.fillText(this.getText(), this.getX(), this.getY());
    }
  }

  /** *************************************************************************
   * Start blinking (i.e. toggling visible/invisible).
   *
   * After this function is called, the target entity will start to blink if it
   * is currently visible. If the entity is already blinking then the amount of
   * remaining blinks will be reset back to the amount of the this.BLINK_COUNT.
   */
  this.blink = function () {
    if (this.isVisible() || blinks > 0) {
      this.setVisible(true);
      blinks = blinkCount;
      blinkTimer = blinkFrequency;
    }
  }

  this.getText = function () { return text; }
  this.getFillStyle = function () { return fillStyle; }
  this.getFont = function () { return font; }
  this.getAlign = function () { return align; }
  this.isVisible = function () { return visible; }
  this.getBlinkCount = function () { return blinkCount; }
  this.getBlinkFrequency = function () { return blinkFrequency; }

  this.setText = function (newText) { text = newText; }
  this.setFillStyle = function (newStyle) { fillStyle = newStyle; }
  this.setFont = function (newFont) { font = newFont; }
  this.setAlign = function (newAlign) { align = newAlign; }
  this.setVisible = function (newVisible) { visible = newVisible; }
  this.setBlinkCount = function (newCount) { blinkCount = newCount; }
  this.setBlinkFrequency = function (newFreq) { blinkFrequency = newFreq; }
}

/** ***************************************************************************
 * A welcome state for the Space Invaders game.
 *
 * This state contains the definitions required to show the welcoming message
 * to the user(s). It contains the game name along with the score instructions
 * and an instruction how to start the game. It does not however contain a
 * complex set of game logics as the actual game simulation is not required.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.WelcomeState = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  var playText;
  var nameText;
  var singlePlayerText;
  var multiPlayerText;
  var controlsText;
  var tableCaptionText;
  var tableRow1Sprite;
  var tableRow1Text;
  var tableRowS2prite;
  var tableRow2Text;
  var tableRow3Sprite;
  var tableRow3Text;
  var tableRow4Sprite;
  var tableRow4Text;

  // initialize the play game text.
  playText = new SpaceInvaders.TextEntity(game);
  playText.setText("PLAY");
  playText.setAlign("center");
  playText.setX(672 / 2);
  playText.setY(175);

  // initialize the game name text.
  nameText = new SpaceInvaders.TextEntity(game);
  nameText.setText("HTML5 SPACE INVADERS");
  nameText.setAlign("center");
  nameText.setFillStyle("#20ff20");
  nameText.setX(playText.getX());
  nameText.setY(playText.getY() + 75);

  // initialize the single player text.
  singlePlayerText = new SpaceInvaders.TextEntity(game);
  singlePlayerText.setText("PRESS [1] FOR A 1 PLAYER GAME");
  singlePlayerText.setAlign("center");
  singlePlayerText.setX(playText.getX());
  singlePlayerText.setY(nameText.getY() + 75);
  singlePlayerText.setBlinkCount(-1);
  singlePlayerText.setBlinkFrequency(30);
  singlePlayerText.blink();

  // initialize the multiplayer text.
  multiPlayerText = new SpaceInvaders.TextEntity(game);
  multiPlayerText.setText("PRESS [2] FOR A 2 PLAYER GAME");
  multiPlayerText.setAlign("center");
  multiPlayerText.setX(playText.getX());
  multiPlayerText.setY(singlePlayerText.getY() + 50);
  multiPlayerText.setBlinkCount(-1);
  multiPlayerText.setBlinkFrequency(30);
  multiPlayerText.blink();

  controlsText = new SpaceInvaders.TextEntity(game);
  controlsText.setText("USE ARROW KEYS AND SPACEBAR TO PLAY");
  controlsText.setAlign("center");
  controlsText.setX(playText.getX());
  controlsText.setY(multiPlayerText.getY() + 75);

  // initiailize the score advance table text.
  tableCaptionText = new SpaceInvaders.TextEntity(game);
  tableCaptionText.setText("-- SCORE ADVANCE TABLE --");
  tableCaptionText.setAlign("center");
  tableCaptionText.setX(playText.getX());
  tableCaptionText.setY(controlsText.getY() + 75);

  // initialize the 1st table row sprite image.
  tableRow1Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow1Sprite.setImage(game.getSpriteSheet());
  tableRow1Sprite.setX(playText.getX() - 130);
  tableRow1Sprite.setY(tableCaptionText.getY() + 25);
  tableRow1Sprite.setWidth(43);
  tableRow1Sprite.setHeight(19);
  tableRow1Sprite.setClipX(5);
  tableRow1Sprite.setClipY(92);

  // initialize the 1st table row text.
  tableRow1Text = new SpaceInvaders.TextEntity(game);
  tableRow1Text.setText("= ?  MYSTERY");
  tableRow1Text.setX(tableRow1Sprite.getX() + 10 + tableRow1Sprite.getWidth());
  tableRow1Text.setY(tableRow1Sprite.getY() + 20);

  // initialize the 2nd table row sprite image.
  tableRow2Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow2Sprite.setImage(game.getSpriteSheet());
  tableRow2Sprite.setX(playText.getX() - 120);
  tableRow2Sprite.setY(tableRow1Sprite.getY() + 35);
  tableRow2Sprite.setWidth(24);
  tableRow2Sprite.setHeight(24);
  tableRow2Sprite.setClipX(5);
  tableRow2Sprite.setClipY(63);

  // initialize the 2nd table row text.
  tableRow2Text = new SpaceInvaders.TextEntity(game);
  tableRow2Text.setText("= 30 POINTS");
  tableRow2Text.setX(tableRow1Text.getX());
  tableRow2Text.setY(tableRow2Sprite.getY() + 22);

  // initialize the 3rd table row sprite image.
  tableRow3Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow3Sprite.setImage(game.getSpriteSheet());
  tableRow3Sprite.setX(playText.getX() - 125);
  tableRow3Sprite.setY(tableRow2Sprite.getY() + 35);
  tableRow3Sprite.setWidth(33);
  tableRow3Sprite.setHeight(24);
  tableRow3Sprite.setClipX(5);
  tableRow3Sprite.setClipY(34);

  // initialize the 3rd table row text.
  tableRow3Text = new SpaceInvaders.TextEntity(game);
  tableRow3Text.setText("= 20 POINTS");
  tableRow3Text.setX(tableRow1Text.getX());
  tableRow3Text.setY(tableRow3Sprite.getY() + 22);

  // initialize the 4th table row sprite image.
  tableRow4Sprite = new SpaceInvaders.SpriteEntity(game);
  tableRow4Sprite.setImage(game.getSpriteSheet());
  tableRow4Sprite.setX(playText.getX() - 125);
  tableRow4Sprite.setY(tableRow3Sprite.getY() + 35);
  tableRow4Sprite.setWidth(36);
  tableRow4Sprite.setHeight(24);
  tableRow4Sprite.setClipX(5);
  tableRow4Sprite.setClipY(5);

  // initialize the 4th table row text.
  tableRow4Text = new SpaceInvaders.TextEntity(game);
  tableRow4Text.setText("= 10 POINTS");
  tableRow4Text.setX(tableRow1Text.getX());
  tableRow4Text.setY(tableRow4Sprite.getY() + 22);

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the state.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    playText.update(dt);
    nameText.update(dt);
    singlePlayerText.update(dt);
    multiPlayerText.update(dt);
    controlsText.update(dt);
    tableCaptionText.update(dt);
  }

  /** *************************************************************************
   * Render (i.e. draw) the state on the screen.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    playText.render(ctx);
    nameText.render(ctx);
    singlePlayerText.render(ctx);
    multiPlayerText.render(ctx);
    controlsText.render(ctx);
    tableCaptionText.render(ctx);

    // render score advance table row sprites.
    tableRow1Sprite.render(ctx);
    tableRow2Sprite.render(ctx);
    tableRow3Sprite.render(ctx);
    tableRow4Sprite.render(ctx);

    // render score advance table row texts.
    tableRow1Text.render(ctx);
    tableRow2Text.render(ctx);
    tableRow3Text.render(ctx);
    tableRow4Text.render(ctx);
  }

  /** *************************************************************************
   * A function that is called when the state is being entered.
   *
   * This function is called before the state is being updated (i.e. ticked)
   * for a first time. This makes it an ideal place to put all listener logic.
   */
  this.enter = function () {
    document.addEventListener("keyup", this.keyUp);
  }

  /** *************************************************************************
   * A function that is called when the state is being exited.
   *
   * This function is called after the state is being updated (i.e. ticked)
   * for the last time. This makes it an ideal place to cleanup listeners etc.
   */
  this.exit = function () {
    document.removeEventListener("keyup", this.keyUp);
  }

  /** *************************************************************************
   * A key listener function called when the user releases a key press.
   * @param {KeyboardEvent} e The keyboard event received from the DOM.
   */
  this.keyUp = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    switch (key) {
      case game.KEY_1:
        game.setPlayerCount(1);
        game.setActivePlayer(1);
        break;
      case game.KEY_2:
        game.setPlayerCount(2);
        game.setActivePlayer(1);
        break;
    }
  }
}

/** ***************************************************************************
 * A starting state to indicate that the player should prepare to play.
 *
 * This scene creates a simple "PLAY PLAYER<?>" text for the next player that
 * should prepare itself to play the game. This is a typical transition between
 * the players when the multiplayer game mode is being used.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.PlayPlayerState = function (game) {

  /** A constant definition of ticks before this state automatically proceeds. */
  this.VISIBILITY_TICKS = (30 * 5);

  /** A counter of ticks before automatically proceeding to next state. */
  var tickCounter = this.VISIBILITY_TICKS;
  /** A text entity to be shown. */
  var text;

  // initialize the text describing the player to play next.
  text = new SpaceInvaders.TextEntity(game);
  text.setText("PLAY PLAYER<" + game.getActivePlayer() + ">");
  text.setAlign("center");
  text.setX(672 / 2);
  text.setY(400);

  /** *************************************************************************
   * Update (i.e. tick) the the logic within the state.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    tickCounter--;
    if (tickCounter <= 0) {
      game.getScene().setState(new SpaceInvaders.IngameState(game));
    }
  }

  /** *************************************************************************
   * Render (i.e. draw) the state on the screen.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    text.render(ctx);
  }

  /** *************************************************************************
   * A function that is called when the state is being entered.
   *
   * This function is called before the state is being updated (i.e. ticked)
   * for a first time. This makes it an ideal place to put all listener logic.
   */
  this.enter = function () {
    // ...
  }

  /** *************************************************************************
   * A function that is called when the state is being exited.
   *
   * This function is called after the state is being updated (i.e. ticked)
   * for the last time. This makes it an ideal place to cleanup listeners etc.
   */
  this.exit = function () {
    // ...
  }
}

/** ***************************************************************************
 * The ingame state for the Space Invaders game.
 *
 * This is the state where the player(s) actually play the game. Here we allow
 * users to move and fire with the turret so they can prevent the earth from
 * being invaded by the invaders coming from the space.
 *
 * @param {SpaceInvaders.Game} game A reference to the root game instance.
 */
SpaceInvaders.IngameState = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  /** A constant starting step size for the aliens. */
  this.ALIEN_START_STEP_SIZE = 55;
  /** A constant amount to decrement step size on each collided alien. */
  this.ALIEN_STEP_DECREMENT_SIZE = 1;

  /** A constant index for the plunger shot column array start index. */
  this.ALIEN_PLUNGER_SHOT_START_INDEX = 0;
  /** A constant index for the squiggly shot column array start index.  */
  this.ALIEN_SQUIGGLY_SHOT_START_INDEX = 6;
  /** A constant amount of shot indices per shot type (round-robin). */
  this.ALIEN_SHOT_INDICE_COUNT = 15;

  /** A constant time interval between appending the flying saucer. */
  this.FLYING_SAUCER_INTERVAL = 1200;
  /** A time that is waited after player avatar gets destroyed. */
  this.RELAUNCH_WAIT_TIME = 150;

  /** A reference to the currently active player context. */
  var ctx = game.getActiveContext();

  var footerLine;
  var avatar;
  var avatarLaser;
  var avatarLaserCount;
  var lifesText;
  var lifeSprites;
  var gameOverText;
  var gameOverInstructions;

  var leftOutOfBoundsDetector;
  var rightOutOfBoundsDetector;
  var topOutOfBoundsDetector;

  var aliens;
  var alienLeftBoundsDetector;
  var alienRightBoundsDetector;
  var alienShots;

  var flyingSaucer;
  /** The counter to count when the flying saucer is launched. */
  var flyingSaucerCounter = this.FLYING_SAUCER_INTERVAL;
  /** The flying saucer point table used along with player shot counter. */
  var flyingSaucerPointTable = [
    100, 50, 50, 100, 150, 100, 100, 50, 300, 100, 100, 100, 50, 150, 100
  ];

  /** The current shot column index of the plunger shot.  */
  var alienPlungerShotColumnIndice = this.ALIEN_PLUNGER_SHOT_START_INDEX;
  /** The current shot column index of the squiggly shot. */
  var alienSquigglyShotColumnIndice = this.ALIEN_SQUIGGLY_SHOT_START_INDEX;
  /** The column indices used to define where to shoot the alien missiles. */
  var alienShotColumn = [
    0, 6, 0, 0, 0, 3, 10, 0, 5, 2, 0, 0, 10, 8, 1, 7, 1, 10, 3, 6, 9
  ];
  /** A lock used to prevent rolling shot to be created constantly. */
  var alienRollingShotLock = 0;

  /** A counter used to wait before re-launching the game after avatar destruction. */
  var relaunchCounter = 0;

  var shields;

  this.getAlienReloadRate = function () {
    // return a reload rate based on the current score.
    var currentScore = ctx.getScore();
    if (currentScore <= 200) {
      return 48;
    } else if (currentScore <= 1000) {
      return 16;
    } else if (currentScore <= 2000) {
      return 11;
    } else if (currentScore <= 3000) {
      return 8;
    } else {
      return 7;
    }
  }

  this.getAlienStartY = function () {
    // return the topmost alien starting y-position based on the current level.
    var level = Math.max(1, (ctx.getLevel() % 10));
    var start = 192;
    if (level > 1) {
      start += 48;
    }
    if (level > 2) {
      start += 24;
    }
    if (level > 3) {
      start += 24;
    }
    if (level > 5) {
      start += 24;
    }
    return start;
  }

  this.constructAliens = function () {
    aliens = ctx.getAlienStates();
    if (aliens == undefined) {
      aliens = [];
      var startRow = this.getAlienStartY();
      for (row = 0; row < 5; row++) {
        var y = startRow + (24 * 2 * row);
        var x = 66;
        for (col = 0; col < 11; col++) {
          var alien = new SpaceInvaders.AnimatedMovableSpriteEntity(game);
          alien.setImage(game.getSpriteSheet());
          alien.setDirectionX(1);
          alien.setVelocity(0.4);
          alien.setAnimationStepSize(this.ALIEN_START_STEP_SIZE);
          alien.setStepSize(this.ALIEN_START_STEP_SIZE);
          alien.setY(y);
          alien.setHeight(24);
          if (row == 0) {
            alien.setWidth(24);
            alien.setX(x + 6 + (col * 2 * 24));
            alien.addAnimationFrame(5, 62, 24, 24);
            alien.addAnimationFrame(34, 62, 24, 24);
          } else if (row < 3) {
            alien.setWidth(33);
            alien.setX(x + 1 + (col * 2 * 24));
            alien.addAnimationFrame(5, 33, 33, 24);
            alien.addAnimationFrame(43, 33, 33, 24);
          } else {
            alien.setWidth(36);
            alien.setX(x + (col * 2 * 24));
            alien.addAnimationFrame(5, 5, 36, 24);
            alien.addAnimationFrame(46, 5, 36, 24);
          }
          alien.setAnimationFrameIndex(0);
          aliens.push(alien);
        }
      }
    }
  }

  this.constructShields = function () {
    shields = ctx.getShieldStates();
    if (shields == undefined) {
      var shield1 = new SpaceInvaders.Shield(game);
      shield1.setImage(game.getSpriteSheet());
      shield1.setWidth(66);
      shield1.setHeight(48);
      shield1.setClipX(293);
      shield1.setClipY(5);
      shield1.setX(135 - shield1.getWidth() / 2);
      shield1.setY(575);

      var shield2 = new SpaceInvaders.Shield(game);
      shield2.setImage(game.getSpriteSheet());
      shield2.setWidth(66);
      shield2.setHeight(48);
      shield2.setClipX(293);
      shield2.setClipY(5);
      shield2.setX(269 - shield2.getWidth() / 2);
      shield2.setY(575);

      var shield3 = new SpaceInvaders.Shield(game);
      shield3.setImage(game.getSpriteSheet());
      shield3.setWidth(66);
      shield3.setHeight(48);
      shield3.setClipX(293);
      shield3.setClipY(5);
      shield3.setX(403 - shield3.getWidth() / 2);
      shield3.setY(575);

      var shield4 = new SpaceInvaders.Shield(game);
      shield4.setImage(game.getSpriteSheet());
      shield4.setWidth(66);
      shield4.setHeight(48);
      shield4.setClipX(293);
      shield4.setClipY(5);
      shield4.setX(537 - shield4.getWidth() / 2);
      shield4.setY(575);

      shields = [];
      shields.push(shield1);
      shields.push(shield2);
      shields.push(shield3);
      shields.push(shield4);
    }
  }

  // initialize the green static footer line at the bottom of the screen.
  footerLine = new SpaceInvaders.SpriteEntity(game);
  footerLine.setImage(game.getSpriteSheet());
  footerLine.setX(0);
  footerLine.setY(717);
  footerLine.setWidth(672);
  footerLine.setHeight(3);
  footerLine.setClipX(0);
  footerLine.setClipY(117);

  // initialize the green avatar moved by the player.
  avatar = new SpaceInvaders.AvatarEntity(game, this);
  avatar.setImage(game.getSpriteSheet());
  avatar.setWidth(40);
  avatar.setHeight(24);
  avatar.setX(45);
  avatar.setY(648);
  avatar.setVelocity(0.25);
  avatar.addAnimationFrame(86, 5, 40, 24);
  avatar.setAnimationFrameIndex(0);

  // initialize a single laser for the avatar.
  // we can reuse the same laser instance for the avatar.
  avatarLaser = new SpaceInvaders.AvatarLaser(game);
  avatarLaser.setImage(game.getSpriteSheet());
  avatarLaser.setWidth(6);
  avatarLaser.setHeight(9);
  avatarLaser.setX(0);
  avatarLaser.setY(0);
  avatarLaser.setVelocity(0.75);
  avatarLaser.setDirectionY(-1);
  avatarLaser.setVisible(false);
  avatarLaser.setEnabled(false);
  avatarLaser.addAnimationFrame(80, 36, 6, 9);
  avatarLaser.addAnimationFrame(131, 5, 39, 24);
  avatarLaser.addAnimationFrame(175, 5, 39, 24);
  avatarLaser.addAnimationFrame(251, 37, 24, 24);
  avatarLaser.setAnimationStepSize(0);
  avatarLaser.setAnimationFrameIndex(0);
  avatarLaserCount = 0;

  // get the amount of lives for the current player.
  var lives = ctx.getLives();

  // initialize the text indicating the amount lifes.
  lifesText = new SpaceInvaders.TextEntity(game);
  lifesText.setText(lives.toString());
  lifesText.setX(27);
  lifesText.setY(743);

  // initialize the sprites describing the reserved lives.
  lifeSprites = [];
  for (i = 0; i < (lives - 1); i++) {
    var sprite = new SpaceInvaders.SpriteEntity(game);
    sprite.setImage(game.getSpriteSheet());
    sprite.setWidth(40);
    sprite.setHeight(24);
    sprite.setX(66 + i * 49);
    sprite.setY(720);
    sprite.setClipX(85);
    sprite.setClipY(5);
    lifeSprites.push(sprite);
  }

  // initialize the text that indicates that the game has ended.
  gameOverText = new SpaceInvaders.TextEntity(game);
  gameOverText.setAlign("center");
  gameOverText.setFillStyle("#f50305");
  gameOverText.setText("GAME OVER");
  gameOverText.setVisible(false);
  gameOverText.setX(672 / 2);
  gameOverText.setY(135);

  // initialize the text that indicates how to continue from game over.
  gameOverInstructions = new SpaceInvaders.TextEntity(game);
  gameOverInstructions.setAlign("center");
  gameOverInstructions.setFillStyle("#f50305");
  gameOverInstructions.setText("PRESS ENTER TO CONTINUE");
  gameOverInstructions.setVisible(false);
  gameOverInstructions.setX(672 / 2);
  gameOverInstructions.setY(gameOverText.getY() + 40);

  // initialize an out-of-bounds detector at the left side of the scene.
  leftOutOfBoundsDetector = new SpaceInvaders.CollideableEntity(game);
  leftOutOfBoundsDetector.setX(-100);
  leftOutOfBoundsDetector.setY(0);
  leftOutOfBoundsDetector.setExtentX(50);
  leftOutOfBoundsDetector.setExtentY(768 / 2);

  // initialize an out-of-bounds detector at the right side of the scene.
  rightOutOfBoundsDetector = new SpaceInvaders.CollideableEntity(game);
  rightOutOfBoundsDetector.setX(672);
  rightOutOfBoundsDetector.setY(0);
  rightOutOfBoundsDetector.setExtentX(50);
  rightOutOfBoundsDetector.setExtentY(768 / 2);

  // initialize an out-of-bounds detector at the top of the scene.
  topOutOfBoundsDetector = new SpaceInvaders.CollideableEntity(game);
  topOutOfBoundsDetector.setX(0);
  topOutOfBoundsDetector.setY(0);
  topOutOfBoundsDetector.setExtentX(768 / 2);
  topOutOfBoundsDetector.setExtentY(45);

  // initialize the flying saucer at the top-right of the screen.
  flyingSaucer = new SpaceInvaders.AnimatedMovableSpriteEntity(game);
  flyingSaucer.setImage(game.getSpriteSheet());
  flyingSaucer.setVelocity(0.15);
  flyingSaucer.setEnabled(false);
  flyingSaucer.setVisible(false);
  flyingSaucer.setX(672 - 43);
  flyingSaucer.setY(115);
  flyingSaucer.setWidth(43);
  flyingSaucer.setHeight(19);
  flyingSaucer.addAnimationFrame(5, 91, 43, 19)
  flyingSaucer.addAnimationFrame(54, 91, 66, 24);
  flyingSaucer.setAnimationFrameIndex(0);

  // initialize aliens.
  this.constructAliens();

  // initialize the left alien director for alien and avatar movement restrictions.
  alienLeftBoundsDetector = new SpaceInvaders.CollideableEntity(game);
  alienLeftBoundsDetector.setX(-45);
  alienLeftBoundsDetector.setY(0);
  alienLeftBoundsDetector.setExtentX(45);
  alienLeftBoundsDetector.setExtentY(768 / 2);

  // initialize the right alien director for alien and avatar movement restrictions.
  alienRightBoundsDetector = new SpaceInvaders.CollideableEntity(game);
  alienRightBoundsDetector.setX(672 - 45);
  alienRightBoundsDetector.setY(0);
  alienRightBoundsDetector.setExtentX(45);
  alienRightBoundsDetector.setExtentY(768 / 2);

  // ===============
  // = ALIEN SHOTS =
  // ===============

  // initialize the rolling (i.e. homing) alien shot.
  var rollingShot = new SpaceInvaders.AlienShotEntity(game, this);
  rollingShot.setImage(game.getSpriteSheet());
  rollingShot.setWidth(9);
  rollingShot.setHeight(21);
  rollingShot.setVelocity(0.2);
  rollingShot.setDirectionY(1);
  rollingShot.addAnimationFrame(149, 37, 9, 21);
  rollingShot.addAnimationFrame(163, 37, 9, 21);
  rollingShot.addAnimationFrame(149, 37, 9, 21);
  rollingShot.addAnimationFrame(178, 37, 9, 21);
  rollingShot.setAnimationFrameIndex(0);
  rollingShot.setAnimationStepSize(4);
  rollingShot.setVisible(false);
  rollingShot.setEnabled(false);

  // initialize the plunger alien shot.
  var plungerShot = new SpaceInvaders.AlienShotEntity(game, this);
  plungerShot.setImage(game.getSpriteSheet());
  plungerShot.setWidth(9);
  plungerShot.setHeight(18);
  plungerShot.setVelocity(0.2);
  plungerShot.setDirectionY(1);
  plungerShot.addAnimationFrame(93, 37, 9, 21);
  plungerShot.addAnimationFrame(107, 37, 9, 21);
  plungerShot.addAnimationFrame(121, 37, 9, 21);
  plungerShot.addAnimationFrame(135, 37, 9, 21);
  plungerShot.setAnimationFrameIndex(0);
  plungerShot.setAnimationStepSize(4);
  plungerShot.setVisible(false);
  plungerShot.setEnabled(false);

  // initialize the squiggly alien shot.
  var squigglyShot = new SpaceInvaders.AlienShotEntity(game, this);
  squigglyShot.setImage(game.getSpriteSheet());
  squigglyShot.setWidth(9);
  squigglyShot.setHeight(21);
  squigglyShot.setVelocity(0.2);
  squigglyShot.setDirectionY(1);
  squigglyShot.addAnimationFrame(191, 37, 9, 21);
  squigglyShot.addAnimationFrame(206, 37, 9, 21);
  squigglyShot.addAnimationFrame(221, 37, 9, 21);
  squigglyShot.addAnimationFrame(236, 37, 9, 21);
  squigglyShot.setAnimationFrameIndex(0);
  squigglyShot.setAnimationStepSize(4);
  squigglyShot.setVisible(false);
  squigglyShot.setEnabled(false);

  // initialize the array of alien shots.
  alienShots = [];
  alienShots.push(rollingShot);
  alienShots.push(plungerShot);
  alienShots.push(squigglyShot);

  // construct the four avatar shields for the player.
  this.constructShields();

  this.getAlienShots = function () { return alienShots; }

  this.startRelaunchCounter = function () {
    relaunchCounter = this.RELAUNCH_WAIT_TIME;
  }

  /** *************************************************************************
   * Decrement the current amoun of player lives for the target player.
   *
   * This function is used to perform all necessary operations to decrement
   * the amount of lives for the target player. It updates the global lives
   * count and also ensures that the visual presentation is being updated.
   *
   * @param {number} playerIndex The index of the target player.
   */
  this.decrementPlayerLives = function (playerIndex) {
    // get the current amount of lives of the target player.
    var lives = ctx.getLives();

    // decrement the amount of lives by one.
    lives = Math.max(0, lives - 1);

    // set the new lives amount for the target player.
    ctx.setLives(lives);

    // update the visual presentations of the current lives.
    lifesText.setText(lives.toString());
    if (lifeSprites.length > 0) {
      lifeSprites[Math.max(0, lives - 1)].setVisible(false);
    }
  }

  this.update = function (dt) {
    // skip logical updates if the game has ended.
    if (gameOverText.isVisible()) {
      return;
    }

    // decrement relaunch counter if launched or handle destruction state.
    if (relaunchCounter > 0) {
      relaunchCounter--;
    } else if (avatar.isEnabled() == false) {
      var playerCount = game.getPlayerCount();
      if (playerCount == 1) {
        // check whether it's time end game or reset the avatar.
        if (ctx.getLives() == 0) {
          // check and update hi-score if necessary.
          var score = ctx.getScore();
          if (score > game.getHiScore()) {
            game.setHiScore(score);
          }

          // show the game over text.
          gameOverText.setVisible(true);
          gameOverInstructions.setVisible(true);
        } else {
          avatar.reset();
        }
      } else {
        // multi-player mode:
        ctx.setAlienStates(aliens);
        ctx.setShieldStates(shields);
        var playerIndex = game.getActivePlayer();
        if (playerIndex == 1) {
          game.setActivePlayer(2);
          var scene = game.getScene();
          var state = new SpaceInvaders.PlayPlayerState(game);
          scene.setState(state);
        } else {
          // check whether the game should end.
          var player1Ctx = game.getPlayer1Context();
          var player2Ctx = game.getPlayer2Context();
          if (player2Ctx.getLives() == 0) {
            // check and update hi-score if necessary.
            var score = player1Ctx.getScore();
            if (score > game.getHiScore()) {
              game.setHiScore(score);
            }

            // check and update hi-score if necessary.
            score = player2Ctx.getScore();
            if (score > game.getHiScore()) {
              game.setHiScore(score);
            }

            // show the game over text and also the score for 1st player.
            gameOverText.setVisible(true);
            gameOverInstructions.setVisible(true);
            game.getScene().getScore1Text().setVisible(true);
          } else {
            game.setActivePlayer(1);
            var scene = game.getScene();
            var state = new SpaceInvaders.PlayPlayerState(game);
            scene.setState(state);
          }
        }
      }
    }

    avatar.update(dt);
    avatar.animate();

    if (avatarLaser.isVisible()) {
      avatarLaser.update(dt);
    }

    flyingSaucer.update(dt);

    // check whether any of the aliens hit the alien movement bounds.
    var aliensHitBounds = false;
    for (i = 0; i < aliens.length && !aliensHitBounds; i++) {
      if (aliens[i].getDirectionX() > 0) {
        if (alienRightBoundsDetector.collides(aliens[i])) {
          aliensHitBounds = true;
        }
      } else {
        if (alienLeftBoundsDetector.collides(aliens[i])) {
          aliensHitBounds = true;
        }
      }
    }

    // animate and update the currently visible aliens.
    var activeAlienCount = 0;
    if (avatar.isEnabled()) {
      for (i = 0; i < aliens.length; i++) {
        if (aliensHitBounds && aliens[i].getStepCounter()) {
          aliens[i].setDirectionX(-aliens[i].getDirectionX());
          aliens[i].setY(aliens[i].getY() + aliens[i].getHeight());
        }
        if (aliens[i].isVisible()) {
          activeAlienCount++;
          aliens[i].update(dt);
          aliens[i].animate();

          // check whether the alien has just landed.
          if (aliens[i].collides(footerLine)) {
            avatar.explode();
          }
        }
      }

      // check whether all aliens are destroyed i.e. the level is cleared.
      if (activeAlienCount <= 0) {
        ctx.setLevel(ctx.getLevel() + 1);
        var scene = game.getScene();
        scene.setState(new SpaceInvaders.PlayPlayerState(game));
        return;
      }
    }

    // check that the avatar cannot go out-of-bounds from the either side of the scene.
    if (avatar.getDirectionX() == -1) {
      if (alienLeftBoundsDetector.collides(avatar)) {
        avatar.setDirectionX(0);
        avatar.setX(alienLeftBoundsDetector.getX() + 2 * alienLeftBoundsDetector.getExtentX());
      }
    } else if (avatar.getDirectionX() == 1) {
      if (alienRightBoundsDetector.collides(avatar)) {
        avatar.setDirectionX(0);
        avatar.setX(alienRightBoundsDetector.getX() - avatar.getWidth());
      }
    }

    // check and apply a state for the alien rolling missile.
    if (avatar.isEnabled()) {
      if (alienRollingShotLock > 0) {
        alienRollingShotLock--;
      }
      if (alienShots[0].isReadyToBeFired() && alienRollingShotLock <= 0) {
        // find the nearest alien from the list of aliens.
        var avatarX = avatar.getCenterX();
        var aliendIdx = -1;
        var prevDistance = -1;
        for (col = 0; col < 11; col++) {
          var distance = Math.abs(aliens[col].getCenterX() - avatarX);
          if (prevDistance != -1 && distance > prevDistance) {
            break;
          }
          for (row = 4; row >= 0; row--) {
            var idx = (row * 11) + col;
            if (aliens[idx].isVisible()) {
              alienIdx = idx;
              prevDistance = distance;
              break;
            }
          }
        }
        if (alienIdx != -1) {
          alienShots[0].setX(aliens[alienIdx].getCenterX() - alienShots[0].getExtentX());
          alienShots[0].setY(aliens[alienIdx].getY() + aliens[alienIdx].getHeight());
          alienShots[0].fire();
        }
        alienRollingShotLock = this.getAlienReloadRate() * 4;
      }
    }

    // ========================================================================
    // create an alien plunger missile if it is being ready.
    if (activeAlienCount > 1) {
      if (avatar.isEnabled() && alienShots[1].isReadyToBeFired()) {
        // get the next target column and increment the column index pointer.
        var column = alienShotColumn[alienPlungerShotColumnIndice];
        alienPlungerShotColumnIndice = (alienPlungerShotColumnIndice + 1);
        alienPlungerShotColumnIndice = (alienPlungerShotColumnIndice % this.ALIEN_SHOT_INDICE_COUNT);

        for (n = 4; n >= 0; n--) {
          var idx = (n * 11) + column;
          if (aliens[idx].isVisible()) {
            // assign the position of the plunger shot based on the nearest alien.
            alienShots[1].setX(aliens[idx].getCenterX() - alienShots[1].getExtentX());
            alienShots[1].setY(aliens[idx].getY() + aliens[idx].getHeight());
            alienShots[1].fire();
            break;
          }
        }
      }
    }

    // decrement the flying saucer counter when the saucer is not visible.
    if (flyingSaucer.isVisible() == false) {
      flyingSaucerCounter--;
    }

    // ========================================================================
    // create an flying saucer or an alien squiggly missile if it is being ready.
    if (avatar.isEnabled() && flyingSaucer.isVisible() == false && alienShots[2].isReadyToBeFired()) {
      // check whether it is time to launch the flying saucer.
      if (flyingSaucerCounter <= 0 && activeAlienCount >= 8) {
        // set saucer movement direction depending on the player shot count.
        if ((avatarLaserCount % 2) == 0) {
          flyingSaucer.setDirectionX(-1);
          flyingSaucer.setX(672 - flyingSaucer.getWidth());
        } else {
          flyingSaucer.setDirectionX(1);
          flyingSaucer.setX(0);
        }

        // enable saucer and reset saucer counter.
        flyingSaucer.setEnabled(true);
        flyingSaucer.setVisible(true);
        flyingSaucer.setAnimationFrameIndex(0);
        flyingSaucerCounter = this.FLYING_SAUCER_INTERVAL;
      } else {
        // get the next target column and increment the column index pointer.
        var column = alienShotColumn[alienSquigglyShotColumnIndice];
        alienSquigglyShotColumnIndice = (alienSquigglyShotColumnIndice + 1);
        alienSquigglyShotColumnIndice = (alienSquigglyShotColumnIndice % this.ALIEN_SHOT_INDICE_COUNT);

        for (n = 4; n >= 0; n--) {
          var idx = (n * 11) + column;
          if (aliens[idx].isVisible()) {
            // assign the position of the plunger shot based on the nearest alien.
            alienShots[2].setX(aliens[idx].getCenterX() - alienShots[2].getExtentX());
            alienShots[2].setY(aliens[idx].getY() + aliens[idx].getHeight());
            alienShots[2].fire();
            break;
          }
        }
      }
    }

    // animate, update and check collisions for all alien shots.
    for (var i = 0; i < alienShots.length; i++) {
      alienShots[i].animateAndUpdate(dt);
      if (alienShots[i].collides(avatar)) {
        // hide the shot and explode the avatar.
        alienShots[i].setEnabled(false);
        alienShots[i].setVisible(false);
        avatar.explode();
      } else if (alienShots[i].collides(footerLine)) {
        // explode at the footer.
        alienShots[i].explode();
      } else if (alienShots[i].collides(avatarLaser)) {
        // explode at the collision point.
        alienShots[i].setEnabled(false);
        alienShots[i].setVisible(false);
        avatarLaser.explode();
      } else {
        // explode when a shield is being hit.
        for (var j = 0; j < shields.length; j++) {
          shields[j].preciseCollides(alienShots[i]);
        }
      }
    }

    // animate and check whether the laser shot by the avatar hits something.
    if (avatarLaser.isVisible()) {
      avatarLaser.animate();
      if (avatarLaser.collides(topOutOfBoundsDetector)) {
        // stop the laser and change the image into the splash explosion image.
        avatarLaser.setDirectionY(0);
        avatarLaser.setAnimationFrameIndex(1);
        avatarLaser.setY(topOutOfBoundsDetector.getY() + topOutOfBoundsDetector.getExtentY() * 2);
        avatarLaser.setDisappearCountdown(15);
      } else if (avatarLaser.collides(flyingSaucer)) {
        // hide the avatar laser shot.
        avatarLaser.setDirectionY(0);
        avatarLaser.setEnabled(false);
        avatarLaser.setVisible(false);

        // change the flying saucer to perform a splash explosion.
        flyingSaucer.setDirectionX(0);
        flyingSaucer.setAnimationFrameIndex(1);
        flyingSaucer.setDisappearCountdown(15);

        // add points for the player depending on the shot count.
        var score = flyingSaucerPointTable[avatarLaserCount % 15];
        ctx.addScore(score);
      } else {
        // check whether player laser hits shields.
        for (var i = 0; i < shields.length; i++) {
          shields[i].preciseCollides(avatarLaser)
        }
        for (n = 0; n < aliens.length; n++) {
          if (avatarLaser.collides(aliens[n])) {
            // disable and stop the laser from further movement.
            avatarLaser.setDirectionY(0);
            avatarLaser.setEnabled(false);

            // make the explosion to show where the alien was at the moment of collision.
            avatarLaser.setAnimationFrameIndex(2);
            avatarLaser.setDisappearCountdown(15);
            avatarLaser.setX(aliens[n].getCenterX() - avatarLaser.getExtentX());
            avatarLaser.setY(aliens[n].getCenterY() - avatarLaser.getExtentY());

            // hide and disable the collided alien.
            aliens[n].setEnabled(false);
            aliens[n].setVisible(false);

            // earn score to player based on the alien type.
            var score = 0;
            if (n < 11) {
              score = 30;
            } else if (n < 33) {
              score = 20;
            } else {
              score = 10;
            }

            // assign the earned score to currently active player.
            ctx.addScore(score);

            // speed up the movement of the aliens.
            var newStepSize = aliens[0].getStepSize() - this.ALIEN_STEP_DECREMENT_SIZE;
            for (m = 0; m < aliens.length; m++) {
              aliens[m].setStepSize(newStepSize);
              aliens[m].setAnimationStepSize(newStepSize);
            }
            break;
          }
        }
      }
    }

    // check whether the flying saucer has reached the movement across the screen.
    if (flyingSaucer.isVisible()) {
      if (flyingSaucer.getDirectionX() == 1) {
        if (rightOutOfBoundsDetector.collides(flyingSaucer)) {
          flyingSaucer.setEnabled(false);
          flyingSaucer.setVisible(false);
        }
      } else {
        if (leftOutOfBoundsDetector.collides(flyingSaucer)) {
          flyingSaucer.setEnabled(false);
          flyingSaucer.setVisible(false);
        }
      }
    }

  }

  this.render = function (ctx) {
    footerLine.render(ctx);
    avatar.render(ctx);
    for (i = 0; i < shields.length; i++) {
      shields[i].render(ctx);
    }
    avatarLaser.render(ctx);
    lifesText.render(ctx);
    flyingSaucer.render(ctx);
    gameOverText.render(ctx);
    gameOverInstructions.render(ctx);
    for (i = 0; i < lifeSprites.length; i++) {
      lifeSprites[i].render(ctx);
    }
    for (i = 0; i < aliens.length; i++) {
      aliens[i].render(ctx);
    }
    for (i = 0; i < alienShots.length; i++) {
      alienShots[i].render(ctx);
    }
  }

  /** *************************************************************************
   * A function that is called when the state is being entered.
   *
   * This function is called before the state is being updated (i.e. ticked)
   * for a first time. This makes it an ideal place to put all listener logic.
   */
  this.enter = function () {
    document.addEventListener("keyup", this.keyUp);
    document.addEventListener("keydown", this.keyDown);
  }

  /** *************************************************************************
   * A function that is called when the state is being exited.
   *
   * This function is called after the state is being updated (i.e. ticked)
   * for the last time. This makes it an ideal place to cleanup listeners etc.
   */
  this.exit = function () {
    document.removeEventListener("keyup", this.keyUp);
    document.removeEventListener("keydown", this.keyDown);
  }

  /** *************************************************************************
   * A key listener function called when the user releases a key press.
   * @param {KeyboardEvent} e The keyboard event received from the DOM.
   */
  this.keyUp = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    switch (key) {
      case game.KEY_LEFT:
        if (avatar.isEnabled() && avatar.getDirectionX() == -1) {
          avatar.setDirectionX(0);
        }
        break;
      case game.KEY_RIGHT:
        if (avatar.isEnabled() && avatar.getDirectionX() == 1) {
          avatar.setDirectionX(0);
        }
        break;
      case game.KEY_SPACEBAR:
        if (avatar.isEnabled() && avatarLaser.isVisible() == false) {
          // shoot the laser from the avatar position.
          avatarLaser.setVisible(true);
          avatarLaser.setEnabled(true);
          avatarLaser.setDirectionY(-1);
          avatarLaser.setX(avatar.getCenterX() - avatarLaser.getExtentX());
          avatarLaser.setY(avatar.getY());
          avatarLaser.setAnimationFrameIndex(0);

          // increment the laser counter.
          avatarLaserCount++;
        }
        break;
      case game.KEY_ENTER: {
        if (gameOverText.isVisible()) {
          // reset game context before returning to welcome scene.
          game.getPlayer1Context().reset();
          game.getPlayer2Context().reset();

          // return back to the welcome scene.
          var scene = game.getScene();
          var state = new SpaceInvaders.WelcomeState(game);
          scene.setState(state);
        }
        break;
      }
    }
  }

  /** *************************************************************************
   * A key listener function called when the user releases a key press.
   * @param {KeyboardEvent} e The keyboard event received from the DOM.
   */
  this.keyDown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    switch (key) {
      case game.KEY_LEFT:
        if (avatar.isEnabled()) {
          avatar.setDirectionX(-1);
        }
        break;
      case game.KEY_RIGHT:
        if (avatar.isEnabled()) {
          avatar.setDirectionX(1);
        }
        break;
    }
  }

}

/** ***************************************************************************
 * The scene used within the Space Invaders game application.
 *
 * Space Invaders contains only one scene that is kept visible during the whole
 * application execution. This scene will always contain the 3 score at the top
 * of the scene (i.e. 1st and 2nd player scores and the high score).The center
 * contents of the screen will be changed dynamically based on the current state
 * of the game. The original version also contained the "Credit" section always
 * visible at the bottom-right corner of the scene, but we can leave that out.
 *
 * @param {SpaceInvaders.Game} game A reference to the target game instance.
 */
SpaceInvaders.Scene = function (game) {
  /** A reference to the root game instance. */
  this.game = game;

  /** A reference to the data and state container for the 1st player. */
  this.player1Context = game.getPlayer1Context();
  /** A reference to the data and state container for the 2nd player. */
  this.player2Context = game.getPlayer2Context();

  var score1Caption;
  var hiScoreCaption;
  var score2Caption;

  var score1Text;
  var hiScoreText;
  var score2Text;

  var state;

  // initialize the static caption for the 1st player score.
  score1Caption = new SpaceInvaders.TextEntity(game);
  score1Caption.setText("SCORE<1>");
  score1Caption.setAlign("center");
  score1Caption.setX(125);
  score1Caption.setY(40);

  // initialize the static caption for the high score.
  hiScoreCaption = new SpaceInvaders.TextEntity(game);
  hiScoreCaption.setText("HI-SCORE");
  hiScoreCaption.setAlign("center");
  hiScoreCaption.setX(672 / 2);
  hiScoreCaption.setY(score1Caption.getY());

  // initialize the static caption for the 1st player score.
  score2Caption = new SpaceInvaders.TextEntity(game);
  score2Caption.setText("SCORE<2>");
  score2Caption.setAlign("center");
  score2Caption.setX(672 - 130);
  score2Caption.setY(score1Caption.getY());

  // initialize the dynamic score value for the 1st player score.
  score1Text = new SpaceInvaders.TextEntity(game);
  score1Text.setText("0000");
  score1Text.setAlign("center");
  score1Text.setX(score1Caption.getX());
  score1Text.setY(score1Caption.getY() + 35);

  // initialize the dynamic score value for the high score.
  hiScoreText = new SpaceInvaders.TextEntity(game);
  hiScoreText.setText("0000");
  hiScoreText.setAlign("center");
  hiScoreText.setX(hiScoreCaption.getX());
  hiScoreText.setY(score1Text.getY());

  // initialize the dynamic score value for the 2nd player score.
  score2Text = new SpaceInvaders.TextEntity(game);
  score2Text.setText("0000");
  score2Text.setAlign("center");
  score2Text.setX(score2Caption.getX());
  score2Text.setY(score1Text.getY());

  /** *************************************************************************
   * Set and enter into the given state.
   *
   * The previous state (if any) will be first exited by calling the #exit so
   * it can perform any cleanup e.g. removing listeners from DOM objects etc.
   * When the new state is assigned, it will be entered with the #enter method.
   *
   * @param {SpaceInvaders.<*>State} newState A state to be assigned.
   */
  this.setState = function (newState) {
    // exit from the previous state.
    if (state) {
      state.exit();
    }

    // assign the new state.
    state = newState;

    // enter into the new state.
    if (state) {
      state.enter();
    }
  }

  /** *************************************************************************
   * Update (i.e. tick) the all the game logic within the scene.
   * @param {double} dt The delta time from the previous tick operation.
   */
  this.update = function (dt) {
    // ensure that all visible score-markers are up-to-date.
    score1Text.setText(SpaceInvaders.toScoreString(this.player1Context.getScore()));
    score2Text.setText(SpaceInvaders.toScoreString(this.player2Context.getScore()));
    hiScoreText.setText(SpaceInvaders.toScoreString(game.getHiScore()));

    score1Caption.update(dt);
    hiScoreCaption.update(dt);
    score2Caption.update(dt);

    score1Text.update(dt);
    hiScoreText.update(dt);
    score2Text.update(dt);

    state.update(dt);
  }

  /** *************************************************************************
   * Render (i.e. draw) the all visible stuff.
   * @param {CanvasRenderingContext2D} ctx The drawing context to use.
   */
  this.render = function (ctx) {
    score1Caption.render(ctx);
    hiScoreCaption.render(ctx);
    score2Caption.render(ctx);

    score1Text.render(ctx);
    hiScoreText.render(ctx);
    score2Text.render(ctx);

    state.render(ctx);
  }


  this.getState = function () { return state; }
  this.getScore1Text = function () { return score1Text; }
  this.getScore2Text = function () { return score2Text; }
}
