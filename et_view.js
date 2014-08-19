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
		$('#volume').on('input change', this.handleVolumeChange);
		$('#load-video').click(this.handleVideoLoad);
		$('#tempo-tap').keydown(this.handleTempoTap);
		$('#bpm').change(this.handleBpmChange);
		$('#disable-metronome').change(this.handleMetronomeDisable);
		
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


		var targetedSectionSlider = (Math.abs(time - ETM.sectionStart) < 1.5 || Math.abs(time - ETM.sectionEnd) < 1);
		if (!ETV.dragging && targetedSectionSlider) {
			$(document).bind('mousemove', ETV.handleTimeSlide);
			ETV.dragging = true;
		}

		if (ETV.dragging) {
			ETM.editSection(time);
		} else {
			ETM.seek(time);
		}
	},

	handleVolumeChange: function(e) {
		ETM.changeVolume(parseInt(e.currentTarget.value));
	},

	handleMetronomeDisable: function(e) {
		TEMPO_TAP.disabled = !TEMPO_TAP.disabled;
	},

	handleTempoTap: function() {
		TEMPO_TAP.registerTap();
		TEMPO_TAP.recordBpm();
		$('#bpm').val(ETM.bpm);
	},

	handleBpmChange: function() {
		ETM.bpm = parseFloat($('#bpm').val());
		TEMPO_TAP.startMetronome();
	},

	handleVideoStateChange: function(state) {
		if (state == 1 && ETM.status == 'switching') {
			ETM.afterVideoLoad();
		}
	}
};