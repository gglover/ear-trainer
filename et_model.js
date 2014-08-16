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
		if (time < 0 || time > ETM.videoLength() || time < ETM.sectionStart || time > ETM.sectionEnd) { return; }
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