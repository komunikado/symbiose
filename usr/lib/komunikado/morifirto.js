$('#k-channel li .boutton').click(function () {
	$(this).parent().children('ul').toggle();
	$(this).children('i').toggleClass('fa-chevron-down').toggleClass('fa-chevron-up');
});



$('.chat textarea').keydown(function(event) {
	if ( event.which == 13 ) {
		event.preventDefault();
		var msg = $(this).val();
		if (msg != '') {
			var date = new Date();
			var hour = date.getHours();
			var minute = date.getMinutes();
			var time = '['+hour+':'+minute+'] ';
			$(this).parent().children('.conversation').append('<p>'+time+msg+'</p>');
			$(this).val('');
			var height = $('.conversation')[0].scrollHeight;
			$('.conversation').scrollTop(height);
		}
	}
})