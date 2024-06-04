function coin(gl, initial_x, initial_z) {


  const positions = [
    // Front
    -0.1, 0.1, 0.015,
    -0.1, -0.1, 0.015,
    0.1, -0.1, 0.015,
    0.1, 0.1, 0.015,

    //Right
    0.1, -0.1, 0.015,
    0.1, 0.1, 0.015,
    0.1, 0.1, -0.015,
    0.1, -0.1, -0.015,

    //Back
    0.1, 0.1, -0.015,
    0.1, -0.1, -0.015,
    -0.1, -0.1, -0.015,
    -0.1, 0.1, -0.015,

    //Left
    -0.1, -0.1, -0.015,
    -0.1, 0.1, -0.015,
    -0.1, 0.1, 0.015,
    -0.1, -0.1, 0.015,

    //Top
    -0.1, 0.1, 0.015,
    0.1, 0.1, 0.015,
    0.1, 0.1, -0.015,
    -0.1, 0.1, -0.015,

    //Bottom
    -0.1, -0.1, 0.015,
    0.1, -0.1, 0.015,
    0.1, -0.1, -0.015,
    -0.1, -0.1, -0.015,
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

    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Left
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

  ];

  const texture = loadTexture(gl, 'assets/coin.png');

  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0,
    'translate': [initial_x, -0.75, initial_z],
    'type': "coins",
  }


}

function coin_delete(gl, object) {

  var index = coins.indexOf(object);
  var r = getRandomInt(0, 2);

  let track = 0.0;
  if (r == 0) {
    track = -1.05;
  } else if (r == 1) {
    track = 0.0;
  } else if (r == 2) {
    track = 1.05;
  }

  coins[index] = coin(gl, track, -20);
  buffer_coins[index] = initBuffers(gl, coins[index]);

}


function coin_tick(gl, coins, player) {

  // console.log(coins.length);
  for (let i = 0; i < coins.length; ++i) {

    coins[i].translate[2] += speed;
    coins[i].rotation -= 0.1;

    if (player.translate[0] == coins[i].translate[0] && player.translate[2] - 0.15 <= coins[i].translate[2] && player.translate[2] + 0.15 >= coins[i].translate[2] && player.translate[1] == -0.70) {
      player.score +=1;
      coin_delete(gl, coins[i]);
      i--;
    }
    else if (coins[i].translate[2] > 2) {
      coin_delete(gl, coins[i]);
      i--;
    }

  }

}
