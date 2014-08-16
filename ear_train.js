// Ear trainer model
var ETM = {

	status: null,
	player: null,
	sectionStart: 0,
	sectionEnd: 0,
	
	initialize: function() {
		ETM.state = 'unloaded';
		setInterval(this._monitorPlayback, 500);
	},

	/* Loading and unloading videos */

	reset: function() {
		ETM.sectionStart = ETM.sectionEnd = 0;
		ETM.idle = true;
	},

	loadVideo: function(videoId) {
		ETM.status = 'switching';
		ETM.player.loadVideoById({videoId: videoId});
	},

	afterVideoLoad: function() {
		ETM.sectionStart = 0;
		ETM.sectionEnd = ETM.videoLength();
		ETM.status = 'loaded';
		$(document).trigger("videoLoad");
	},


	/* Player interaction */

	play: function() {
		ETM.player.playVideo();
	},

	pause: function() {
		ETM.player.pauseVideo();
	},

	seek: function(time) {
		ETM.player.seekTo(time);
	},

	editSection: function(time) {
		time = Math.round(time);
		if (time < 0 || time > ETM.videoLength()) { return; }

		// Prevent excessive rerenders
		if (time == this.sectionEnd || time == this.sectionStart) { return; }
		
		// I think i can simplify this but idc
		if (time > this.sectionEnd) {
			this.sectionEnd = time;
		} else if (time < this.sectionStart) {
			this.sectionStart = time;
		} else {
			if (this.sectionEnd - time < time - this.sectionStart) {
				this.sectionEnd = time;
			} else {
				this.sectionStart = time;
			}
		}

		if (this.sectionStart > this.sectionEnd) { throw "You fucked up." }

		$(document).trigger("sectionChange");
	},


	/* Getters */
 
	videoLength: function() {
		return ETM.player.getDuration() || 100;
	},

	currentTime: function() {
		return ETM.player.getCurrentTime();
	},


	
	_monitorPlayback: function() {
		if (ETM.player.getPlayerState() == 1) {
			var playTime = ETM.currentTime(); 
			if (playTime > ETM.sectionEnd || playTime < ETM.sectionStart) {
				ETM.seek(ETM.sectionStart);
			}
			$(document).trigger("tick");
		}
	}
};

// Ear trainer view
var ETV = {

	ID_REGEX: /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,

	initialize: function() {
		var params = { allowScriptAccess: "always" };
		var atts = { id: "player" }

		window.onYouTubePlayerReady = function() {
		    ETM.player = $("#player").get(0);
		    ETV.bindEvents();
		}

		swfobject.embedSWF("https://www.youtube.com/apiplayer?enablejsapi=1&version=3", 
						   "player", "800", "280", "9", null, null, params, atts);
	},

	bindEvents: function() {
		$('#play').click(ETM.play);
		$('#pause').click(ETM.pause);
		$('#load-video').click(this.handleVideoLoad);
		
		$('#time-slider').mousedown(this.handleTimeSlide);
		$(document).mouseup(this.unsetDragging);

		$(document).bind("sectionChange", TIME_SLIDER.render);
		$(document).bind("tick", TIME_SLIDER.render);
		$(document).bind("videoLoad", TIME_SLIDER.render);

		ETM.player.addEventListener("onStateChange", "ETV.handleVideoStateChange");

	},

	handleVideoLoad: function() {
		var url = $('#video-url').val();
		var parsed = url.match(ETV.ID_REGEX);
		if (parsed && parsed[1].length == 11) {
			ETM.loadVideo(parsed[1]);
		} else {
			// Handle error here
		}
	},

	dragging: false,
	unsetDragging: function() {
		$(document).unbind('mousemove');
		ETV.dragging = false;
	},

	handleTimeSlide: function(e) {

		var $cvs = $('#time-slider');
		var relative_x = e.pageX - $cvs.offset().left;
		var time = (relative_x / $cvs.width()) * ETM.videoLength();

		ETM.editSection(time);

		if (!ETV.dragging) {
			$(document).bind('mousemove', ETV.handleTimeSlide);
			ETV.dragging = true;
		}
	},

	handleVideoStateChange: function(state) {
		if (state == 1 && ETM.status == 'switching') {
			ETM.afterVideoLoad();
		}
	}
};

var TIME_SLIDER = {
	
	canvas: null,
	context: null,

	initialize: function() {
		this.canvas = document.getElementById('time-slider');
		this.context = this.canvas.getContext('2d');
	},

	sizes: {
		startEndWidth: 2,
		currentTimeWidth: 3
	},

	render: function() {
		var ctx = TIME_SLIDER.context;
		var cvs = TIME_SLIDER.canvas;
		
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, cvs.width, cvs.height);

		ctx.fillStyle = '#ff0000';
		start = TIME_SLIDER.time_to_offset(ETM.sectionStart);
		ctx.fillRect(start - TIME_SLIDER.sizes.startEndWidth / 2, 0, 
					 TIME_SLIDER.sizes.startEndWidth, cvs.height);

		ctx.fillStyle = '#ff0000';
		end = TIME_SLIDER.time_to_offset(ETM.sectionEnd);
		ctx.fillRect(end - TIME_SLIDER.sizes.startEndWidth / 2, 0, 
					 TIME_SLIDER.sizes.startEndWidth, cvs.height);

		ctx.fillStyle = '#00ff00';
		current = TIME_SLIDER.time_to_offset(ETM.currentTime());
		ctx.fillRect(current - TIME_SLIDER.sizes.currentTimeWidth / 2, 
					 0, TIME_SLIDER.sizes.currentTimeWidth, cvs.height);
	},

	time_to_offset: function(time) {
		return (this.canvas.width / ETM.videoLength()) * time;
	}

}

$(document).ready(function() {
	TIME_SLIDER.initialize();
	ETM.initialize();
	ETV.initialize();
});
