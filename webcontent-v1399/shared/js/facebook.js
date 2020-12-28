/* ----------------------------------------------------------------------
 * Filename:			facebook.js
 * Description:			Javascript library file for Facebook integration.
 * Website:				http://www.smallworlds.com
 * Author:				Matt Tatnell
---------------------------------------------------------------------- */

(function($) {

	// Create Facebook API Access Object and attache it to jQuery namespace.
	var facebook = {};
	$.facebook = facebook;
	
	facebook.login = function login(successCallback, errorCallback) {
		
		// SmallWorlds only needs base permissions.
		var permissions = ["email"];
		
		// Call to Facebook to login and authenticate.
		FB.login(function(loginResponse) {
			
			// User logged in and app authorised, call callback.
			if (loginResponse.authResponse) {
				
				// Retrieve details from Facebook.
				var userId = loginResponse.authResponse.userID;
				var shortLivedToken = loginResponse.authResponse.accessToken;
				
				// Error if invalid details were returned.
				if (userId == null || shortLivedToken == null)
					errorCallback();
				
				// Call our server to attempt to log this user in.
				$.sw.facebook.login({userId: userId, shortLivedToken: shortLivedToken})
				
				// Handle success result.
				.success(function(data) {
					
					// If no account exists for FB user, pop up register lightbox.
					if (data.newUser)
						window.top.jQuery.fancybox({
							href: "/register/facebook/?firstName=" + data.firstName + "&aToken=" + data.longLivedToken,
							type: "iframe",
							autoSize : false,
							padding : 0,
							width : 728,
							height : 428
						});
					
					// Call success callback to inform caller.
					successCallback(data.newUser);
				})
				
				// Call error callback on any error.
				.error(function(data) {
					errorCallback(data.errorCode);
				});	
			}
			
			// User failed to login.
			else
				errorCallback();
		},{ 
			// Include specific permissions if requested.
			scope: permissions.join(',') 
		});
	}

}(jQuery));
