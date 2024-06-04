
function barrier(gl, track, z_dist) {

  const positions = [
    // Front
    -0.20, 0.1 , 0.05,
    -0.20, -0.1, 0.05,
    0.20, -0.1, 0.05,
    0.20, 0.1 , 0.05,

    //Right
    0.20, -0.1, 0.05,
    0.20, 0.1 , 0.05,
    0.20, 0.1 , -0.05,
    0.20, -0.1, -0.05,

    //Back
    0.20, 0.1 , -0.05,
    0.20, -0.1, -0.05,
    -0.20, -0.1, -0.05,
    -0.20, 0.1 , -0.05,

    //Left
    -0.20, -0.1, -0.05,
    -0.20, 0.1 , -0.05,
    -0.20, 0.1 , 0.05,
    -0.20, -0.1, 0.05,

    //Top
    -0.20, 0.1 , 0.05,
    0.20, 0.1 , 0.05,
    0.20, 0.1 , -0.05,
    -0.20, 0.1 , -0.05,

    //Bottom
    -0.20, -0.5, 0.05,
    0.20, -0.5, 0.05,
    0.20, -0.5, -0.05,
    -0.20, -0.5, -0.05,
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
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

    // Back
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

    // Top
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

    // Bottom
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

    // Right
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

    // Left
    0.0,  1.0,
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,

  ];

  const texture = loadTexture(gl, './assets/barrier.jpg');

  return {
    'indices': indices,
    'vertexCount': 36,
    'positions': positions,
    'vertexNormals' : vertexNormals,
    'textureCoordinates' : textureCoordinates,
    'texture' : texture,
    'rotation': 0.00,
    'translate': [track , -0.78, z_dist],
    'initial_z': z_dist,
    'type': "barricade",
  }

}

function barrier_delete(gl, object) {

  var index = barriers.indexOf(object);
  var r = getRandomInt(0, 2);

  let track = 0.0;
  if (r == 0)
  {
    track = -1.05;
  }
  else if(r == 1){
    track = 0.0;
  }
  else if(r == 2){
    track = 1.05;
  }

  barriers[index] = barrier(gl, track, -50);
  buffer_barriers[index] = initBuffers(gl, barriers[index]);
}

function barrier_tick(gl, barriers, player, police){

  for(let i = 0; i < barriers.length; ++i){
    barriers[i].translate[2] += speed;

    if (player.translate[0] == barriers[i].translate[0] && !(player.translate[2] - 0.15 >= barriers[i].translate[2] + 0.05 || player.translate[2] + 0.15 <= barriers[i].translate[2] - 0.05) && player.translate[1] == -0.70) {
      speed -= 0.001;

      setTimeout(function() {
        speed = 0.075;
        police.setback = false;
      }, 7000);

      speed_wall -=0.01;
      police.setback = true;
      if(speed < 0.03){
        speed = 0.03;
      }
      if(speed_wall < 0.05){
        speed_wall = 0.05;
      }

    }

    if (barriers[i].translate[2] > 2) {
      barrier_delete(gl, barriers[i]);
    }

  }
}
