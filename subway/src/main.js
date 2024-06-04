var statusKeys = {};
var cubeRotation = 0.0;
var cameraAngleDegHoriz = 0;
var cameraAngleDegVert = 0;
var num_walls = 30;
var flash = false;
var gray = false;
var game_over = false;
var game_start = false;
var speed = 0.075;
var speed_wall = 0.2;
var then = 0;
var flash_time = 0;
var flash_then = 0;
var toggle_1 = 0;
var toggle_2 = 0;
var finish = 0;

main();

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform bool flash;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    highp vec3 ambientLight = vec3(0.4, 0.4, 0.4);

    highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.5);
    if (flash) {
      directionalLightColor = vec3(1.5, 1.5, 1.5);
    }
    highp vec3 directionalVector = normalize(vec3(0.1, 0.6, 0.1));
    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
  `;

  // Fragment shader program

  const fsSource = `
  precision mediump float;
  varying vec2 vTextureCoord;
  varying highp vec3 vLighting;
  uniform sampler2D texture0;

  uniform bool gray;

	vec4 toGrayscale(in vec4 color) {
		float average = (color.r + color.g + color.b) / 3.0;
		return vec4(average, average, average, 1.0);
	}

	vec4 colorize(in vec4 grayscale, in vec4 color) {
		return (grayscale * color);
	}

	float modI(float a,float b) {
		float m=a-floor((a+0.5)/b)*b;
	    return floor(m+0.5);
	}

  void main(void) {
      highp vec4 color0 = texture2D(texture0, vTextureCoord);

      if (gray)
      {
				gl_FragColor = toGrayscale(vec4(color0.rgb * vLighting, color0.a));
			}
			else {
        gl_FragColor = vec4(color0.rgb * vLighting, color0.a);
      }
      //gl_FragColor = color0;
  }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      gray: gl.getUniformLocation(shaderProgram, 'gray'),
      texture0: gl.getUniformLocation(shaderProgram, 'texture0'),
      flash: gl.getUniformLocation(shaderProgram, 'flash'),
    },
  };

  objects = []; // Contains player, ground
  tracks = [];
  walls_left = [];
  walls_right = [];
  coins = [];
  obstacles = [];
  barriers = [];
  boosts = [];


  buffer_objects = [];
  buffer_tracks = [];
  buffer_coins = [];
  buffer_obstacles = [];
  buffer_barriers = [];
  buffer_boosts = [];
  buffer_walls_left = [];
  buffer_walls_right = [];

  objects.push(player(gl));
  objects.push(police(gl));

  objects.push(ground(gl));
  var finish_object = finishline(gl);
  var buffer_finish_object = initBuffers(gl, finish_object);

  for (let i = 3; i < 15; ++i) {
    x = ground(gl);
    x.translate[2] = objects[i - 1].translate[2] - 4.0;
    objects.push(x);
  }

  tracks.push(track(gl, -1.05));
  tracks.push(track(gl, 0.0));
  tracks.push(track(gl, 1.05));

  for (let i = 1; i < 20; ++i) {
    x = track(gl, -1.05);
    x.translate[2] = tracks[3 * i - 1].translate[2] - 2.00;
    tracks.push(x);

    x = track(gl, 0.0);
    x.translate[2] = tracks[3 * i - 1].translate[2] - 2.0;
    tracks.push(x);

    x = track(gl, 1.05);
    x.translate[2] = tracks[3 * i - 1].translate[2] - 2.0;
    tracks.push(x);
  }

  walls_left.push(wall(gl, -15, getRandomFloat(0.2, 0.8), -1));
  for (let i = 1; i < num_walls / 2; ++i) {
    walls_left.push(wall(gl, walls_left[i - 1].initial_z - 14, getRandomFloat(0.2, 0.8), -1));
  }

  walls_right.push(wall(gl, -15, getRandomFloat(0.2, 0.8), 1));
  for (let i = 1; i < num_walls / 2; ++i) {
    walls_right.push(wall(gl, walls_right[i - 1].initial_z - 14, getRandomFloat(0.2, 0.8), 1));
  }


  for (var i = 0; i < objects.length; ++i) {
    buffer_objects.push(initBuffers(gl, objects[i]));
  }

  for (var i = 0; i < tracks.length; ++i) {
    buffer_tracks.push(initBuffers(gl, tracks[i]));
  }

  for (var i = 0; i < walls_left.length; ++i) {
    buffer_walls_left.push(initBuffers(gl, walls_left[i]));
  }

  for (var i = 0; i < walls_right.length; ++i) {
    buffer_walls_right.push(initBuffers(gl, walls_right[i]));
  }

  // Draw the scene repeatedly
  function render(now) {

    now *= 0.001; // convert to seconds
    const deltaTime = now - then;
    then = now;
    if (toggle_1 == 1)
      flash_then = now - flash_time;
    if (statusKeys[70] == true && toggle_1 == 0) {
      flash_time = now;
      toggle_1 = 1;
      flash = true;
    }

    if (statusKeys[66] == true) {
      gray = !gray;
    }

    update_score();
    if (game_over || finish) {
      Game_over();
    }
    const projectionMatrix = clearScene(gl, objects[0].translate);

    var rand = getRandomInt(1, 200);
    if (!game_over && !finish && game_start) {
      if (rand % 13 == 0) {

        let r = getRandomInt(0, 2);
        let track = 0.0;
        if (r == 0) {
          track = -1.05;
        } else if (r == 1) {
          track = 0.0;
        } else if (r == 2) {
          track = 1.05;
        }
        if (coins.length == 0) {
          coins.push(coin(gl, track, -10));
          buffer_coins.push(initBuffers(gl, coins[0]));
        } else if (coins.length < 45) {
          coins.push(coin(gl, track, coins[coins.length - 1].translate[2] - 2));
          buffer_coins.push(initBuffers(gl, coins[coins.length - 1]));
        }
      }

      if (rand % 17 == 0) {

        let x = getRandomInt(0, 2);
        let track = 0.0;
        if (x == 0) {
          track = -1.05;
        } else if (x == 1) {
          track = 0.0;
        } else if (x == 2) {
          track = 1.05;
        }
        if (obstacles.length == 0) {
          obstacles.push(obstacle(gl, track, -10));
          buffer_obstacles.push(initBuffers(gl, obstacles[0]));
        } else if (obstacles.length < 5) {
          obstacles.push(obstacle(gl, track, obstacles[obstacles.length - 1].translate[2] - 50));
          buffer_obstacles.push(initBuffers(gl, obstacles[obstacles.length - 1]));
        }
      }

      if (rand % 19 == 0) {

        let x = getRandomInt(0, 2);
        let track = 0.0;
        if (x == 0) {
          track = -1.05;
        } else if (x == 1) {
          track = 0.0;
        } else if (x == 2) {
          track = 1.05;
        }
        if (barriers.length == 0) {
          barriers.push(barrier(gl, track, -35));
          buffer_barriers.push(initBuffers(gl, barriers[0]));
        } else if (barriers.length < 5) {
          barriers.push(barrier(gl, track, barriers[barriers.length - 1].translate[2] - 7));
          buffer_barriers.push(initBuffers(gl, barriers[barriers.length - 1]));
        }
      }

      if (rand % 23 == 0) {

        let x = getRandomInt(0, 2);
        let track = 0.0;
        if (x == 0) {
          track = -1.05;
        } else if (x == 1) {
          track = 0.0;
        } else if (x == 2) {
          track = 1.05;
        }
        if (boosts.length < 2) {
          boosts.push(boost(gl, track, -35));
          buffer_boosts.push(initBuffers(gl, boosts[boosts.length - 1]));
        }
      }

      wall_tick(gl, walls_left, walls_right);
      obstacle_tick(gl, obstacles, objects[0]);
      barrier_tick(gl, barriers, objects[0], objects[1]);
      coin_tick(gl, coins, objects[0]);
      console.log(objects[0].score);
      player_tick(objects[0], obstacles);
      police_tick(objects[1], objects[0]);
      ground_tick(gl, objects);
      track_tick(gl, tracks);
      boost_tick(gl, boosts, objects[0]);
    }

    if (objects[0].score >= 100) {
      if (!finish && !game_over)
        finishline_tick(finish_object, objects[0]);
      drawScene(gl, programInfo, buffer_finish_object, deltaTime, projectionMatrix, finish_object, finish_object.texture);
    }
    for (let i = 0; i < buffer_objects.length; i++) {
      drawScene(gl, programInfo, buffer_objects[i], deltaTime, projectionMatrix, objects[i], objects[i].texture);
    }

    for (let i = 0; i < buffer_tracks.length; i++) {
      drawScene(gl, programInfo, buffer_tracks[i], deltaTime, projectionMatrix, tracks[i], tracks[i].texture);
    }

    for (let i = 0; i < buffer_walls_left.length; i++) {
      drawScene(gl, programInfo, buffer_walls_left[i], deltaTime, projectionMatrix, walls_left[i], walls_left[i].texture);
    }

    for (let i = 0; i < buffer_walls_right.length; i++) {
      drawScene(gl, programInfo, buffer_walls_right[i], deltaTime, projectionMatrix, walls_right[i], walls_right[i].texture);
    }

    for (let i = 0; i < buffer_coins.length; ++i) {
      drawScene(gl, programInfo, buffer_coins[i], deltaTime, projectionMatrix, coins[i], coins[i].texture);
    }

    for (let i = 0; i < buffer_obstacles.length; ++i) {
      drawScene(gl, programInfo, buffer_obstacles[i], deltaTime, projectionMatrix, obstacles[i], obstacles[i].texture);
    }

    for (let i = 0; i < buffer_barriers.length; ++i) {
      drawScene(gl, programInfo, buffer_barriers[i], deltaTime, projectionMatrix, barriers[i], barriers[i].texture);
    }

    for (let i = 0; i < buffer_boosts.length; ++i) {
      drawScene(gl, programInfo, buffer_boosts[i], deltaTime, projectionMatrix, boosts[i], boosts[i].texture);
    }

    if (toggle_1 == 1 && toggle_2 == 0 && flash_then < 15) {
      toggle_2 = 1;
      setTimeout(function() {
        if (toggle_1 == 1)
          flash = !flash;
        toggle_2 = 0;
      }, 1000);
    }

    if (flash_then >= 8) {
      flash_then = 0;
      flash = false;
      toggle_1 = 0;
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initBuffers(gl, object) {

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.positions), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(object.indices), gl.STATIC_DRAW);

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  const textureCoordinates = object.textureCoordinates;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
    gl.STATIC_DRAW);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  const vertexNormals = object.vertexNormals;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
    gl.STATIC_DRAW);


  return {
    position: positionBuffer,
    normal: normalBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
    type: object.type,
  };
}

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
