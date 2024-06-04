
function finishline(gl) {
  // Now create an array of positions for the cube.

  const positions = [
    // Front
    -2.5, 0.5, 0.1,
    -2.5, -0.5, 0.1,
    2.5, -0.5, 0.1,
    2.5, 0.5, 0.1,

    //Right
    2.5, -0.5, 0.1,
    2.5, 0.5, 0.1,
    2.5, 0.5, -0.1,
    2.5, -0.5, -0.1,

    //Back
    2.5, 0.5, -0.1,
    2.5, -0.5, -0.1,
    -2.5, -0.5, -0.1,
    -2.5, 0.5, -0.1,

    //Left
    -2.5, -0.5, -0.1,
    -2.5, 0.5, -0.1,
    -2.5, 0.5, 0.1,
    -2.5, -0.5, 0.1,

    //Top
    -2.5, 0.5, 0.1,
    2.5, 0.5, 0.1,
    2.5, 0.5, -0.1,
    -2.5, 0.5, -0.1,

    //Bottom
    -2.5, -0.5, 0.1,
    2.5, -0.5, 0.1,
    2.5, -0.5, -0.1,
    -2.5, -0.5, -0.1,
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

  const texture = loadTexture(gl, 'assets/finish.jpg');


  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0,
    'translate': [0, 1.5, -45],
    'type': "finishline",
    'speed_y': 0.1,
  }
}

function finishline_tick(flag, player){

  flag.translate[2] += speed;

  if(!(player.translate[2] - 0.15 >= flag.translate[2] + 0.1 || player.translate[2] + 0.15 <= flag.translate[2] - 0.1)){
    finish = 1;
  }
}
