
// Which widget is currently being used.
var currentWidgetId = null;

// Store localisations for js generated html.
var youtubeLocale = new Object();

// Store config settings for each widget.
var playlistConfig = new Object();

// Store playlist data for each widget.
var playlist = new Object();

// Store the youtube id for the currently playing video for each widget.
var currentlyPlayingId = new Object();

// Store the currently active video index for the playlist view for each widget.
var activeVideoIndex = new Object();

// Store if a video is currently playing for each widget.
var videoPlaying = new Object();

// Store the youtube id of a video to auto play once the player is ready for each widget.
var autoPlayWhenReady = new Object();

// Store if the carousel has been set up or not for each widget.
var carouselSetup = new Object();

/**
 * YouTube api related functions.
 */
var tag;
var firstScriptTag;
var player = new Object();
var apiReady = false;

// Load the IFrame Player API code asynchronously.
function loadYTApi() {
	if (apiReady)
		return;
	
	tag = document.createElement('script');
	
	tag.src = "https://www.youtube.com/iframe_api";
	firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// Create an <iframe> (and YouTube player) after the API code downloads.
function onYouTubeIframeAPIReady() {
	apiReady = true;
}

// Create the youtube player object for a widget.
function createYtPlayer(widgetId) {
	
	if (!apiReady) {
		// Keep recursively checking to see if the api is ready.
		setTimeout(function() {
			createYtPlayer(widgetId);
		}, 1000);
		return;
	}
	
	player[widgetId] = new YT.Player('ytPlayer_' + widgetId, {
		height: '420',
		width: '640',
    //	videoId: 'M7lc1UVf-VE',
//         	playerVars: {
//             	controls: 0
//         	},
		events: {
			'onError': onPlayerError,
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
	
	// Store widget id on the player for reference in player events.
	player[widgetId].widgetId = widgetId;
}

// Handle player error events.
function onPlayerError(event) {
	console.error(event);
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	player[event.target.widgetId].ready = true;
	
	if (null != autoPlayWhenReady[event.target.widgetId]) {
		playVideo(autoPlayWhenReady[event.target.widgetId], event.target.widgetId);
	}
}

// Handle player state changes.
function onPlayerStateChange(event) {
	
	// If playback has ended, play the next video in the playlist.
	if (YT.PlayerState.ENDED == event.data) {
		playNextVideo(event.target.widgetId);
	}
}

// Change the volume.
function updateVolume(widgetId, volume) {
	
	// Adjust volume for a specific widget.
	if (null != widgetId) {
		player[widgetId].setVolume(volume);
	} else {
		// Adjust volume for all widgets.
		for (var play in player) {
			player[play].setVolume(volume);
		}
	}
}

// Toggle mute.
function toggleMute(widgetId, mute) {
	
	if (null != widgetId) {
		if (mute) 
			player[widgetId].mute(); 
		else
			player[widgetId].unMute();
	} else {
		for (var i = 0; i < player.length; ++i)
			if (mute)
				player[i].mute(); 
			else
				player[i].unMute();
	}
		
}

// When the widget is closed.
function onWidgetClose(widget) {
	var widgetId = widget.data("widgetid");
	
	if (null != playlistConfig[widgetId] && !playlistConfig[widgetId].projectSound)
		player[widgetId].pauseVideo();
}

/**
 * Helper functions.
 */

// Get the jquery object for the current youtube widget.
function getYoutubeDiv(widgetId) {
	if (null == widgetId)
		widgetId = currentWidgetId;
	
	return $("#ytWidget_" + widgetId);
}

//Toggle the currently playing video, if there is one.
function toggleVideo(widgetId) {
	var widget = getYoutubeDiv(widgetId);
 	widget.find("#ytPlaylist").hide();
 	widget.find("#ytVideo").show();
 	widget.find("#ytSearch").hide();
}

//Toggle the search youtube section.
function toggleSearch(widgetId) {
	var widget = getYoutubeDiv(widgetId);
 	widget.find("#ytPlaylist").hide();
 	widget.find("#ytVideo").hide();
 	widget.find("#ytSearch").show();
}

//Toggle the playlist section.
function togglePlaylist(widgetId) {
	var widget = getYoutubeDiv(widgetId);
 	widget.find("#ytPlaylist").show();
 	widget.find("#ytVideo").hide();
 	widget.find("#ytSearch").hide();
}

// Config has been updated on the flash side, update on this side.
function configUpdated(widgetId) {
	getPlaylist(widgetId);
}

// Video added by someone else. This function is called by Flash.
function addVideoFromFlash(widgetId, id, title, description, thumbnailUrl) {
	
	// Save the current widget id.
	var currWidget = currentWidgetId;
	currentWidgetId = widgetId;
	
	// Add video to the playlist.
	var currentWidget = $("#ytWidget_" + widgetId);
	addToPlaylist(id, title, thumbnailUrl, description);
	
	// Restore the current widget.
	currentWidgetId = currWidget;
}

// Video removed by someone else. This function is called by Flash.
function removeVideoFromFlash(widgetId, id) {
	
	// Save the current widget id.
	var currWidget = currentWidgetId;
	currentWidgetId = widgetId;
	
	// Remove video from the playlist.
	removeFromPlaylist(id);
	
	// Restore the current widget.
	currentWidgetId = currWidget;	
}

/**
 * Playlist functions.
 */

//Set up the playlist carousel.
function setupCarousel(widgetId) {
	
	var widget = getYoutubeDiv(widgetId);
	
	if (carouselSetup[widgetId])
		return;
	
	var ytCarousel = widget.find('#youtubeCarousel_' + widgetId);
	
	if (null == ytCarousel || 0 >= ytCarousel.length) 
		return;

	// avatar carousel
	ytCarousel.carousel({
		interval: false
	});

	ytCarousel.bind('slide', function(e) {
		// take care of video index
		if (e.direction == "left" && null != playlist[widgetId]) {
			if (activeVideoIndex[widgetId] < (playlist[widgetId].length - 1)) {
				activeVideoIndex[widgetId] += 1;
			}
			else {
				activeVideoIndex[widgetId] = 0;
			}
		}
		else if (null != playlist[widgetId]) {
			if (activeVideoIndex[widgetId] > 0) {
				activeVideoIndex[widgetId] -= 1;
			}
			else {
				activeVideoIndex[widgetId] = playlist[widgetId].length - 1;
			}
		}

		widget.find('span#currentVideo').html(activeVideoIndex[widgetId] + 1);
				
		return true;	
	});
	
	carouselSetup[widgetId] = true;
}

// Get the playlist for a widget from the server.
function getPlaylist(widgetId) {
	var widget = $("#ytWidget_" + widgetId);
	
	// Set default values.
	currentlyPlayingId[widgetId] = null;
	activeVideoIndex[widgetId] = 0;
	videoPlaying[widgetId] = false;
	autoPlayWhenReady[widgetId] = null;
	carouselSetup[widgetId] = false;
		
	// Fetch any existing playlist data.
	$.sw.youtube.getPlaylist(widgetId)
		.success(function(playlistData) {
			
			playlist[widgetId] = playlistData.playlist;
			
			// Store config.
			playlistConfig[widgetId] = {};
			playlistConfig[widgetId].allowedChange = playlistData.allowedChange;
			playlistConfig[widgetId].allowedControl = playlistData.allowedControl;
			playlistConfig[widgetId].autoPlay = playlistData.autoPlay;
			playlistConfig[widgetId].bitmapId = playlistData.bitmapId;
			playlistConfig[widgetId].projectSound = playlistData.projectSound;
			playlistConfig[widgetId].shuffle = playlistData.shuffle;
			
			// Global setting for this user.
			playlistConfig.canStreamMedia = playlistData.canStreamMedia;
			
			if (!playlistConfig[widgetId].allowedChange) {
				var savePlaylist = widget.find("div#savePlaylist"); 
				savePlaylist.hide();
				savePlaylist.empty();
			}

			// No items? Don't do anything.
			if (0 >= playlist[widgetId].length) {
				widget.find("#youtubeCarousel_" + widgetId).hide();
				widget.find("#pageCounter").hide();
				widget.find("#playlistHeader").hide();
				widget.find("#playlistEmpty").show();
				return;
			}
			
			widget.find("#navPlaylist").html(youtubeLocale.playlist + " (" + playlist[widgetId].length + ")");
			
			// Empty out the currently rendered playlist.
			widget.find('#youtubeCarousel_' + widgetId).find('.carousel-inner').empty();
	
			// Add data to playlist[widgetId].
			for (var i = 0; i < playlist[widgetId].length; ++i) 
			{
				var active = "";
				if (i == activeVideoIndex[widgetId])
					active = "active";
				
				renderPlaylistItem(widgetId, playlist[widgetId][i].ytId, playlist[widgetId][i].title, playlist[widgetId][i].thumbnailUrl, active);
	
				if (playlist[widgetId][i].autoPlay && playlistConfig[widgetId].autoPlay && playlistConfig[widgetId].projectSound && !videoPlaying[widgetId]) {
					// Set this video to start playing once the player is ready.
					if (undefined != player[widgetId] && !player[widgetId].ready || undefined == player[widgetId])
						autoPlayWhenReady[widgetId] = playlist[widgetId][i].ytId;
					else
						playVideo(playlist[widgetId][i].ytId);
					activeVideoIndex[widgetId] = i;
				}
			}
	
			widget.find("span#currentVideo").html(activeVideoIndex[widgetId] + 1);
			widget.find("span#totalVideos").html(playlist[widgetId].length);
			widget.find("#youtubeCarousel_" + widgetId).show();
			
			return playlist[widgetId];
		})
		.error(function() {
			console.error('error getting playlist');
			widget.find("#youtubeCarousel_" + widgetId).hide();
		});
}

// Render a playlist item to the carousel for that widget.
function renderPlaylistItem(widgetId, ytId, title, thumbnail, active) {
	var removeBtn = '<div style="position:absolute; top:20px; right:150px;"><a href="javascript:removeFromPlaylist(\'' + ytId + '\');"' + 
	' title="' + youtubeLocale.removeFromPlaylist + '"><img src="' + youtubeLocale.contentPath + 'cross.png"/></a></div>';
	
	if (!playlistConfig[widgetId].allowedChange)
		removeBtn = '';
	
	getYoutubeDiv(widgetId).find('#youtubeCarousel_' + widgetId + ' div.carousel-inner').append(
				'<div class="item ' + active + '" id=' + ytId + ' style="cursor:pointer;">' +
					'<div style="position:relative;">' +
						'<img style="width:320px; height:210px; display:block; margin:auto;" src="' + thumbnail + '" onclick="playVideo(\'' + ytId + '\');" />' +
						removeBtn +
					'</div>' +
					'<div style="text-align:center; padding-top:5px;">' + title + '</div>' + 
				'</div>');
}

// Add a video to the playlist.
function addToPlaylist(ytId, title, thumbnail, description) {
	
	// First check that the video doesn't already exist in the playlist.
	for (var i = 0; i < playlist[currentWidgetId].length; ++i) {
		if (playlist[currentWidgetId][i].ytId == ytId) {
			return;
		}
	}	
	
	var currentWidget = getYoutubeDiv();
	playlist[currentWidgetId].push({ytId: ytId, title: title, thumbnailUrl: thumbnail, description: description, autoPlay: false, duration: 0});
	currentWidget.find("span#totalVideos").html(playlist[currentWidgetId].length);
	currentWidget.find("#navPlaylist").html(youtubeLocale.playlist + " (" + playlist[currentWidgetId].length + ")");
	
	renderPlaylistItem(currentWidgetId, ytId, title, thumbnail, false);
	
	// If this is the first video being added, toggle what is/isn't visible.
	if (1 == playlist[currentWidgetId].length) {
		currentWidget.find("div#youtubeCarousel_" + currentWidgetId).show();
		currentWidget.find("div#pageCounter").show();
		currentWidget.find("div#playlistHeader").show();
		currentWidget.find("div#playlistEmpty").hide();
		$("#" + ytId).addClass('active');
	}
	
	$("#add_" + ytId).hide();
	
//	var msg = currentWidget.find("#ytSearchMessage");
//	msg.html('added to playlist');
//	msg.show();
//	
//	setTimeout(function() {
//		msg.hide();
//		msg.html('');
//	}, 4500);
	
	$('#Main').get(0).ytItemAdded(currentWidgetId, ytId, title, thumbnail, description);
}

// Remove a video from the playlist.
function removeFromPlaylist(ytId) {	
	var indexToRemove = -1;
	
	// Find the video in the playlist.
	for (var i = 0; i < playlist[currentWidgetId].length; ++i) {
		if (ytId == playlist[currentWidgetId][i].ytId) {
			indexToRemove = i;
			break;
		}
	}
	
	// If the video was found, remove it from the playlist.
	if (-1 < indexToRemove) {		
		var removedItem = playlist[currentWidgetId].splice(indexToRemove, 1);
		
		$("#add_" + ytId).show();

		// Let flash know this item has been removed.
		$('#Main').get(0).ytItemRemoved(currentWidgetId, removedItem[0].ytId);		
		var widget = getYoutubeDiv();
		
		// No more items left in the playlist.
		if (0 >= playlist[currentWidgetId].length) {
			widget.find("div#youtubeCarousel_" + currentWidgetId).hide();
			widget.find("div#pageCounter").hide();
			widget.find("div#playlistHeader").hide();
			widget.find("div#playlistEmpty").show();
			
			widget.find("#navPlaylist").html("Playlist");
			return;
		}
		
		// Item removed was the last item in the playlist.
		if (activeVideoIndex[currentWidgetId] >= playlist[currentWidgetId].length)
			--activeVideoIndex[currentWidgetId];
		
		// Update display.
		widget.find("span#totalVideos").html(playlist[currentWidgetId].length);
		widget.find('span#currentVideo').html(activeVideoIndex[currentWidgetId] + 1);
		widget.find("#navPlaylist").html(youtubeLocale.playlist + " (" + playlist[currentWidgetId].length + ")");
		
		$("#" + playlist[currentWidgetId][activeVideoIndex[currentWidgetId]].ytId).addClass('active');
		$("#" + ytId).remove();
	}
}

// Save the playlist to the server.
function savePlaylist() {
	var playlistData = {
			itemId: currentWidgetId,
			playlist: playlist[currentWidgetId]
	}
	
	$.sw.youtube.savePlaylist(playlistData)
		.success(function (data) {
			
			$('#Main').get(0).ytPlaylistSaved(currentWidgetId, data.configXml);
		})
		.error(function (data) {
			console.error(data.data);
			$('#Main').get(0).ytPlaylistSaved(currentWidgetId, null, data.data);
		});
}

function pauseVideo(widgetId) {
	
	if (widgetId == null)
		widgetId = currentWidgetId;
	
	videoPlaying[widgetId] = false;
	
	player[widgetId].pauseVideo();
	currentlyPlayingId[widgetId] = null;
}

/**
 * Video playing functions.
 */
// Play the specified video in the specified widget.
function playVideo(ytId, widgetId) {
	
	if (!playlistConfig.canStreamMedia)
		return;

	if (null == widgetId)
		widgetId = currentWidgetId;
	
	videoPlaying[widgetId] = true;
	getYoutubeDiv(widgetId).find("#navVideo").show();
	
	player[widgetId].loadVideoById(ytId);
	toggleVideo(widgetId);
	currentlyPlayingId[widgetId] = ytId;
}

// Play the next video in the widgets playlist.
function playNextVideo(widgetId) {
	
	if (null == widgetId)
		widgetId = currentWidgetId;
	
	if (playlistConfig[widgetId].shuffle) {
		var nextVideo = Math.floor(Math.random() * playlist[widgetId].length);
		
		// Don't play the same video twice in a row.
		if (nextVideo == activeVideoIndex[widgetId])
			++activeVideoIndex[widgetId];
		else
			activeVideoIndex[widgetId] = nextVideo;
	} else {
		++activeVideoIndex[widgetId];
	}

	if (playlist[widgetId].length <= activeVideoIndex[widgetId])
		activeVideoIndex[widgetId] = 0; 
	
	// Play the next video.
	var previous = currentlyPlayingId[widgetId];
	playVideo(playlist[widgetId][activeVideoIndex[widgetId]].ytId, widgetId);
	
	// Change the carousel items so the new currently playing video is displayed.
	// currentlyPlayingId gets updated in playVideo();
	$("#" + previous).removeClass('active');
	$("#" + currentlyPlayingId[widgetId]).addClass('active');
	getYoutubeDiv(widgetId).find('span#currentVideo').html(activeVideoIndex[widgetId] + 1);
}

// Play the previous video in the widgets playlist.
function playPreviousVideo(widgetId) {
	
	if (null == widgetId)
		widgetId = currentWidgetId;
	
	if (playlistConfig[widgetId].shuffle) {
		var nextVideo = Math.floor(Math.random() * playlist[widgetId].length);
		
		// Don't play the same video twice in a row.
		if (nextVideo == activeVideoIndex[widgetId])
			--activeVideoIndex[widgetId];
		else
			activeVideoIndex[widgetId] = nextVideo;		
	}
	else {
		--activeVideoIndex[widgetId];
	}
	
	if (0 > activeVideoIndex[widgetId])
		activeVideoIndex[widgetId] = playlist.length - 1;
	
	var previous = currentlyPlayingId[widgetId];
	playVideo(playlist[widgetId][activeVideoIndex[widgetId]].ytId);
	
	$("#" + previous).removeClass('active');
	$("#" + currentlyPlayingId[widgetId]).addClass('active');
	getYoutubeDiv(widgetId).find('span#currentVideo').html(activeVideoIndex[widgetId] + 1);
}

/**
 * Search functions.
 */
var searchResults;
var currentPage = 0;
var pageLength = 12;
var maxResults = 48;

// Detect enter keypress in search text input and do search.
function onSearchTextEnter(event) {
	if (13 == event.keyCode) {
		var widget = getYoutubeDiv();
		widget.find("#ytSearchBtn").click();
		widget.find("#ytSearchText").blur();
	}
}

// Display a search error message.
function showSearchError(message) {
	var errorDisplay = getYoutubeDiv().find("#ytSearchError");
	errorDisplay.html(message);
	errorDisplay.show();
}

// Hide and clear the search error message display.
function hideSearchError() {
	var errorDisplay = getYoutubeDiv().find("#ytSearchError");
	errorDisplay.hide();
	errorDisplay.html('');
}

// Send a search query to youtube.
function searchYoutube() {	
	hideSearchError();
	
	// Build search query url.
	var query = getYoutubeDiv().find("#ytSearchText").val();

	var searchUrl = "https://www.googleapis.com/youtube/v3/search?q=" + query + 
							"&part=snippet&type=video&maxResults=" + maxResults + 
							"&order=relevance&safeSearch=strict&key=AIzaSyCc1I2St8WLAgbW2gM7GPzfcCBG6HEBm44";

    var settings = {
      url: searchUrl,
      dataType: 'json'
    };

    // Execute search query.
	$.sw.ajax(settings)
		.success(function(data) {
			//console.info(data);
			searchResults = data.items;

			renderSearchResults();			
		})
		.error(function(data) {
			showSearchError($.parseJSON(data.data.responseText).error.message);
		});
}

// Render the search results on the page.
function renderSearchResults() {

	var widget = getYoutubeDiv();
	var searchResultsDiv = widget.find('#ytSearchResults');
	var pagingDiv = widget.find('#ytSearchResultsPaging'); 
	
	// Hide paging if neccessary.
	if (pageLength >= searchResults.length) 
		pagingDiv.hide();
	else 
		pagingDiv.show();

	// Clear results from the previous search.
	searchResultsDiv.empty();
	
	// Display the search results.
	var length = pageLength;

	if (searchResults.length < pageLength)
		length = searchResults.length;
	
	for (var i = 0; i < length; ++i) {
		var item = searchResults[currentPage * pageLength + i];

		renderSearchResultItem(searchResultsDiv, item.id.videoId, item.snippet.title, item.snippet.description, item.snippet.thumbnails.default.url);
		
		// Force a new row.
		if (0 == (i + 1) % 4)
			searchResultsDiv.append('<div class="clearfix"></div>');
	}
}

// Display a search result item.
function renderSearchResultItem(appendTo, ytId, title, description, thumbnail) {
	// Escaping double and single quotes so they don't interfere with html.
	var escapedTitle = title.replace(/"/g, "&quot;").replace(/'/g, "&rsquo;");
	var escapedDesc = description.replace(/"/g, "&quot;").replace(/'/g, "&rsquo;");
	thumbnail = thumbnail.replace("https", "http");
	
	var addBtn = '<div style="position:absolute; bottom:5px; right:20px; width:16px; height:16px;"><a id="add_' + ytId + '" href="javascript:addToPlaylist(\'' + ytId + '\', \'' + escapedTitle + '\', \'' + thumbnail + '\', \'' + escapedDesc + '\');"' + 
					' title="' + youtubeLocale.addVideoToPlaylist + '"><img src="' + youtubeLocale.contentPath + 'plus.png"/></a></div>';
	
	// If the video already exists in the playlist, don't include the add button.
	for (var i = 0; i < playlist[currentWidgetId].length; ++i) {
		if (playlist[currentWidgetId][i].ytId == ytId) {
			addBtn = '';
			break;
		}			
	}
	
	if (!playlistConfig[currentWidgetId].allowedChange)
		addBtn = '';
	
	appendTo.append(
			'<div style="float:left; width:145px; height:105px; padding-top:7px;">' +
				'<div style="position:relative;">' + 
					'<img class="ytAdd" style="display:block; margin-left:auto; margin-right:auto; width:69px; height:52px;" src=\'' + thumbnail + '\' title=\'' + escapedDesc + '\' alt=\'' + escapedDesc + '\'/>' +
					addBtn +
				'</div>' +
				'<div style="font-size:9px; text-align:center; color:white;">' + escapedTitle + '</div>' +
			'</div>');
}

// Paging controls.
function nextSearchPage() {
	
	var ytDiv = getYoutubeDiv();
	
	if ((currentPage + 1) * pageLength < maxResults)
		++currentPage;
//	else // Uncomment to allow looping.
//		currentPage = 0;
	
	// Ensure the previous page button is enabled.
	ytDiv.find("#previousSearchPage").prop('disabled', false);
	
	// Disable the next page button on page 4.
	if (3 == currentPage)
		ytDiv.find("#nextSearchPage").prop('disabled', true);	
	
	ytDiv.find('#searchPageCurr').html(currentPage + 1);
	ytDiv.find('div#ytSearchResults').empty();
	
	renderSearchResults();
}

function previousSearchPage() {	
	
	var ytDiv = getYoutubeDiv();
	
	if (0 != currentPage)
		--currentPage;
//	else // Uncomment to allow looping.
//		currentPage = (maxResults/pageLength) - 1; 
	
	// Ensure the next page button is enabled.
	ytDiv.find("#nextSearchPage").prop('disabled', false);
	
	// Disable the next page button on page 4.
	if (0 == currentPage)
		ytDiv.find("#previousSearchPage").prop('disabled', true);
	
	ytDiv.find('#searchPageCurr').html(currentPage + 1);
	ytDiv.find('div#ytSearchResults').empty();
	
	renderSearchResults();	
}