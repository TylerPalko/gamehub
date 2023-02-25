"use strict";

// NOTE due to some VERY frustrating security requirements when running in a
// WKWebView this file will be loaded with ffmpeg.js appended to the start
if (!self.FFMPEG)
	importScripts("ffmpeg.js");

self.onmessage = function (e)
{
	var data = e.data;
	var file = data.value;
	var id = data.jobID;
	
	function stdout(str)
	{
		send('log', str);
	};
	
	function progress(i)
	{
		send('progress', i);
	};
	
	function send(type, value)
	{
		self.postMessage({
			type: type,
			value: value,
			jobID: id
		});
	}
	
	try {
		var result = FFMPEG(file, progress, stdout);
		send('complete', result);
	} catch (e) {
		send('error', e.toString());
	}
}