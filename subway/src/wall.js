function wall(gl, z_dist, scale, side) {
  // Now create an array of positions for the cube.

  const positions = [
    // Front
    -5.0, 10.0 * scale, 6.0,
    -5.0, -10.0, 6.0,
    5.0, -10.0, 6.0,
    5.0, 10.0 * scale, 6.0,

    //Right
    5.0, -10.0, 6.0,
    5.0, 10.0 * scale, 6.0,
    5.0, 10.0 * scale, -6.0,
    5.0, -10.0, -6.0,

    //Back
    5.0, 10.0 * scale, -6.0,
    5.0, -10.0, -6.0,
    -5.0, -10.0, -6.0,
    -5.0, 10.0 * scale, -6.0,

    //Left
    -5.0, -10.0, -6.0,
    -5.0, 10.0 * scale, -6.0,
    -5.0, 10.0 * scale, 6.0,
    -5.0, -10.0, 6.0,

    //Top
    -5.0, 10.0 * scale, 6.0,
    5.0, 10.0 * scale, 6.0,
    5.0, 10.0 * scale, -6.0,
    -5.0, 10.0 * scale, -6.0,

    //Bottom
    -5.0, -10.0, 6.0,
    5.0, -10.0, 6.0,
    5.0, -10.0, -6.0,
    -5.0, -10.0, -6.0,
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

  const texture = loadTexture(gl, './assets/wall.jpg');

  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0.00,
    'translate': [13 * side, 0, z_dist],
    'initial_z': z_dist,
    'type': "wall",
    'side': side,
  }
}

function wall_delete(gl, object) {

  var dist = 0;
  var r = getRandomFloat(0.2, 0.8);

  if (object.side == -1) {
    dist = walls_left[walls_left.length - 1].translate[2] - 14;
    walls_left.shift();
    walls_left.push(wall(gl, dist, r, object.side));
    buffer_walls_left.shift();
    buffer_walls_left.push(initBuffers(gl, walls_left[walls_left.length - 1]));
  } else {
    dist = walls_right[walls_right.length - 1].translate[2] - 14;
    walls_right.shift();
    walls_right.push(wall(gl, dist, r, object.side));
    buffer_walls_right.shift();
    buffer_walls_right.push(initBuffers(gl, walls_right[walls_right.length - 1]));
  }
}

function wall_tick(gl, walls_left, walls_right) {

  for (var i = 0; i < walls_left.length; ++i) {

    walls_left[i].translate[2] += speed_wall;

    if (walls_left[i].translate[2] > -4) {
      wall_delete(gl, walls_left[i]);
      i--;
    }
  }

  for (var i = 0; i < walls_right.length; ++i) {

    walls_right[i].translate[2] += speed_wall;

    if (walls_right[i].translate[2] > -4) {
      wall_delete(gl, walls_right[i]);
      i--;
    }
  }
}
