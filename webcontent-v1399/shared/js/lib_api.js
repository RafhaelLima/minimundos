/*! SmallWorlds JavaScript API - v0.1.0 - 2013-11-21 */

(function($) {

  // Collection method.
  $.fn.awesome = function() {
    return this.each(function() {
      $(this).html('awesome');
    });
  };

  // Static method.
  $.awesome = function() {
    return 'awesome';
  };

  // Custom selector.
  $.expr[':'].awesome = function(elem) {
    return elem.textContent.indexOf('awesome') >= 0;
  };

  // Create SW API Access Object and attache it to jQuery namespace.
  var sw = {};
  sw._errorsHandlers = [];
  $.sw = sw;
  

  // Core functions.
  // ------------------------------------------------------------


  // Initialization function.
  sw.init = function(config) {
    sw.url = config.url;
	sw.surl = config.surl;
  };

  /**
   * Perform an asynchronous HTTP (Ajax) request to the SmallWorlds API.
   * Rather than passing in callback functions via the ajax settings, a deffered
   * implementation is provided where multiple callback functions can be attached 
   * via the returned responder object.
   *
   * @param settings The jQuery.ajax() settings to use.
   * @return A request object which can be used to attach callback functions.
   * The responder includes has the followng methods:
   * .success(function), .error(function), .complete(function), abort()
   * 
   */
  sw.ajax = function(settings) {

    // Callback context
    var callbackContext = this;

    // Deferred.
    var deferred = $.Deferred();

    // Create error handler.
    var errorHandler = {error: function(data) {

      // Error handling.
      deferred.rejectWith(callbackContext, [data]);
    }};
    

    // Call JQuery getJSON.
    var jqXHR = $.ajax(settings);

    // Create responder.
    var responder = {

      jqXHR: jqXHR,

      // Cancel the request
      abort: function() {
        jqXHR.abort('Cancel');
        return this;
      }
    };

    // Attach deferreds.
    deferred.promise(responder);
    responder.success = responder.done;
    responder.error = responder.fail;
    responder.complete = responder.always;

    // Register global error handlers.
    for (var i = 0; i < sw._errorsHandlers.length; i++) {
      responder.error(sw._errorsHandlers[i]);
    }

    // Use JQuery Ajax request object.
    jqXHR

    // Add ajax success callback. Optional arguments textStatus, jqXHR ignored.
    .success(function(data) {

      // Check for error.
      if (data != null && data.hasOwnProperty('success') && !data.success) {

        // Error handling.
        errorHandler.error(data);
        return;
      }

      // Success.   
      deferred.resolveWith(callbackContext, [data]);
    })

    // Add ajax error callback.
    .error(function(data, textStatus, jqXHR) { 
      errorHandler.error({success:false, errorCode:1, data: data, 
        textStatus: textStatus, jqXHR: jqXHR
      });
    });

    // Return responder to calling code.
    return responder;
  };

  /**
   * GET REST API call.
   */
  sw.get = function(path, secure) {

    if (secure === undefined) { secure = false; }
	
    // Create fully pathed url.
    var url = sw.url + path;
	
	// Create ajax settings.
    var settings = {
      url: url,
      dataType: 'json'
    };

	if(secure === true) {
            settings.url = sw.surl + path;
	}
	
    // Peform get json.
    return sw.ajax(settings);
  };

  /**
   * POST REST API call.
   */
  sw.post = function(path, json, secure) {
  
	if (secure === undefined) { secure = false; }
	
    // Create fully pathed url.
    var url = sw.url + path;

    // Create ajax settings.
    var settings = {
      url: url,
      type: 'post',
      contentType: 'application/json'
    };
	
	if(secure === true) {
		settings.url = sw.surl + path;
	}

    // Include json data.
    if (json != null) {
      settings.data = JSON.stringify(json);
      settings.dataType = 'json';
    }

    // Peform get json.
    return sw.ajax(settings);
  };

  /**
   * Register a handler to be called when any API requests complete with an error.
   */
  sw.error = function(callback) {
    sw._errorsHandlers.push(callback);
  };

  
  // Error Codes.
  // ------------------------------------------------------------
  
  sw.errorCode = {};
  
  sw.errorCode.INTERNAL_ERROR = 1;
  sw.errorCode.SESSION_EXPIRED = 2;
  sw.errorCode.DO_NOT_HAVE_PERMISSION = 5;
  sw.errorCode.INVALID_PARAM = 100;
  sw.errorCode.REGISTER_EMAIL_ALREADY_TAKEN = 200;
  sw.errorCode.LOGIN_EMAIL_NOT_FOUND = 301;
  sw.errorCode.LOGIN_ACCOUNT_NOT_ACTIVE = 302;
  sw.errorCode.LOGIN_INVALID_PASSWORD = 303;
  sw.errorCode.LOGIN_TO_MANY_ATTEMPTS = 304;
  sw.errorCode.LOGIN_ACCOUNT_BANNED = 305;
  sw.errorCode.LOGIN_UNDER_MAINTENANCE = 307;
  sw.errorCode.LOGIN_INVALID_DETAILS = 308;
  sw.errorCode.LOGIN_HAS_AUTHENTICATOR = 309;
  sw.errorCode.LOGIN_EXPIRED_TOKEN = 310;
  sw.errorCode.AVATAR_NOT_FOUND = 600;
  sw.errorCode.USER_NOT_FOUND = 1011;
  sw.errorCode.INTEGRATION_COMMUNICATION_FAILURE = 3105;
  sw.errorCode.MFA_CODE_INCORRECT = 9000;
  sw.errorCode.ZENDESK_RETRY_API_REQUEST = 9400;
  sw.errorCode.ZENDESK_RATE_LIMIT_EXCEEDED = 9429;
  sw.errorCode.ZENDESK_API_ERROR = 9500;
  sw.errorCode.ZENDESK_INVALID_DETAILS = 9399;
  
  
  // Auth.
  // ------------------------------------------------------------

  sw.auth = {};

  /**
   * Login the current user. Must provide username and password in JSON format.
   */
  sw.auth.login = function(login) {

    // Post login data.
    return sw.post('auth/login', login, true);
  };

  /**
   * Logout the current user.
   */
  sw.auth.logout = function() {

    // Post login data.
    return sw.post('auth/logout');
  };
  
  /**
   * Log user into Zendesk.
   */
  sw.auth.zendeskLogin = function(returnTo) {
	  // Log the user into zendesk.
	  return sw.get('support/login?return_to=' + returnTo, true);
  }
  
  
  // Config.
  // ------------------------------------------------------------
  
  // Create config rest service.
  sw.config = {};
  
  /**
   * Get the current user's information.
   */
  sw.config.goal = function() {

    return sw.get('config/goal/header');
  };
  
  
  // User.
  // ------------------------------------------------------------

  // Create user core rest service.
  sw.user = {};

  /**
   * Get the current user's information.
   */
  sw.user.me = function(secure) {
	if (secure === undefined) { secure = false; }
    // Get me.
    return sw.get('user/me', secure);
  };

  /**
   * Check that the specified email is available for joining a new account.
   * Error code 200 if the email is taken by another user.
   */
  sw.user.checkEmailAvailable = function(email) {

    // Get check email available.
    return sw.get('user/signup/emailavailable?email='+email, true);
  };

  /**
   * Get the current user's logged in status (true for logged in, otherwise false).
   */
  sw.user.loggedIn = function(secure) {
	  if (secure === undefined) { secure = false; }

	  // Get logged in.
	  return sw.get('user/loggedin', secure);
  };

  /**
   * Sign up / Register a new user. Must supply a user email and password.
   * Alternatively use signUpSkip() for Facebook and 
   * other social networks.
   */
  sw.user.join = function(joinData) {

    // Post join data.
    return sw.post('user/signup/direct', joinData, true);
  };
  
  /**
   * Check if the users email has been verified or not.
   */
  sw.user.verified = function() {
	  return sw.get('user/verified');
  }
  
  /**
   * Resend the verification email.
   */
  sw.user.verify = function() {
	  return sw.get('user/verify');
  }
  
  /**
   * Validate a users email address.
   */
  sw.user.validate = function(data) {
	  return sw.post('user/verify', data);
  }
  
  
  // Password
  // ---------------------------------------------------------------------------
  
  sw.user.password = {};
  
  /**
   * Send a reset password request to the user.
   */
  sw.user.password.sendResetRequest = function(email) {

    // Post email data.
    return sw.post('user/password/reset/send', email, true);
  };
    
  /**
   * Validate the provided password reset token.
   */
  sw.user.password.validateToken = function(token) {
	  
	  // Send token.
	  return sw.get('user/password/reset/token/validate?token=' + token, true)
  };
  
  /**
   * Validate a user's password change request.
   */
  sw.user.password.validateResetRequest = function(token, email, newPassword) {
	  
	  // Construct POST data object.
	  var postData = { token : token,
			  		   email : email,
			  		   newPassword : newPassword };
	  
	  // Send data.
	  return sw.post('user/password/reset/validate', postData, true)
  };
  
  /**
   * Check to see if the supplied password reset token is valid.
   */
  sw.user.password.changePassword = function(token, email, newPassword) {
	  
	  // Construct POST data object.
	  var postData = { token : token,
			  		   email : email,
			  		   newPassword : newPassword };
	  
	  // Send data.
	  return sw.post('user/password/change', postData, true)
  };
  
  

  // Avatar.
  // ------------------------------------------------------------

  sw.avatar = {};

  /**
   * Get the user's current avatar.
   */
  sw.avatar.getSelected = function() {

    // Get selected avatar.
    return sw.get('avatar/selected');
  };

  /**
   * Get avatar by id. 
   */
  sw.avatar.getAvatarById = function(avatarId) {

    // Get avatar by id.
    return sw.get('avatar/' + avatarId);
  };

  /**
   * Get avatar by name. 
   */
  sw.avatar.getAvatarByName = function(avatarName) {

    // Get avatar by name.
    return sw.get('avatar/name/' + avatarName);
  };

  /**
   * Check available avatar name.
   */
  sw.avatar.checkAvailableName = function(avatar) {

    // Check available avatar name.
    return sw.post('avatar/nameavailable', avatar, (window.location.protocol === 'https:'));
  };

  /**
   * Check available avatar name.
   */
  sw.avatar.findTotalOnline = function() {

    // Check available avatar name.
    return sw.get('avatar/findtotalonline');
  };
  
  /**
   * Update Default Avatar
   */
  sw.avatar.makeDefaultAvatar = function(avatarId) {
	
	// Update Default Avatar
	return sw.get('avatar/makeDefaultAvatar/' + avatarId);
  };
  
   /**
   * Choose Avatar
   */
  sw.avatar.chooseAvatar = function(avatarId) {
	
	// Update Default Avatar
	return sw.get('avatar/chooseAvatar/' + avatarId);
  };
  
   /**
   * Update Avatar's TakePet
   */
  sw.avatar.updateTakePet = function(avatar) {
	
	// Update Avatar's TakePet
	return sw.post('avatar/updateTakePet', avatar);
  };

   /**
   * Create Avatar
   */
  sw.avatar.createAvatar = function(avatar) {
 
	// Create Avatar
	return sw.post('avatar/createAvatar', avatar);
  };

  /**
   * Delete Avatar
   */
  sw.avatar.deleteAvatar = function(avatarId) {
 
	// Delete Avatar
	return sw.post('avatar/deleteAvatar/' + avatarId);
  };

   /**
   * Change Avatar
   */
  sw.avatar.changeAvatar = function(avatar) {
 
	// Change Avatar
	return sw.post('avatar/changeAvatar', avatar);
  };
  
  // Space
  // ------------------------------------------------------------

  sw.space = {};

  /**
   * Retrieve current inworld time.
   */
  sw.space.getSpaceTime = function() {
	return sw.get('space/time');
  }; 
  
  // Space - Event
  // ------------------------------------------------------------

  sw.space.event = {};

  /**
   * Retrieve a random list of the latest space events.
   */
  sw.space.event.getLatestEvents = function() {

    // Get latest space events.
    return sw.get('space/event/latest');
  };

  // Space - Fav
  // ------------------------------------------------------------

  sw.space.fav = {};

  /**
   * Retrieve space favourites for the current avatar.
   */
  sw.space.fav.getMyFavorites = function() {

    // Get fav spaces.
    return sw.get('space/fav/mine');
  };

  // Promotion.
  // ------------------------------------------------------------

  sw.promotion = {};

  // Promotion - Panel.
  // ------------------------------------------------------------

  sw.promotion.panel = {};

  sw.promotion.panel.getPanelsForTag = function(tag) {

    // Get panels for tag.
    return sw.get('promotion/panel/tag/' + tag);
  };

  // Pet.
  // ------------------------------------------------------------
  
  sw.pet = {};
  
  sw.pet.getPetByAvatarId = function(avatarId) {
	
	// Get pet status
	return sw.get('pet/' + avatarId);
  };
  
  // Spin To Win.
  // ------------------------------------------------------------
  
  sw.spintowin = {};
  
  sw.spintowin.check = function() {
	
	// Get Spin to Win status
	return sw.get('spintowin/check');
  };
  
  // Planter.
  // ------------------------------------------------------------
  
  sw.plant = {};
  
  sw.plant.check = function() {
	
	// Get plant status
	return sw.get('plant/check');
  };
  
  // Communication - Filter.
  // ------------------------------------------------------------

  sw.filter = {};
	
  sw.filter.validate = function(value, secure) {
	
	// Run validation.
	return sw.post('filter/validate', value, secure);
  };

  // Facebook.
  // ------------------------------------------------------------
  
  sw.facebook = {};

  /**
   * Log in to SmallWorlds using Facebook credentials.
   */
  sw.facebook.login = function(login) {
	  
    // Post login data.
    return sw.post('facebook/login', login, true);
  };  
  
  /**
   * Register a new SmallWorlds account based on Facebook & avatar details.
   */
  sw.facebook.register = function(register) {

    // Post join data.
    return sw.post('facebook/register', register, true);
  };
  
  // Youtube
  // ------------------------------------------------------------
  
  sw.youtube = {};
  
  /**
   * Retrieve playlist data. 
   */
  sw.youtube.getPlaylist = function(itemId) {
	  
	  // Get playlist data.
	  return sw.get('youtube/playlist?itemId=' + itemId, false);
  }
  
  /**
   * Save playlist data.
   */
  sw.youtube.savePlaylist = function(playlistData) {
	  
	  // Save playlist data.
	  return sw.post('youtube/playlist', playlistData, false);
  }
  
  // Support
  // ------------------------------------------------------------
  
  sw.support = {};
  
  /**
   * Get the FAQs from the help centre.
   */
  sw.support.getFaqs = function() {
	  return sw.get('support/faq');
  }
  
  /**
   * Get the support categories and questions.
   */
  sw.support.getSupport = function() {
	  return sw.get('support/support');
  }
  
  /**
   * Submit an anonymous ticket to zendesk.
   */
  sw.support.submitAnonTicket = function(ticketData) {
	  return sw.post('support/ticket/anon', ticketData);
  }
  
  /**
   * Submit a general support ticket to zendesk.
   */
  sw.support.submitGeneralTicket = function(ticketData) {
	  return sw.post('support/ticket/general', ticketData);
  }
  
  /**
   * Submit a bug related support ticket to zendesk.
   */
  sw.support.submitBugTicket = function(ticketData) {
	  return sw.post('support/ticket/bug', ticketData);
  }
  
  /**
   * Submit a payment related support ticket to zendesk.
   */
  sw.support.submitPaymentTicket = function(ticketData) {
	  return sw.post('support/ticket/payment', ticketData)
  }
 
  // Notification popups.
  // ------------------------------------------------------------
  
  sw.alert = {};
  
  /**
   * Display an info notification.
   */
  sw.alert.showInfo = function(message, timeout) {
	  $("body").prepend('' +
		'<div id="alert" style="position:absolute; top:60px; width:100%; z-index:1000; text-align:center; color:#FFFFFF;">' +
			'<div id="alertInfo" class="alertBox alertInfo">' +
				message +
			'</div>' +
		'</div>');
	  
	  $("#alertInfo").fadeIn();
	  
	  // Allow the info message to not disappear automatically.
	  if (null != timeout && 0 < timeout) {		  
		  setTimeout(function() {
			  $("#alertInfo").fadeOut();
		  }, timeout); 
	  }
  }
  
  /**
   * Display an error notification.
   */
  sw.alert.showError = function(message, timeout) {
	  if (0 < $("#alertInfo").length)
		  $("#alertInfo").fadeOut();
	  
	  $("body").prepend('' +
				'<div style="position:absolute; top:60px; width:100%; z-index:1000; text-align:center; color:#FFFFFF;">' +
					'<div id="alertError" class="alertBox alertError">' +
						message +
					'</div>' +
				'</div>');
	  
	  $("#alertError").fadeIn();	
	  
	  if (null != timeout && 0 < timeout) {	
		  setTimeout(function() {
			  $("#alertError").fadeOut();
		  }, timeout);  
	  }
  }
  
  /**
   * Display a success notification.
   */
  sw.alert.showSuccess = function(message, timeout) {
	  if (0 < $("#alertInfo").length)
		  $("#alertInfo").fadeOut();
	  
	  $("body").prepend('' +
				'<div style="position:absolute; top:60px; width:100%; z-index:1000; text-align:center; color:#FFFFFF;">' +
					'<div id="alertSuccess" class="alertBox alertSuccess">' +
						message +
					'</div>' +
				'</div>');
	  
	  $("#alertSuccess").fadeIn();
	  
	  if (null != timeout && 0 < timeout) {	
		  setTimeout(function() {
			  $("#alertSuccess").fadeOut();
		  }, timeout);
	  }
  }
  
  /**
   * Close any existing notifications.
   */
  sw.alert.closeAll = function() {
	  if (0 < $("#alertInfo").length)
		  $("#alertInfo").fadeOut('fast');	
	  
	  if (0 < $("#alertSuccess").length)
		  $("#alertSuccess").fadeOut('fast');
	  
	  if (0 < $("#alertError").length)
		  $("#alertError").fadeOut('fast');  
  }
  
}(jQuery));
