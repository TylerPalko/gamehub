function obstacle(gl, track, z_dist) {

  const positions = [
    // Front
    -0.20, 0.5, 0.75,
    -0.20, -0.5, 0.75,
    0.20, -0.5, 0.75,
    0.20, 0.5, 0.75,

    //Right
    0.20, -0.5, 0.75,
    0.20, 0.5, 0.75,
    0.20, 0.5, -0.75,
    0.20, -0.5, -0.75,

    //Back
    0.20, 0.5, -0.75,
    0.20, -0.5, -0.75,
    -0.20, -0.5, -0.75,
    -0.20, 0.5, -0.75,

    //Left
    -0.20, -0.5, -0.75,
    -0.20, 0.5, -0.75,
    -0.20, 0.5, 0.75,
    -0.20, -0.5, 0.75,

    //Top
    -0.20, 0.5, 0.75,
    0.20, 0.5, 0.75,
    0.20, 0.5, -0.75,
    -0.20, 0.5, -0.75,

    //Bottom
    -0.20, -0.5, 0.75,
    0.20, -0.5, 0.75,
    0.20, -0.5, -0.75,
    -0.20, -0.5, -0.75,
  ];


  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
    24, 25, 26, 24, 26, 27,
    28, 29, 30, 28, 30, 31,
    32, 33, 34, 32, 34, 35,
  ];

  const vertexNormals = [

    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    // Top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
  ];

  const textureCoordinates = [
    // Front
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Back
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Top
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Right
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Left
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

  ];

  var r = getRandomInt(0, 1);

  var texture = 0;
  if (r == 0) {
    texture = loadTexture(gl, 'assets/train.jpg');
  } else {
    texture = loadTexture(gl, 'assets/container.jpg');
  }
  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0.00,
    'translate': [track, -0.60, z_dist],
    'initial_z': z_dist,
    'type': "obstacle",
  }

}

function obstacle_delete(gl, object) {

  var dist = obstacles[obstacles.length - 1].translate[2] - 50;
  var r = getRandomInt(0, 2);

  let track = 0.0;
  if (r == 0) {
    track = -1.05;
  } else if (r == 1) {
    track = 0.0;
  } else if (r == 2) {
    track = 1.05;
  }

  obstacles.shift();
  buffer_obstacles.shift();
  obstacles.push(obstacle(gl, track, dist));
  buffer_obstacles.push(initBuffers(gl, obstacles[obstacles.length - 1]));
}

function obstacle_tick(gl, obstacles, player) {

  for (let i = 0; i < obstacles.length; ++i) {
    obstacles[i].translate[2] += speed;
    
    if (player.translate[0] == obstacles[i].translate[0] && !(player.translate[2] - 0.15 >= obstacles[i].translate[2] + 0.75 || player.translate[2] + 0.15 <= obstacles[i].translate[2] - 0.75) && player.translate[1] < obstacles[i].translate[1] + 0.5) {
      game_over = true;
      console.log("###GAME OVER###");
    }

    if (obstacles[i].translate[2] > 2) {
      obstacle_delete(gl, obstacles[i]);
    }

  }

}
