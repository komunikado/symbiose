/**
 * A registered user.
 * @param {Number} id   The user's ID.
 * @param {Object} data The user's data.
 * @constructor
 * @augments {Webos.Model}
 * @since 1.0alpha1
 */
Webos.User = function (id, data) {
	this._id = parseInt(id, 10);
	Webos.Model.call(this, data);
};
Webos.User.prototype = {
	/**
	 * Get this user's ID.
	 * @returns {Number} The ID.
	 */
	id: function () {
		return this._id;
	},
	/**
	 * Check if this user is disabled.
	 * @returns {Boolean} True if the user is disabled, false otherwise.
	 */
	disabled: function () {
		return (this._get('disabled')) ? true : false;
	},
	/**
	 * Set this user's ID.
	 * A user's ID cannot be modified, this function always returns false.
	 */
	setId: function () {
		return false;
	},
	/**
	 * Check if this user is logged in on this computer.
	 * @returns {Boolean} True if this user is logged in, false otherwise.
	 */
	isLogged: function () {
		if (Webos.User.logged === null) {
			return;
		}
		
		return (this.id() === Webos.User.logged);
	},
	/**
	 * Get this user's authorizations.
	 * @param  {Webos.Callback} callback The callback.
	 */
	getAuthorizations: function (callback) {
		callback = Webos.Callback.toCallback(callback);
		
		if (typeof this._authorizations != 'undefined') {
			callback.success(this._authorizations);
			return;
		}
		
		var that = this;

		return new Webos.ServerCall({
			'class': 'UserController',
			'method': 'getAuthorizations',
			'arguments': {
				'user': this.id()
			}
		}).load(new Webos.Callback(function(response) {
			var data = response.getData();
			var auth = [];
			for (var index in data) {
				auth.push(data[index]);
			}
			that._authorizations = new Webos.Authorizations(auth);
			callback.success(that._authorizations);
		}, callback.error));
	},
	/**
	 * Get this user's authorizations.
	 * @param  {Webos.Callback} callback The callback.
	 * @deprecated
	 */
	authorizations: function (callback) {
		return this.getAuthorizations(callback);
	},
	/**
	 * Get this user's profile picture.
	 * @param  {Webos.Callback} callback
	 * @return {Webos.Operation}
	 */
	getAvatar: function (callback) {
		var op = Webos.Operation.create().addCallbacks(callback);

		if (typeof this._avatar != 'undefined') {
			op.setCompleted(this._avatar);
			return op;
		}

		var that = this;

		new Webos.ServerCall({
			'class': 'UserController',
			'method': 'getAvatar',
			'arguments': {
				'user': this.id()
			}
		}).load([function(resp) {
			var data = resp.getData(),
				avatar = data.avatar;
			
			that._avatar = avatar;

			op.setCompleted(avatar);
		}, function (resp) {
			op.setCompleted(resp);
		}]);

		return op;
	},
	/**
	 * Set this user's profile picture.
	 * @param {String} imgUri The profile picture URI.
	 * @param  {Webos.Callback} callback
	 * @return {Webos.Operation}
	 */
	setAvatar: function (imgUri, callback) {
		var op = Webos.Operation.create().addCallbacks(callback);

		var that = this;

		new Webos.ServerCall({
			'class': 'UserController',
			'method': 'setAvatar',
			'arguments': {
				'imgUri': imgUri,
				'user': this.id()
			}
		}).load([function(resp) {
			that._avatar = imgUri;

			op.setCompleted();
			that.notify('update', { avatar: imgUri });
		}, function (resp) {
			op.setCompleted(resp);
		}]);

		return op;
	},
	/**
	 * Set this user's real name.
	 * @param   {String} value The real name.
	 * @returns {Boolean}      False if there was an error, true otherwise.
	 */
	setRealname: function (value) {
		return this._set('realname', String(value));
	},
	/**
	 * Set this user's username.
	 * @param {String} value The username.
	 * @returns {Boolean} False if there was an error, true otherwise.
	 */
	setUsername: function (value) {
		value = String(value).toLowerCase();
		
		if (!/^[a-z0-9_\-\.]{3,}$/.test(value)) {
			return false;
		}
		
		return this._set('username', String(value));
	},
	/**
	 * Set this user's password.
	 * @param {String}         actualPassword The actual password.
	 * @param {String}         newPassword    The new password.
	 * @param {Webos.Callback} callback       The callback.
	 */
	setPassword: function (actualPassword, newPassword, callback) {
		callback = Webos.Callback.toCallback(callback);
		
		var that = this;
		
		return new Webos.ServerCall({
			'class': 'UserController',
			'method': 'setPassword',
			'arguments': {
				'actualPassword': actualPassword || '',
				'newPassword': newPassword || '',
				'user': this.id()
			}
		}).load(new Webos.Callback(function(response) {
			callback.success();
			that.notify('updatepassword');
		}, function(response) {
			callback.error(response);
		}));
	},
	/**
	 * Set this user's authorizations.
	 * @param {Webos.Authorizations} authorizations Authorizations.
	 * @param {Webos.Callback}       callback       The callback.
	 */
	setAuthorizations: function (authorizations, callback) {
		callback = Webos.Callback.toCallback(callback);

		return new Webos.ServerCall({
			'class': 'UserController',
			'method': 'setAuthorizations',
			'arguments': {
				'authorizations': authorizations.get(),
				'user': this.id()
			}
		}).load(new Webos.Callback(function(response) {
			callback.success();
		}, function(response) {
			callback.error(response);
		}));
	},
	/**
	 * Set this user's email.
	 * @param   {String}  value The email.
	 * @returns {Boolean}       False if there was an error, true otherwise.
	 */
	setEmail: function(value) {
		value = String(value);
		
		if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)) {
			return false;
		}
		
		return this._set('email', value);
	},
	/**
	 * Enable/disable the user.
	 * @param   {Boolean} value True to disable, false to enable.
	 * @returns {Boolean}       False if there was an error, true otherwise.
	 */
	setDisabled: function(value) {
		return this._set('disabled', (value) ? true : false);
	},
	/**
	 * Remove the user.
	 * @param {Webos.Callback} callback The callback.
	 */
	remove: function(callback) {
		callback = Webos.Callback.toCallback(callback);
		
		var that = this;
		
		return new Webos.ServerCall({
			'class': 'UserController',
			'method': 'remove',
			'arguments': {
				'user': this.id()
			}
		}).load(new Webos.Callback(function(response) {
			that.notify('remove');
			delete Webos.User.cache[that.id()];

			if (that.isLogged()) {
				Webos.User.logout(callback);
			}
		}, function(response) {
			callback.error(response);
		}));
	},
	toString: function() {
		return this.get('username');
	},
	sync: function(callback) {
		callback = Webos.Callback.toCallback(callback);
		
		var that = this;
		
		var data = {};
		var nbrChanges = 0;
		for (var key in this._unsynced) {
			if (this._unsynced[key].state === 1) {
				this._unsynced[key].state = 2;
				data[key] = this._unsynced[key].value;
				nbrChanges++;
			}
		}
		
		if (nbrChanges === 0) {
			callback.success(this);
			return;
		}
		
		return new Webos.ServerCall({
			'class': 'UserController',
			method: 'setMultipleAttributes',
			arguments: {
				data: data,
				user: this.id()
			}
		}).load(new Webos.Callback(function() {
			for (var key in that._unsynced) {
				if (that._unsynced[key].state === 2) {
					that._data[key] = that._unsynced[key].value;
					delete that._unsynced[key];
					that.notify('update', { key: key, value: that._data[key].value });
				}
			}
			callback.success(that);
		}, callback.error));
	}
};
Webos.inherit(Webos.User, Webos.Model);

Webos.Observable.build(Webos.User);

/**
 * Cache for users.
 * @var {Object}
 * @static
 * @private
 */
Webos.User.cache = {};

/**
 * Is the user logged ?
 * @var {Boolean}
 * @static
 * @private
 */
Webos.User.logged = null;

/**
 * Get a user.
 * @param {Webos.Callback} callback The callback.
 * @param {Number}         [userId] The user ID. If not provided, this will be set to the currently logged in user.
 */
Webos.User.get = function(callback, userId) {
	callback = Webos.Callback.toCallback(callback);
	
	if (typeof userId == 'undefined') {
		if (typeof Webos.User.logged != 'number' || !Webos.User.cache[Webos.User.logged]) {
			return Webos.User.getLogged([function(user) {
				callback.success(user);
			}, callback.error]);
		} else {
			callback.success(Webos.User.cache[Webos.User.logged]);
			return Webos.Operation.createCompleted(Webos.User.cache[Webos.User.logged]);
		}
	}

	if (typeof Webos.User.cache[userId] != 'undefined') {
		callback.success(Webos.User.cache[userId]);
		return Webos.Operation.createCompleted();
	}

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getAttributes',
		'arguments': {
			'userId': userId
		}
	}).load([function(response) {
		var data = response.getData();
		var user = new Webos.User(data.id, data);
		Webos.User.cache[user.id()] = user;
		callback.success(user);
	}, function(response) {
		callback.error(response);
	}]);
};

/**
 * Get the currently logged in user.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.getLogged = function(callback) {
	callback = Webos.Callback.toCallback(callback);
	
	if (typeof Webos.User.logged == 'number' && Webos.User.cache[Webos.User.logged]) {
		callback.success(Webos.User.cache[Webos.User.logged]);
		return Webos.Operation.createCompleted(Webos.User.cache[Webos.User.logged]);
	}
	
	if (Webos.User.logged === false) {
		callback.success();
		return Webos.Operation.createCompleted();
	}

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getLogged'
	}).load([function(response) {
		var data = response.getData();
		if (typeof data.id != 'undefined') {
			var user = new Webos.User(data.id, data);
			Webos.User.cache[user.id()] = user;
			Webos.User.logged = user.id();
			callback.success(user);
			Webos.User._startPingTimer();
		} else {
			Webos.User.logged = false;
			callback.success();
		}
	}, callback.error]);
};

/**
 * Get a user, given his username.
 * @param {Webos.Callback} callback The callback.
 * @param {String}         [user]   The username.
 */
Webos.User.getByUsername = function(username, callback) {
	callback = Webos.Callback.toCallback(callback);

	for (var id in Webos.User.cache) {
		if (Webos.User.cache[id].get('username') === username) {
			callback.success(Webos.User.cache[id]);
			return Webos.Operation.createCompleted(Webos.User.cache[id]);
		}
	}

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getAttributesByUsername',
		'arguments': {
			'username': username
		}
	}).load(new Webos.Callback(function(response) {
		var data = response.getData();
		var user = new Webos.User(data.id, data);
		Webos.User.cache[user.id()] = user;
		callback.success(user);
	}, function(response) {
		callback.error(response);
	}));
};

/**
 * Login a user.
 * @param {String}         username The username.
 * @param {String}         password The password.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.login = function(username, password, callback) {
	callback = Webos.Callback.toCallback(callback);

	Webos.User.notify('beforelogin');
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'connect',
		'arguments': {
			'username': username,
			'password': password
		}
	}).load(new Webos.Callback(function(response) {
		var data = response.getData();
		var user = new Webos.User(data.id, data);
		Webos.User.cache[user.id()] = user;
		Webos.User.logged = user.id();
		Webos.User.notify('login', { user: user });
		callback.success(user);
	}, callback.error));
};

/**
 * Logout the user.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.logout = function(callback) {
	callback = Webos.Callback.toCallback(callback);

	Webos.User.notify('beforelogout');
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'disconnect'
	}).load(new Webos.Callback(function(response) {
		Webos.User.logged = false;
		Webos.User.notify('logout');
		callback.success();
	}, callback.error));
};

/**
 * The "ping" timer.
 * @var {Number}
 * @private
 */
Webos.User._pingTimer = null;

/**
 * The "ping" interval.
 * @var {Number}
 * @private
 */
Webos.User._pingInterval = 6 * 60 * 1000;

/**
 * Start sending "ping" requests.
 * A "ping" is an empty request sent to the server to keep the user logged in.
 * @private
 */
Webos.User._startPingTimer = function () {
	if (Webos.User._pingTimer === null) {
		Webos.User._pingTimer = setInterval(function() {
			if (typeof Webos.User.logged != 'number') {
				Webos.User._stopPingTimer();
				return;
			}

			var lastCall = Webos.ServerCall.getCompletedCalls().pop(); //On recupere le dernier appel au serveur
			if (lastCall && lastCall._completeTime && new Date().getTime() - lastCall._completeTime.getTime() >= Webos.User._pingInterval - 1) {
				Webos.User.logged = null;
				Webos.User.get([function(user) {
					if (!user) {
						Webos.User.logged = false;
						Webos.User.notify('logout', {});
					}
				}, function() {
					Webos.User.notify('logout', {});
				}]);
			}
		}, Webos.User._pingInterval);
	}
};

/**
 * Stop sending "ping" requests.
 */
Webos.User._stopPingTimer = function() {
	if (Webos.User._pingTimer !== null) {
		clearInterval(Webos.User._pingTimer);
		Webos.User._pingTimer = null;
	}
};

//Listen for "login" and "logout" events to start and stop sending "ping" requests
Webos.User.bind('login', function() {
	Webos.User._startPingTimer();
});
Webos.User.bind('logout', function() {
	Webos.User._stopPingTimer();
});

/**
 * Get a list of all registered users.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.list = function(callback) {
	callback = Webos.Callback.toCallback(callback);
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getList'
	}).load(new Webos.Callback(function(response) {
		var list = response.getData();
		for (var id in list) {
			var user = new Webos.User(id, list[id]);
			if (typeof Webos.User.cache[user.id()] != 'undefined') {
				Webos.User.cache[user.id()].hydrate(list[id]);
				list[id] = Webos.User.cache[user.id()];
			} else {
				Webos.User.cache[user.id()] = user;
				list[id] = user;
			}
		}
		callback.success(list);
	}, callback.error));
};

/**
 * Create a new user.
 * @param {Object} data The user's data.
 * @param {Webos.Authorizations} auth The user's authorizations.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.create = function(data, auth, callback) {
	callback = Webos.Callback.toCallback(callback);
	auth = auth.get();
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'create',
		'arguments': {
			'data': data,
			'authorizations': auth
		}
	}).load(new Webos.Callback(function(response) {
		callback.success();
	}, callback.error));
};

/**
 * Register a new user.
 * Registering a user is not the same as creating a user : everyone can register, if this feature is enabled, but only administrators can create new users.
 * @param {Object} data The user's data.
 * @param {Object} captchaData The captcha data.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.register = function(data, captchaData, callback) {
	callback = Webos.Callback.toCallback(callback);
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'register',
		'arguments': {
			'data': data,
			'captchaData': {
				'id': captchaData.id,
				'value': captchaData.value
			}
		}
	}).load(new Webos.Callback(function(response) {
		callback.success();
	}, callback.error));
};

/**
 * Is the user able to register ?
 * @var {Object}
 * @private
 */
Webos.User._registerSettings = null;

/**
 * Check if registration is enabled.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.canRegister = function(callback) {
	callback = Webos.Callback.toCallback(callback);
	
	if (Webos.User._registerSettings !== null) {
		callback.success(Webos.User._registerSettings);
		return;
	}
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'canRegister'
	}).load([function(response) {
		Webos.User._registerSettings = response.getData();
		callback.success(Webos.User._registerSettings);
	}, callback.error]);
};

/**
 * Is the user able to reset his password ?
 * @var {Object}
 * @private
 */
Webos.User._resetPasswordSettings = null;

/**
 * Check if resetting password by e-mail is enabled.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.canResetPassword = function(callback) {
	callback = Webos.Callback.toCallback(callback);

	if (Webos.User._resetPasswordSettings !== null) {
		callback.success(Webos.User._resetPasswordSettings);
		return;
	}

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'canResetPassword'
	}).load([function(resp) {
		Webos.User._resetPasswordSettings = resp.getData();
		callback.success(Webos.User._resetPasswordSettings);
	}, callback.error]);
};

/**
 * Send a request to reset password by e-mail.
 * @param  {string}   email           The user's e-mail.
 * @param  {Webos.Callback}  callback The callback.
 * @return {Webos.Operation}          The operation.
 */
Webos.User.sendResetPasswordRequest = function (email, callback) {
	callback = Webos.Callback.toCallback(callback);

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'sendResetPasswordRequest',
		'arguments': {
			'email': email,
			'webosUrl': window.location.href
		}
	}).load([function(resp) {
		callback.success();
	}, callback.error]);
};

/**
 * Get a token by e-mail.
 * @param  {string}          email    The e-mail.
 * @param  {Webos.Callback}  callback The callback.
 * @return {Webos.Operation}          The operation.
 */
Webos.User.getTokenByEmail = function (email, callback) {
	callback = Webos.Callback.toCallback(callback);

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getTokenByEmail',
		'arguments': {
			'email': email
		}
	}).load([function(resp) {
		callback.success(resp.getData());
	}, callback.error]);
};

/**
 * Reset the user's password.
 * @param  {number}          tokenId  The token id.
 * @param  {string}          key      The key which was sent to the user by e-mail.
 * @param  {Webos.Callback}  callback The callback.
 * @return {Webos.Operation}          The operation.
 */
Webos.User.resetPassword = function (tokenId, key, newPassword, callback) {
	callback = Webos.Callback.toCallback(callback);

	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'resetPassword',
		'arguments': {
			'tokenId': tokenId,
			'key': key,
			'newPassword': newPassword
		}
	}).load([function(resp) {
		callback.success();
	}, callback.error]);
};

/**
 * Evaluate a password's power.
 * @param {String} s The password.
 * @returns {Number} A number in percentages, indicating the password's power.
 */
Webos.User.evalPasswordPower = function(s) {
	var cmpx = 0;
	
	if (s.length >= 6) {
		cmpx++;
		if (s.search("[A-Z]") != -1) { cmpx++; }
		if (s.search("[0-9]") != -1) { cmpx++; }
		if (s.length >= 8 || s.search("[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]") != -1) {
			cmpx++;
		}
	}
	
	return cmpx * 25;
};

/**
 * Get statistics about users.
 * @param {Webos.Callback} callback The callback.
 */
Webos.User.stats = function(callback) {
	callback = Webos.Callback.toCallback(callback);
	
	return new Webos.ServerCall({
		'class': 'UserController',
		'method': 'getStats'
	}).load([function(response) {
		callback.success(response.getData());
	}, callback.error]);
};
