/* ----------------------------------------------------------------------
 * Filename:			smallworlds.js
 * Description:			Javascript library file for general SmallWorlds functionality.
 * Website:				http://www.smallworlds.com
 * Author:				Matt Tatnell
---------------------------------------------------------------------- */

/**
 * Implement image rollover support via rel tag and rollover class.
 * 
 * This allows any image links on the page to swap their image to a hover
 * state on mouse rollover by using the class 'rollover' and specifying 
 * the rollover image in the 'rel' attribute.
 */
$(document).ready(function() {
	
	// Rollover swap images with rel. 
	var imgSrc = "";
	var newSrc = "";
	
	// Mouseover swap.
	$(".rollover").hover(function() {
		
		// Grab original image.
		imgSrc = $(this).attr('src');
		
		// Grab rollover image.
		newSrc = $(this).attr('rel');
		
		// Swap images.
		$(this).attr('src', newSrc); 
		$(this).attr('rel', imgSrc);	 
	},
	
	// Mouse out swap.
	function() {
	 
		// Swap images.
		$(this).attr('src', imgSrc); //swap images
		$(this).attr('rel', newSrc); //swap images
	});
	
	// Cycle through all rollover elements and add too cache to preload.
    var cache = new Array();
    $(".rollover").each(function() {
    	var cacheImage = document.createElement('img');
    	cacheImage.src = $(this).attr('rel');
    	cache.push(cacheImage);
    }); 
});

/** Pop up a FancyBox lightbox displaying an error. */
function popupErrorLightbox() {
	
	// Trigger top page to replace any active FancyBox with an error.
	window.top.jQuery.fancybox({
		href: "/error",
		type: "iframe",
		autoSize : false,
		padding : 0,
		width : 600,
		height : 170,
		modal : true
	});
}
