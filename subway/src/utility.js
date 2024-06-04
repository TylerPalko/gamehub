
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function getRandomFloat(min, max) {

    let r = ( (Math.random() * max) + min).toFixed(2);
    // console.log(r);
    return r;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}

function degToRad(d) {
	return d * Math.PI / 180;
}

function updateCameraAngleHorizPlus() {
  cameraAngleDegHoriz++;
}

function updateCameraAngleHorizMinus() {
  cameraAngleDegHoriz--;
}

function updateCameraAngleVertPlus() {
  cameraAngleDegVert++;
}

function updateCameraAngleVertMinus() {
  cameraAngleDegVert--;
}
