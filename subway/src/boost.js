function boost(gl, track, z_dist) {
  // Now create an array of positions for the cube.

  const positions = [
    // Front
    -0.1, 0.1, 0.1,
    -0.1, -0.1, 0.1,
    0.1, -0.1, 0.1,
    0.1, 0.1, 0.1,

    //Right
    0.1, -0.1, 0.1,
    0.1, 0.1, 0.1,
    0.1, 0.1, -0.1,
    0.1, -0.1, -0.1,

    //Back
    0.1, 0.1, -0.1,
    0.1, -0.1, -0.1,
    -0.1, -0.1, -0.1,
    -0.1, 0.1, -0.1,

    //Left
    -0.1, -0.1, -0.1,
    -0.1, 0.1, -0.1,
    -0.1, 0.1, 0.1,
    -0.1, -0.1, 0.1,

    //Top
    -0.1, 0.1, 0.1,
    0.1, 0.1, 0.1,
    0.1, 0.1, -0.1,
    -0.1, 0.1, -0.1,

    //Bottom
    -0.1, -0.1, 0.1,
    0.1, -0.1, 0.1,
    0.1, -0.1, -0.1,
    -0.1, -0.1, -0.1,
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

  let s = getRandomInt(0, 1);
  let texture = 0;
  let type = "";

  if (s == 0) {
    texture = loadTexture(gl, './assets/flyboost.jpg');
    type = "fly";
  } else if(s == 1){
    texture = loadTexture(gl, './assets/jumpboost.png');
    type = "jump";
  }


  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals': vertexNormals,
    'textureCoordinates': textureCoordinates,
    'texture': texture,
    'rotation': 0,
    'translate': [track, -0.60, z_dist],
    'type': type,
    'speed_y': 0.1,
  }
}

function boost_delete(gl, object) {

  let dist = -35.0;
  let r = getRandomInt(0, 2);

  let track = 0.0;
  if (r == 0) {
    track = -1.05;
  } else if (r == 1) {
    track = 0.0;
  } else if (r == 2) {
    track = 1.05;
  }

  boosts.shift();
  buffer_boosts.shift();
  boosts.push(boost(gl, track, dist));
  buffer_boosts.push(initBuffers(gl, boosts[boosts.length - 1]));
}


function boost_tick(gl, boosts, player) {

  // console.log(boosts.length);
  for (let i = 0; i < boosts.length; ++i) {

    boosts[i].translate[2] += speed;
    boosts[i].rotation += 0.1;

    if (player.translate[0] == boosts[i].translate[0] && player.translate[2] - 0.15 <= boosts[i].translate[2] && player.translate[2] + 0.15 >= boosts[i].translate[2] && player.translate[1] == -0.70) {

      if (boosts[i].type == "jump") {
        player.jumpheight = 0.05;
        player.jumpboost = true;
        setTimeout(function() {
          player.jumpheight = -0.15;
          player.jumpboost = false;
        }, 5000);
      }
      else if(boosts[i].type == "fly"){

        player.jump = 1;
        player.jumpheight = 0.05;
        player.flyboost = true;

        setTimeout(function() {
          player.jump = -1;
          player.flyboost = false;
        }, 10000);
      }

      boost_delete(gl, boosts[i]);
      i--;
    } else if (boosts[i].translate[2] > 2) {
      boost_delete(gl, boosts[i]);
      i--;
    }

  }

}
