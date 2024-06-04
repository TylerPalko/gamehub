"use strict";
var is_fullscreen = false;
function open_fullscreen() {
	let game = document.getElementById("game-area");
	if(is_fullscreen){
		// Exit fullscreen
		is_fullscreen = false;
		if(is_mobile_device()){
			game.style.position = "absolute";
			document.getElementById("mobile-back-button").style.display = "none";
			document.getElementById("game-player").style.display = "none";
		} else {
			if (game.requestFullscreen) {
				game.requestFullscreen();
			} else if (game.mozRequestFullScreen) { /* Firefox */
				game.mozRequestFullScreen();
			} else if (game.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				game.webkitRequestFullscreen();
			} else if (game.msRequestFullscreen) { /* IE/Edge */
				game.msRequestFullscreen();
			}
		}
	} else {
		// Enter fullscreen
		is_fullscreen = true;
		if(is_mobile_device()){
			document.getElementById("game-player").style.display = "block";
			game.style.position = "fixed";
			document.getElementById("mobile-back-button").style.display = "flex";
		} else {
			if (game.requestFullscreen) {
				game.requestFullscreen();
			} else if (game.mozRequestFullScreen) { /* Firefox */
				game.mozRequestFullScreen();
			} else if (game.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
				game.webkitRequestFullscreen();
			} else if (game.msRequestFullscreen) { /* IE/Edge */
				game.msRequestFullscreen();
			}
		}
	}
};
function is_mobile_device(){
	if (navigator.userAgent.match(/Android/i)
	|| navigator.userAgent.match(/webOS/i)
	|| navigator.userAgent.match(/iPhone/i)
	|| navigator.userAgent.match(/iPad/i)
	|| navigator.userAgent.match(/iPod/i)
	|| navigator.userAgent.match(/BlackBerry/i)
	|| navigator.userAgent.match(/Windows Phone/i)) {
		return true;
	} else {
		return false;
	}
}
if($('iframe#game-area').length){
	load_leaderboard({type: 'top', amount: 10});
	drag_back_btn(document.getElementById("mobile-back-button"));
	if(is_mobile_device()){
		if($('#allow_mobile_version').length){
			document.getElementById('mobile-play').style.display = 'block';
			document.getElementById('game-player').style.display = 'none';
		}
	}
}
function drag_back_btn(elem) {
	let is_drag = false;
	let pos_1 = 0, pos_2 = 0;
	let last_y = elem.style.top;
	let touchstart_y = 0;
	elem.addEventListener("touchend", function(e) {
		if(is_drag){
			is_drag = false;
		}
	}, false);
	elem.addEventListener("touchmove", function(e) {
		e.preventDefault();
		let touch = e.changedTouches[0];
		if(!is_drag){
			if(touchstart_y < touch.clientY+5 || touchstart_y > touch.clientY-5){
				// Trigger "dragstart"
				pos_2 = e.clientY;
				is_drag = true;
			}
		}
		if(is_drag){
			pos_1 = pos_2 - touch.clientY;
			pos_2 = touch.clientY;
			elem.style.top = (pos_2) + "px";
		}
	}, false);
	elem.addEventListener("touchstart", function(e) {
		let touch = e.changedTouches[0];
		last_y = elem.style.top;
		touchstart_y = touch.clientY;
	}, false);
	elem.addEventListener("click", function(e) {
		e.preventDefault();
		if(last_y == elem.style.top){
			open_fullscreen();
		}
	}, false);
}
function load_leaderboard(conf){
	if($('#content-leaderboard').length){
		let g_id = $('#content-leaderboard').data('id');
		$.ajax({
			url: '/includes/api.php',
			type: 'POST',
			dataType: 'json',
			data: {'action': 'get_scoreboard', 'game-id': g_id, 'conf': JSON.stringify(conf)},
			complete: function (data) {
				if(data.responseText){
					if(JSON.parse(data.responseText).length){
						show_leaderboard(JSON.parse(data.responseText));
					}
				}
			}
		});
	}
}
function show_leaderboard(data){
	let html = '<table class="table table-striped table-dark"><thead class="thead-dark"><tr><th scope="col">#</th><th scope="col">Username</th><th scope="col">Score</th><th scope="col">Date</th></tr></thead><tbody>';
	let index = 1;
	data.forEach((item)=>{
		html += '<tr><th scope="row">'+index+'</th><td>'+item.username+'</td><td>'+item.score+'</td><td>'+item.created_date.substr(0, 10)+'</td></tr>';
		index++;
	});
	html += '</tbody></table>';
	$('#content-leaderboard').html(html);
}
(function(){
	let last_offset = $("#new-games-section").children().length;
	let load_amount = 12;
	$('#load-more1').click((e)=>{
		e.preventDefault();
		$(this).addClass('disabled');
		fetch_games(load_amount, 'new');
	});
	function fetch_games(amount, sort_by) {
		$.ajax({
			url: "/includes/fetch.php",
			type: 'POST',
			dataType: 'json',
			data: {amount: amount, offset: last_offset, sort_by: sort_by},
			complete: function (data) {
				append_content(JSON.parse(data.responseText));
			}
		});
	}
	function append_content(data){
		last_offset += data.length;
		data.forEach((game)=>{
			let rating = 0;
			game['upvote'] = Number(game['upvote']);
			game['downvote'] = Number(game['downvote']);
			let total_revs = game['upvote']+game['downvote'];
			if(total_revs > 0){
				rating = (Math.round((game['upvote']/(game['upvote']+game['downvote'])) * 5) / 10);
			}
			let html = '<div class="col-md-2 col-sm-3 col-4 grid-1">';
			html += '<a href="/game/'+game['slug']+'/">';
			html += '<div class="game-item">'
			html += '<div class="list-game">';
			html += '<div class="list-thumbnail"><img src="'+game['thumb_2']+'" class="small-thumb img-rounded" alt="'+game['title']+'"></div>';
			html += '<div class="list-info">';
			html += '<div class="list-title">'+game['title']+'</div>';
			html += '</div></div></div></a></div>';
			$("#new-games-section").append(html);
			$("#new-games-section .column:hidden").slice(0, load_amount).slideDown();
		});
		if(data.length < load_amount){
			$("#load-more1").text("No More Games").addClass("noContent disabled");
		} else {
			$("#load-more1").removeClass('disabled');
		}
	}
	$('#mobile-play-btn').on('click', function(e) {
		open_fullscreen();
	});
	$('.b-action #favorite').on('click', function(e) {
		e.preventDefault();
		let data_id = $('.game-content').attr('data-id');
		let btn = $(this);
		$.ajax({
			url: '/includes/vote.php',
			type: 'POST',
			dataType: 'json',
			data: {'favorite': true, 'action': 'favorite', 'id': data_id},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				console.log(data.responseText);
				btn.addClass('active');
				btn.addClass('disabled');
			}
		});
	});
	$('.b-action #upvote').on('click', function(e) {
		e.preventDefault();
		let data_id = $('.game-content').attr('data-id');
		let btn = $(this);
		$.ajax({
			url: '/includes/vote.php',
			type: 'POST',
			dataType: 'json',
			data: {'vote': true, 'action': 'upvote', 'id': data_id},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				console.log(data.responseText);
				btn.addClass('active');
				btn.addClass('disabled');
			}
		});
	});
	$('.b-action #downvote').on('click', function(e) {
		e.preventDefault();
		let data_id = $('.game-content').attr('data-id');
		let btn = $(this);
		$.ajax({
			url: '/includes/vote.php',
			type: 'POST',
			dataType: 'json',
			data: {'vote': true, 'action': 'downvote', 'id': data_id},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				console.log(data.responseText);
				btn.addClass('active');
				btn.addClass('disabled');
			}
		});
	});
	$('.user-avatar').on('click', function(){
		
		let element = $(this).next();
		if (element.is(":hidden")) {
			element.removeClass('hidden');
		} else element.addClass('hidden');
	});
	$('#btn_prev').on('click', function() {
		$('.profile-gamelist ul').animate({
			scrollLeft: '-=150'
		}, 300, 'swing');
	});
	$('#btn_next').on('click', function() {
		$('.profile-gamelist ul').animate({
			scrollLeft: '+=150'
		}, 300, 'swing');
	});
	$('#f_prev').on('click', function() {
		$('.favorite-gamelist ul').animate({
			scrollLeft: '-=150'
		}, 300, 'swing');
	});
	$('#f_next').on('click', function() {
		$('.favorite-gamelist ul').animate({
			scrollLeft: '+=150'
		}, 300, 'swing');
	});
	$('#t-prev').on('click', function() {
		$('.list-1-wrapper').animate({
			scrollLeft: '-=150'
		}, 300, 'swing');
	});
	
	$('#t-next').on('click', function() {
		$('.list-1-wrapper').animate({
			scrollLeft: '+=150'
		}, 300, 'swing');
	});
	$('.delete-comment').on('click', function() {
		let id = $(this).attr('data-id');
		$.ajax({
			url: '/includes/comment.php',
			type: 'POST',
			dataType: 'json',
			data: {'delete': true, 'id': id},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				if(data.responseText === 'deleted'){
					$('.id-'+id).remove();
				}
			}
		}, this);
	});
	let game_id;
	if($('#comments').length){
		game_id = $('.game-content').attr('data-id');
		$.ajax({
			url: '/includes/comment.php',
			type: 'POST',
			dataType: 'json',
			data: {'load': true, 'game_id': game_id},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				let comments = JSON.parse(data.responseText);
				load_comments(convert_comments(comments));
			}
		});
	}
	function convert_comments(array){
		let data = [];
		array.forEach((item)=>{
			let arr = {
				id: Number(item.id),
				created: item.created_date,
				content: item.comment,
				fullname: item.sender_username,
				profile_picture_url: item.avatar,
			};
			if(Number(item.parent_id)){
				arr.parent = Number(item.parent_id);
			}
			if(!arr.fullname){
				arr.fullname = 'Anonymous';
			}
			data.push(arr);
		});
		return data;
	}
	function load_comments(array){
		let read_only = false;
		let avatar = $('.user-avatar img').attr('src');
		if(!avatar){
			avatar = '/images/default_profile.png';
			read_only = true;
		}
		$('#comments').comments({
			enableUpvoting:false,
			roundProfilePictures: true,
			popularText: '',
			profilePictureURL: avatar,
			readOnly: read_only,
			getComments: function(success, error) {
				success(array);
			},
			postComment: function(commentJSON, success, error) {
				commentJSON.source = 'jquery-comments';
				commentJSON.send = true;
				commentJSON.game_id = game_id;
				$.ajax({
					type: 'post',
					url: '/includes/comment.php',
					data: commentJSON,
					success: function(comment) {
						console.log(comment);
						success(commentJSON)
					},
					error: error
				});
			}
		});
	}
})();