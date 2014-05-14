Webos.require([
	'/usr/lib/empathy/main.js'
], function() {
	W.xtag.loadUI('/usr/share/templates/komunikado/main.html', function(windows) {
		var $win = $(windows).filter(':eq(0)');

		$win.window('open');

$('head').append('<link href="http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">');
      
$('#k-channel li .boutton').click(function () {
	$(this).parent().children('ul').toggle();
	$(this).children('i').toggleClass('fa-chevron-down').toggleClass('fa-chevron-up');
});

var conn = Empathy.Peerjs.create();

var getTime = function () {
	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var time = '['+hour+':'+minute+'] ';
	return time
}

conn.on({
    status: function (data) {
        console.log('connection status: '+data.type);
    },
    contact: function (contactData) {
        console.log('new contact', contactData.name, contactData.username, contactData.presence);
        console.log(contactData);
        if (contactData.presence == 'online'){
        	status_icon = 'fa fa-circle co'
        }
        else if (contactData.presence == 'away'){
        	status_icon = 'fa fa-circle afk'
        }
        else if (contactData.presence == 'offline'){
        	status_icon = 'fa fa-circle deco'
        }

        $('#friends').children('ul').append('<li data-username="'+contactData.username+'">'+'<i class="'+status_icon+'">'+'</i>'+contactData.name+'<li>')
    },
    messagereceived: function (msg) {
        console.log('received a new message from '+msg.from+': '+msg.body);
        $('.chat textarea').parent().children('.conversation').append('<p>'+getTime()+' '+msg.from+' '+msg.body+'</p>')
    },
    callincoming: function (call) {
        console.log('a new call from '+call.from+' is incoming!');
    }
});
      
conn.connect();

$('.chat textarea').keydown(function(event) {
	if ( event.which == 13 ) {
		event.preventDefault();
		var msg = $(this).val();
		var to = $(this).parent().data('username');
		if (msg != '') {
			$(this).parent().children('.conversation').append('<p>'+getTime()+' '+conn.option('username')+' '+msg+'</p>');
			$(this).val('');
			var height = $('.conversation')[0].scrollHeight;
			$('.conversation').scrollTop(height);
			conn.sendMessage({
	   		 	to: to,
	    		body: msg
			});
		}
	}

$('#k-channel > ul > li > ul > li').click(function () {
	$('#k-chat').append('<div class="chat" data-username="staline">' +
				'<div class="profil">' +
					'<div class="profil-information">' +
						'<p title="Joseph Staline">Joseph Staline<p>' +
						'<p>Russie</p>' +
						'<div class="barre-icone">' +
							'<i class="fa fa-phone ico"></i>' +
							'<i class="fa fa-video-camera ico"></i>' +
							'<i class="fa fa-microphone ico"></i>' +
							'<i class="fa fa-power-off ico"></i>' +
						'</div>' +
					'</div>' +
					'<div class="profil-image">' +
						'<img src="image/staline.jpg"/>' +
					'</div>' +
				'</div>' +
				'<div class="conversation"></div>' +
				'<textarea placeholder="Envoyer un message"></textarea>' +
			'</div>'
		)

})

})
	});
});

