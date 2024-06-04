
function ground(gl)
{
  const positions = [
    // Front
    -2.0, 0.05, 2.0,
    -2.0, -0.05, 2.0,
    2.0, -0.05, 2.0,
    2.0, 0.05, 2.0,

    //Right
    2.0, -0.05, 2.0,
    2.0, 0.05, 2.0,
    2.0, 0.05, -2.0,
    2.0, -0.05, -2.0,

    //Back
    2.0, 0.05, -2.0,
    2.0, -0.05, -2.0,
    -2.0, -0.05, -2.0,
    -2.0, 0.05, -2.0,

    //Left
    -2.0, -0.05, -2.0,
    -2.0, 0.05, -2.0,
    -2.0, 0.05, 2.0,
    -2.0, -0.05, 2.0,

    //Top
    -2.0, 0.05, 2.0,
    2.0, 0.05, 2.0,
    2.0, 0.05, -2.0,
    -2.0, 0.05, -2.0,

    //Bottom
    -2.0, -0.05, 2.0,
    2.0, -0.05, 2.0,
    2.0, -0.05, -2.0,
    -2.0, -0.05, -2.0,
  ];


  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0, 1, 2, 0, 2, 3, // front
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
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Right
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,

    // Back
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Left
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Top
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Bottom
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
  ];

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,

    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  const texture = loadTexture(gl, 'assets/ground.png');

  return {
		'indices' : indices,
		'vertexCount' : 36,
		'positions' : positions,
    'vertexNormals' : vertexNormals,
    'textureCoordinates' : textureCoordinates,
    'texture' : texture,
		'rotation'  : 0.00,
		'translate' : [0.0, -1.0, 0],
    'type' : "mono",
	}
}

function ground_delete(gl, index) {

  var dist = 0;

  dist = objects[objects.length - 1].translate[2] - 4.0;
  objects.splice(index, 1);
  buffer_objects.splice(index, 1);

  x = ground(gl);
  x.translate[2] = dist;

  objects.push(x);
  buffer_objects.push(initBuffers(gl, x));
}

function ground_tick(gl, objects){

  for (var i = 2; i < objects.length; ++i) {

    objects[i].translate[2] += speed;

    if (objects[i].translate[2] > 0) {
      ground_delete(gl, i);
      i--;
    }
  }
}
