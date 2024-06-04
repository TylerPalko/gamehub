function police(gl) {
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

    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
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
  const texture = loadTexture(gl, 'assets/police.png');
  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0.00,
    'translate': [0.0, -0.70, -2.15],
    'type': "police",
    'speed_y': 0.1,
    'setback': false,
  }
}


function police_tick(object, player) {

  object.translate[0] = player.translate[0];

  if (object.setback == false) {
    object.translate[2] += 0.005;
  }

  if(object.setback == true){
    object.translate[2] -= 0.005;

    if (player.translate[0] == object.translate[0] && !(player.translate[2] - 0.15 >= object.translate[2] + 0.15 || player.translate[2] + 0.15 <= object.translate[2] - 0.15)) {
      game_over = true;
      console.log("###GAME OVER###");
    }
  }
}
