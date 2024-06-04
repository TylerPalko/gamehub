function player(gl) {
  // Now create an array of positions for the cube.

  const positions = [
    // Front
    -0.15, 0.15, 0.15,
    -0.15, -0.15, 0.15,
    0.15, -0.15, 0.15,
    0.15, 0.15, 0.15,

    //Right
    0.15, -0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, -0.15,
    0.15, -0.15, -0.15,

    //Back
    0.15, 0.15, -0.15,
    0.15, -0.15, -0.15,
    -0.15, -0.15, -0.15,
    -0.15, 0.15, -0.15,

    //Left
    -0.15, -0.15, -0.15,
    -0.15, 0.15, -0.15,
    -0.15, 0.15, 0.15,
    -0.15, -0.15, 0.15,

    //Top
    -0.15, 0.15, 0.15,
    0.15, 0.15, 0.15,
    0.15, 0.15, -0.15,
    -0.15, 0.15, -0.15,

    //Bottom
    -0.15, -0.15, 0.15,
    0.15, -0.15, 0.15,
    0.15, -0.15, -0.15,
    -0.15, -0.15, -0.15,
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
    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

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
    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
  ];

  const textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ];
  const texture = loadTexture(gl, 'assets/player.png');
  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0.00,
    'translate': [0.0, -0.70, -3.15],
    'type': "mono",
    'jump': 0,
    'score': 0,
    'speed_y': 0.1,
    'jumpboost': false,
    'flyboost': false,
    'jumpheight': -0.15,
  }
}


function player_tick(object, obstacles) {

  var p_right = false;
  var p_left = false;
  if (statusKeys[37] || statusKeys[65]) {
    // A or Left Key

    p_left = true;
    p_right = false;
    statusKeys[37] = false;
    statusKeys[65] = false;

  }
  if (statusKeys[39] || statusKeys[68]) {
    // D or Right Key

    p_left = false;
    p_right = true;
    statusKeys[39] = false;
    statusKeys[68] = false;
  }

  if (p_left == true) {
    if (object.translate[0] == 0.0) {
      object.translate[0] = -1.05;
    } else if (object.translate[0] == 1.05) {
      object.translate[0] = 0.0;
    }
  } else if (p_right == true) {
    if (object.translate[0] == 0.0) {
      object.translate[0] = 1.05;
    } else if (object.translate[0] == -1.05) {
      object.translate[0] = 0.0;
    }
  }

  if (statusKeys[32]) {
    // Space bar
    object.jump = 1;
  }

  if (object.jump == 1) {

    object.speed_y -= 0.005;

    if (object.speed_y < 0) {
      object.speed_y = 0.001;
    }
    object.translate[1] += object.speed_y;

    if (object.translate[1] > object.jumpheight){
      object.translate[1] = object.jumpheight;
    }
  }

  for (let i = 0; i < obstacles.length; ++i) {

    if (obstacles[i].translate[0] == object.translate[0] && obstacles[i].translate[2] + 1.55 > -3.15 && obstacles[i].translate[2] - 1.55 < -3.15) {
      if (object.translate[1] < object.jumpheight && object.jump == 1) {
        object.jump = 1;
      } else {
        object.jump = 0;
      }
      break;
    } else if (object.translate[1] == object.jumpheight) {
      object.jump = -1;
    }
  }

  if(object.translate[1] == object.jumpheight && object.flyboost == true){
    object.jump = 0;
  }

  if (object.jump == -1) {
    object.speed_y += 0.008;
    object.translate[1] -= object.speed_y;

    if (object.translate[1] < -0.7) {
      object.translate[1] = -0.7;
      object.jump = 0;
      object.speed_y = 0.1;
    }
  }

}
