$('head').append('<link href="//cdn.jsdelivr.net/fontawesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">');

Webos.require([
	'/usr/lib/empathy/main.js'
], function() {
	W.xtag.loadUI('/usr/share/templates/komunikado/main.html', function(windows) {
var $win = $(windows);

$win.window('open');

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

var contactList = [];


conn.on({
    status: function (data) {
        console.log('connection status: '+data.type);
    },
    contact: function (contactData) {
        if (contactData.username == conn.option('username')) {
        	return;
        }

        if (contactList.indexOf(contactData.username) != -1){
        	return;
    	}

        contactList.push(contactData.username)

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

        $('#friends').children('ul').append('<li data-username="'+contactData.username+'">'+'<i class="'+status_icon+'">'+'</i>'+(contactData.name || 'anonymous')+'<li>')
    },
    messagereceived: function (msg) {
        console.log('received a new message from '+msg.from+': '+msg.body);
        $('.chat[data-username="'+msg.from+'"] .conversation').append('<p>'+getTime()+' '+msg.from+' '+msg.body+'</p>')
    },
    callincoming: function (call) {
        console.log('a new call from '+call.from+' is incoming!');
    },
    error: function () {
    	console.log(arguments);
    }
});
      
conn.connect();

$('#k-chat').on('keydown', '.chat textarea', function(event) {
	if ( event.which == 13 ) {
		event.preventDefault();
		var msg = $(this).val();
		var to = $(this).parent().data('username');
		if (msg != '') {
			$(this).parent().children('.conversation').append('<p>'+getTime()+' '+conn.option('username')+': '+msg+'</p>');
			$(this).val('');
			var height = $('.conversation')[0].scrollHeight;
			$('.conversation').scrollTop(height);
			console.log('message sent', to, msg);
			conn.sendMessage({
	   		 	to: to,
	    		body: msg
			});
		}
	}
})

$('#k-channel').on('click', 'ul > li > ul > li', function () {
	var username = $(this).data('username'), fullname = $(this).text();

	$('#k-chat').append('<div class="chat" data-username="'+username+'">' +
				'<div class="profil">' +
					'<div class="profil-information">' +
						'<p title="name">'+fullname+'<p>' +
						// '<p>Russie</p>' +
						'<div class="barre-icone">' +
							'<i class="fa fa-phone ico"></i>' +
							'<i class="fa fa-video-camera ico"></i>' +
							'<i class="fa fa-microphone ico"></i>' +
							'<i class="fa fa-power-off ico"></i>' +
						'</div>' +
					'</div>' +
					'<div class="profil-image">' +
						'<img src="usr/share/images/komunikado/staline.jpg"/>' +
					'</div>' +
				'</div>' +
				'<div class="conversation"></div>' +
				'<textarea placeholder="Envoyer un message"></textarea>' +
			'</div>'
		)

})


	});
});

