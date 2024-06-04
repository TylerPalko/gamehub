$(document).ready(function(){
	$("#report-game").on('click', function(event){
		event.preventDefault();
		$('.report-modal').css('display', 'block');
	});
	$(".report-modal-content span.close").on('click', function(){
		$('.report-modal').css('display', 'none');
	});
	$('form#report-form').submit((event)=>{
		event.preventDefault();
		let id = $('#upvote').data('id');
		let arr = $( 'form#report-form' ).serializeArray();
		let data = {
			type: arr[0].value,
			comment: arr[1].value,
			action: 'report',
			id: id,
		}
		$.ajax({
			url: '/content/plugins/game-reports/action.php',
			type: 'POST',
			dataType: 'json',
			data: data,
			complete: function (data) {
				//console.log(data.responseText);
			}
		});
		$('.report-modal').remove();
		alert('Thanks for your report!');
	});
});