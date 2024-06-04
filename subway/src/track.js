

function track(gl, side_x)
{
  const positions = [
    // Front
    -0.30, 0.001, 1.0,
    -0.30, -0.001, 1.0,
    0.30, -0.001, 1.0,
    0.30, 0.001, 1.0,

    //Right
    0.30, -0.001, 1.0,
    0.30, 0.001, 1.0,
    0.30, 0.001, -1.0,
    0.30, -0.001, -1.0,

    //Back
    0.30, 0.001, -1.0,
    0.30, -0.001, -1.0,
    -0.30, -0.001, -1.0,
    -0.30, 0.001, -1.0,

    //Left
    -0.30, -0.001, -1.0,
    -0.30, 0.01, -1.0,
    -0.30, 0.001, 1.0,
    -0.30, -0.001, 1.0,

    //Top
    -0.30, 0.001, 1.0,
    0.30, 0.001, 1.0,
    0.30, 0.001, -1.0,
    -0.30, 0.001, -1.0,

    //Bottom
    -0.30, -0.001, 1.0,
    0.30, -0.001, 1.0,
    0.30, -0.001, -1.0,
    -0.30, -0.001, -1.0,
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

  const texture = loadTexture(gl, 'assets/track.jpeg');

  return {
		'indices' : indices,
		'vertexCount' : 36,
		'positions' : positions,
    'vertexNormals' : vertexNormals,
    'textureCoordinates' : textureCoordinates,
    'texture' : texture,
		'rotation'  : 0.00,
		'translate' : [side_x, -0.9, -3.15],
    'type' : "mono",
	}
}

function track_delete(gl, index) {

  var dist = 0;

  dist = tracks[tracks.length - 1].translate[2] - 2.0;
  tracks.shift();
  tracks.shift();
  tracks.shift();
  buffer_tracks.shift();
  buffer_tracks.shift();
  buffer_tracks.shift();

  x = track(gl, -1.05);
  x.translate[2] = dist;
  tracks.push(x);
  buffer_tracks.push(initBuffers(gl, x));

  x = track(gl, 0.0);
  x.translate[2] = dist;
  tracks.push(x);
  buffer_tracks.push(initBuffers(gl, x));

  x = track(gl, 1.05);
  x.translate[2] = dist;
  tracks.push(x);
  buffer_tracks.push(initBuffers(gl, x));
}

function track_tick(gl, tracks){

  for (var i = 0; i < 20; ++i) {

    tracks[3*i].translate[2] += speed;
    tracks[3*i + 1].translate[2] += speed;
    tracks[3*i + 2].translate[2] += speed;

    if (tracks[3*i].translate[2] > 0) {
      track_delete(gl, i);
      i--;
    }
  }
}
