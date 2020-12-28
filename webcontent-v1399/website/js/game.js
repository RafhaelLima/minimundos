/* ----------------------------------------------------------------------
 * Filename:			game.js
 * Description:			Javascript library file for SmallWorlds game support.
 * Website:				http://www.smallworlds.com
 * Author:				Matt Tatnell
---------------------------------------------------------------------- */

/**
 * Dynamically update the page on load. 
 */
$(document).ready(function() {
	
	// Ensure window name is correctly set for navigation.
	if (window.name != 'swGameTab') window.name = 'swGameTab';
	
	// Snapshot container initial visibility dependant on browser.
	var snapshotContainer = $('#snapshotContainer');
	if (snapshotContainer != null) {
		if (navigator.appName=="Microsoft Internet Explorer")
			snapshotContainer.css('height', '0px');
		else
			snapshotContainer.css('visibility', 'hidden');
	}
});

/** 
 * Inform the game when the window is about to close.
 */
$(window).on('beforeunload', function() {
	var game = $('#Main').get(0);
	if (game != null)
		game.windowClose();
});

/** Extend jQuery to determine whether an element exists. */
$.fn.exists = function () {
    return this.length != 0;
}

// From-SWF Methods
// -------------------------------------------------------------------------

/**
 * Return the path of the current URL.
 * 
 * Only returns if path can be interpreted by the game.
 * home:		A user's homespace.
 * space:		A specific space.
 * settings:	The settings section.
 * 
 * @returns Path portion of the current URL.
 */
function getCurrentPath() {
	var url = document.createElement('a');
	url.href = window.location.href;
	
	// Silly IE doesn't have initial slash on pathname so add if necessary.
	var currentPath = url.pathname;
	if (currentPath.indexOf('home') == 0 ||
			currentPath.indexOf('space') == 0 ||
			currentPath.indexOf('settings') == 0 ||
                        currentPath.indexOf('pet') == 0)
		currentPath = '/' + currentPath;

	// Only return valid paths the client will recognise.
	if (currentPath.indexOf('/home') == 0 || 
			currentPath.indexOf('/space') == 0 ||
			currentPath.indexOf('/settings') == 0 ||
                        currentPath.indexOf('/pet') == 0)
		return currentPath;
	else
		return null;
}

/**
 * Dynamically updates the current page's title.
 * 
 * Also prefix's the title with product name.
 * 
 * @param desc Additional page description.
 * @param prefix Localised title prefix.
 */
function setPageTitle(desc, prefix) {
	if (!desc || desc == '')
		document.title = prefix;
	else
		document.title = prefix + ': ' + desc;
}

/**
 * Unload the game displaying a customised reason in place.
 * 
 * @param reason Description of the reason.
 * @param buttonText Text to display in the reload button.
 */
function unloadGame(reason, buttonText) {
	$('#swfContainer').addClass('unloadedMessage');
	$('#swfContainer').html('<h3>' + reason + '</h3><br/><input type=\"button\" value=\"' + buttonText + '\" onClick=\"window.location.reload()\">');
}

/**
 * Open an HTML widget in an iFramed lightbox.
 * 
 * @param url Full URL to the widget.
 * @param bg Background image to display behind the widget.
 * @param showChat Whether to show the chat panel next to the widget.
 * @param width Custom width for widget.
 * @param height Custom height for widget.
 */
function openHtmlWidget(url, bg, showChat, width, height) {
	
	// Set defaults.
	if (showChat == null)
		showChat = false;
	if (width == null)
		width = 659;
	if (height == null)
		height = 490;
	
	// Add extra width for chat if set.
	if (showChat)
		width += 291;
				
	// Set the blurred snapshot to switch main game to.
	setSnapshot();
	
	// Construct the URL to open.
	var iFrameUrl = '/widget/html/?url=' + encodeURIComponent(url);
	if (bg != null) iFrameUrl += '&bg=' + bg; 
	if (showChat) iFrameUrl += '&showChat=1'; 
	
	// Open lightbox to widget URL.
	$.fancybox.open([{
		href: iFrameUrl,
		type: 'ajax',
		autoSize: false,
		margin: 0,
		width: width,
		minWidth: width,
		height: height,
		minHeight: height,
		padding: 7,
		topOffset: -70,
		topMin: 55,
		openEffect: 'none',
		closeEffect: 'none',
		afterShow: showChat ? updateChatLayout : null,
		onUpdate: showChat ? updateChatLayout : null,
		modal: true
	}]);
	
	if (showChat) {
		
		// Enter chat mode.
		enterChatMode();
	
		// Update the chat layout.
		setTimeout(updateChatLayout, 500);
	}
}

/**
 * Close any currently opened HTML widget.
 */
function closeHtmlWidget() {

	// Exit chat mode.
	exitChatMode();
	
	setTimeout(function() {
		
		// Close any visible youtube widget. 
		var widget = $(".ytWidget:visible"); 
		
		if (widget.length > 0) {
			widget.css('display', 'none');
			widget.css('visibility', 'hidden');
			widget.css('top', 0);
			widget.css('left', 0);
			widget.css('z-index', 'auto');
			onWidgetClose(widget);
		}
	
		// Close the open iFrame lightbox.
		$.fancybox.close();
		
		// Hide the snapshot and show the main client.
		clearSnapshot();
		
		// Inform the game that the widget has closed.
		$('#Main').get(0).arcadeGameClose();
		$('#Main').get(0).htmlWidgetClose();
	}, 500);	
}

/**
 * Close any currently open arcade game and take you back to the lobby.
 * 
 * This is a seperate call as the arcade widget allows you to close the iFrame
 * widget without exiting the open SWF widget.
 */
function closeArcadeGame() {
	
	// Exit chat mode.
	exitChatMode();
	
	setTimeout(function() {
	
		// Close the open iFrame lightbox.
		$.fancybox.close();
		
		// Hide the snapshot and show the main client.
		clearSnapshot();
		
		// Inform the game that the widget has closed.
		$('#Main').get(0).arcadeGameClose();

	}, 200);
}

/** 
 * Set up a youtube widget. 
 */
function setupYouTubeWidget(url, widgetId) {
	setupYtWidget(widgetId);
	getPlaylist(widgetId);
}

function openYouTubeWidget(widgetId) {	
	var width = 659 + 291;
	var height = 490;
	
	setSnapshot();
	
	// Open lightbox to widget URL.
	$.fancybox.open([{
		content: '<div></div>',
		type: 'html',
		autoSize: false,
		margin: 0,
		width: width,
		minWidth: width,
		height: height,
		minHeight: height,
		padding: 7,
		topOffset: -70,
		topMin: 55,
		openEffect: 'none',
		closeEffect: 'none',
		afterShow: updateChatLayout,
		onUpdate: updateChatLayout,
		afterLoad: function() {
			this.inner.append('<div id="chatboxContainer" style="display:block;"></div>');
		},
		modal: true
	}]);
	
	setupCarousel(widgetId);
	currentWidgetId = widgetId;
	
	var widget = $("#ytWidget_" + widgetId);
	var fancybox = $(".fancybox-wrap");

	widget.css('top', fancybox.css('top'));
	widget.css('left', fancybox.css('left'));
	widget.css('z-index', 10001);
	widget.css('display', 'block');
	widget.css('visibility', 'visible');
	
	// Enter chat mode.
	enterChatMode();

	// Update the chat layout.
	setTimeout(updateChatLayout, 500);
}

function removeYoutubeWidget(widgetId) {
	$("#ytWidget_" + widgetId).remove();
}

/** Show header goal banner. */
function showGoalBanner() {
	
	// Banner might not be visible (goal not enabled).
	if (!$('.goal-banner').length)
		return;
	
	// Only show once a week.
	var goalTimestamp = localStorage.getItem('goalTimestamp');
	var oneWeekAgo = new Date().getTime() - (1000 * 60 * 60 * 24 * 7);
	if (!goalTimestamp || goalTimestamp < oneWeekAgo) {
		
		localStorage.setItem('goalTimestamp', new Date().getTime());
	
		$('.goal-banner').css('display', 'block');
		$('#mainContainer').css('top', '85px');
	}
}


// Methods
// -------------------------------------------------------------------------

/** Set the main client in chat mode to the position of the chat container. */
function updateChatLayout() {

	// Get the chat box container.
	var chat = $('#chatboxContainer');
	if (!chat.exists()) 
		return;
	
	// Get the main client container.
	var main = $('#mainContainer');
		
	// Refresh the chat container.
	refreshElement(chat);
			
	// Update the client layout.
	main.css('position', 'absolute');
	main.css('top', chat.offset().top);
	main.css('left', chat.offset().left);
	main.css('width', chat.width());
	main.css('height', chat.height());
	main.css('z-index', 10000);
	main.css('visibility', 'visible');
	
	// Also update the layout of any visible youtube widget.
	var widget = $(".ytWidget:visible"); 
	
	if (widget.length > 0) {
		var fancybox = $(".fancybox-wrap");

		widget.css('top', fancybox.css('top'));
		widget.css('left', fancybox.css('left'));
		widget.css('z-index', 10001);
		widget.css('display', 'block');
		widget.css('visibility', 'visible');
	}
}

/**
 * Force an element to refresh.
 */
function refreshElement(element) {

	// Check that the element exists.
	if (!element.exists())
		return;
		
	// Force the refresh.	
	element[0].style.display='none';
	element[0].offsetHeight;
	element[0].style.display='block';
}

/**
 * Enter chat mode.
 */
function enterChatMode() {

	// Tell the client to enter chat mode.
	$('#Main').get(0).enterChatMode();
}
 
 /**
  * Exit chat mode.
  */
function exitChatMode() {
	
	// Tell the client to exit chat mode.
	$('#Main').get(0).exitChatMode();

	// Get the main client container.
	var main = $('#mainContainer');	
	
	// Restore the main client container to full screen.	
	main.css('position', 'static');
	main.css('z-index', 'auto');
	main.css('top', '0px');
	main.css('left', '0px');
	main.css('width', '100%');
	main.css('height', '100%');
}

/** Hide the main client. */
function hideMain() {

	if (navigator.appName=="Microsoft Internet Explorer")
		$('#mainContainer').css('height', '0px');
	else
		$('#mainContainer').css('visibility', 'hidden');
}

/** Show the main client. */
function showMain() {

	if (navigator.appName=="Microsoft Internet Explorer")
		$('#mainContainer').css('height', '100%');
	else
		$('#mainContainer').css('visibility', 'visible');
}

/** Hide the snapshot SWF. */
function hideSnapshot() {

	if (navigator.appName=="Microsoft Internet Explorer")
		$('#snapshotContainer').css('height', '0px');
	else
		$('#snapshotContainer').css('visibility', 'hidden');
}

/** Show the snapshot SWF. */
function showSnapshot() {

	if (navigator.appName=="Microsoft Internet Explorer")
		$('#snapshotContainer').css('height', '100%');
	else
		$('#snapshotContainer').css('visibility', 'visible');
}

/**
 * Replace the main game with a blurry snapshot image of the current display.
 * 
 * Used when needing to display HTML content above the game.
 */
function setSnapshot() {
	
	// Call to main game to set current display as the snapshot image.
	$('#Main').get(0).setSnapshot();
	
	// Hide game and show snapshot.
	hideMain();
	showSnapshot();
}

/**
 * Remove the current blurry snapshot image and return to the game.
 */
function clearSnapshot() {

	// Hide snapshot and show game.
	showMain();	
	hideSnapshot();
}

/**
 * Inform the game of a successful purchase.
 */
function purchaseComplete() {
	var game = $('#Main').get(0);
	if (game != null)
		game.purchaseComplete();
}

/** 
 * Called from BrandConnect widget to show the BrandConnect window.
 */
function showBrandConnect() {

	// Check that there are ads available to display.
	if (!hasBrandConnectEngagements)
	{
		// Tell the client that there are no ads.
		$('#Main').get(0).brandConnectNoCampaigns();
		return false;
	}

	// Set the blurred snapshot to switch main game to.
	setSnapshot();
	
	// Show the BrandConnect window.
	SSA_CORE.BrandConnect.engage();
	
	// We're seeing ads.
	return true;
}

/**
 * BrandConnect campaign data returned from SupersonicAds.
 * 
 * @param data The campaign data.
 */
function onBrandConnectReady(data) {

	// Check if there are ads available.
	hasBrandConnectEngagements = (typeof data !== 'undefined' && data.length);

	// Tell the client that BrandConnect is ready.
	$('#Main').get(0).brandConnectReady(hasBrandConnectEngagements);
}

/**
 * Called when the user opens the BrandConnect pop-up window.
 * 
 * @param data BrandConnect data.
 */
function onBrandConnectOpen(data) {
	
	// Inform the client.
	$('#Main').get(0).brandConnectOpen();
}

/**
 * Called when the user closes the BrandConnect pop-up window.
 * 
 * @param data BrandConnect data.
 */
function onBrandConnectClose(data) {

	// Clear the blurred snapshot and switch back to the game.
	clearSnapshot();
	
	// Inform the client.
	$('#Main').get(0).brandConnectClose();
}

/**
 * Called when the user has watched an ad. 
 * 
 * @param data BrandConnect data.
 */
function onBrandConnectComplete(data) {
	
	// Inform the client.
	$('#Main').get(0).brandConnectCampaignComplete();
}

/** 
 * Called when the user has watched all available ads.
 * 
 * @param data BrandConnect data. 
 */
function onBrandConnectAllComplete(data) {

	// There are no more ads available.
	hasBrandConnectEngagements = false;
	
	// Inform the client.
	$('#Main').get(0).brandConnectAllCampaignsComplete();
}

/**
 * Call Facebook to authenticate the user and request necessary
 * permissions.
 *
 * Called when the game requires Facebook permissions.
 * 
 * @param flashCallback Game method to call when authentication finishes.
 * @param permissions Permissions to request at login. 
 */
function facebookAuth(flashCallback, permissions) {
	
	// Initialise base permissions if no specific permissions are provided.
	if (permissions == null)
		permissions = ["email"];
		
	// Call to Facebook to authenticate user and request permissions.
	FB.login(function(loginResponse) {
		
		// User authenticated successfully.
		if (loginResponse.authResponse) {
			
			// Retrieve details from Facebook.
			var userId = loginResponse.authResponse.userID;
			var shortLivedToken = loginResponse.authResponse.accessToken;
			
			// Pass Facebook session information back to client.
			$('#Main').get(0)[flashCallback.functionName]({success: true, 
					fbUserId: userId, shortLivedToken: shortLivedToken});
		}
		
		// User authentication failed.
		else
		{
			// Inform client by passing back no session information.
			$('#Main').get(0)[flashCallback.functionName]({success: true, 
					fbUserId: null, shortLivedToken: null});
		}
	},{ 
		// Include specific permissions if requested.
		scope: permissions.join(',') 
	}); 
}

/**
 * Called when game logout with user logged in as Facebook user
 */
function facebookLogout() {
	// Deactivate FB Connect
	setFBConnectActive(false);
	
	// Load front page
	window.location = "/";
}

/**
 * Set fbConnectActive Cookie
 */
function setFBConnectActive(value) {
	if (value) {	
		setCookie('fbConnectActive', 'true', 30);
	} else {
		setCookie('fbConnectActive', 'false', -30);
	}	
}

/**
 * Set Cookie
 */
function setCookie(name, value, expiredays)
{
	var separate = window.location.hostname.split('.');
	separate.shift();
	var currentdomain = separate.join('.');
	var exdate= new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=name+ '=' +escape(value)+
	((expiredays==null) ? '' : ';expires='+exdate.toUTCString())+';path=/;domain='+currentdomain;
}

/**
 * Send GA Tracking Event
 */
function sendGATrackingEvent(category, action)
{
    dataLayer.push({'event': '_trackVirtualview', 'category': category, 'action': action});
}

/** Remove header goal banner. */
function hideGoalBanner() {
	$('.goal-banner').css('display', 'none');
	$('#mainContainer').css('top', '0px');
}
