// Ajout de la police d'icône.
$('head').append('<link href="//cdn.jsdelivr.net/fontawesome/4.1.0/css/font-awesome.min.css" rel="stylesheet">');

// Chargemement des bibliothèques PeerJS.
Webos.require([
	'/usr/lib/empathy/main.js'
], function() {
	W.xtag.loadUI('/usr/share/templates/komunikado/main.html', function(windows) {
var $win = $(windows);

// Ouverture de la fenêtre
$win.window('open');

// Menu déroullant des contacts et changement de l'icône de la flèche.
$('#k-channel li .boutton').click(function () {
	$(this).parent().children('ul').toggle();
	$(this).children('i').toggleClass('fa-chevron-down').toggleClass('fa-chevron-up');
});

// Définition de la variable PeerJS.
var conn = Empathy.Peerjs.create();

// Définition de la fonction pour obtenir l'heure de l'envoi du message.
var getTime = function () {
	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var time = '['+hour+':'+minute+'] ';
	return time
}

// Définition de la liste des contacts déjà présent dans la liste de contact pour éviter les doublons.
var contactList = [];

// Fonction effectué à la connexion d'un contact.
conn.on({
	// Témoin de connexion dans la console.
    status: function (data) {
        console.log('connection status: '+data.type);
    },
    // Ajout du contact dans la liste si il n'est pas déjà présent dans la liste des contacts.
    contact: function (contactData) {
        if (contactData.username == conn.option('username')) {
        	return;
        }

        if (contactList.indexOf(contactData.username) != -1){
        	return;
    	}

    	// Ajout du contact venant de se connecter dans la liste de contact.
        contactList.push(contactData.username)

        // Modification du voyant témoin de connexion si le contact est en ligne ou hors ligne.
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
    // Fonction qui reçoit les messages du correspondant et les affiches dans l'interface avec l'expéditeur et l'heure et ouvre une nouvelle fenêtre si elle n'est pas encore active à l'écran.
    messagereceived: function (msg) {
    	var conversationWin = $('.chat[data-username="'+msg.from+'"] .conversation');

    	if (conversationWin.length == 0) {
    		var fullname = $('#k-channel li[data-username="'+msg.from+'"]').text()
    		newWindow(msg.from, fullname)
    	} 
        $('.chat[data-username="'+msg.from+'"] .conversation').append('<p><span class="msg-metadata">'+getTime()+' '+msg.from+':</span> '+msg.body+'</p>')
    },
    // Témoin d'appelle dans la console.
    callincoming: function (call) {
        console.log(call);
        console.log('a new call from '+call.from+' is incoming!');

		$.webos.window.confirm({
			title: 'Komunikado avec '+call.remote,
			label: '<em>'+call.remote+'</em> vous appelle. Souhaitez-vous r&eacute;pondre ?',
			confirmLabel: 'R&eacute;pondre',
			cancelLabel: 'Raccrocher',
			confirm: function () {
				conn.answerCall(call.callId);
			},
			cancel: function () {
				conn.endCall(call.callId);
			}
		}).window('open');
    },
    callstart: function (call) {
    	console.log('call', call);
    	var $callWin = $.w.window({
    		title: 'Komunikado avec '+call.remote,
    		width: 680,
    		parentWindow: $win,
    		closeable: false,
    		dialog: true
    	});

    	var $winContent = $callWin.window('content');
    	$winContent.css({
    		'text-align': 'center'
    	});

    	var $audio = $('<video></video>', { src: URL.createObjectURL(call.remoteStream) }).appendTo($winContent);

    	$.w.button('<i class="fa fa-phone" style="color: red; font-size: 7em;"></i>').click(function () {
    		$callWin.window('close');
    		conn.endCall(call.callId);
    	}).appendTo($winContent);

    	$callWin.window('open');

    	$audio[0].play();
    },
    error: function () {
    	console.log(arguments);
    }
});

// Appelle de la fonction connexion du serveur PeerJS.
conn.connect();

// Envoi du message se trouvant dans la zone de texte lors de l'appuis sur la touche entrée.
$('#k-chat').on('keydown', '.chat textarea', function(event) {
	if ( event.which == 13 ) {
		event.preventDefault();
		var msg = $(this).val();
		var to = $(this).parent().data('username');
		if (msg != '') {
			$(this).parent().children('.conversation').append('<p><span class="msg-metadata">'+getTime()+' '+conn.option('username')+':</span> '+msg+'</p>');
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

// Fontion d'ouverture d'une nouvelle fenêtre.
function newWindow(username, fullname){
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
}

// Ouverture d'une nouvelle fenêtre lorsqu'on clique sur le nom d'un contact dans la barre latéral gauche.
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

// Appelle le contact lorsqu'on clique sur l'icône téléphone.
$('#k-chat').on('click', '.fa-phone', function(){
	var username = $(this).parents('.chat').data('username');
	conn.call({
		to: username,
		userMedia: { audio: true, video: false }
	})
})

$('#k-chat').on('click', '.fa-video-camera', function(){
	var username = $(this).parents('.chat').data('username');
	conn.call({
		to: username
	})
})

	});
});

