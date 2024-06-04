/*The keydown event occurs when a keyboard key is pressed down.*/
$(document).keydown(function(event){
	var charCode = event.keyCode;
	var charStr = String.fromCharCode(charCode);
	statusKeys[charCode] = true;
  console.log(charStr,charCode);
});

/* The keyup event occurs when a keyboard key is released. */
$(document).keyup(function(event){

	var charCode = event.keyCode;

	var charStr = String.fromCharCode(charCode);
	statusKeys[charCode] = false;
});
