// Ear trainer view
var ETV = {

	ID_REGEX: /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
	VIDEO_ROTATION: ["https://www.youtube.com/watch?v=oIAkRVBS-0U",
					 "https://www.youtube.com/watch?v=lMWQ0Cz5hHY",
					 "https://www.youtube.com/watch?v=03CQP9mHUr0",
					 "https://www.youtube.com/watch?v=Qz7zo7wIlbU"],

	initialize: function() {
		window.onYouTubeIframeAPIReady = function() {
			ETM.player = new YT.Player('player', {
				height: '350',
				width: '800',
				playerVars: { 'controls': 0 },
				events: {
					'onReady': ETV.bindEvents,
					'onStateChange': ETV.handleVideoStateChange
				}
			});
			var videoIndex = Math.floor(Math.random() * ETV.VIDEO_ROTATION.length);
			$('#video-url').val(ETV.VIDEO_ROTATION[videoIndex]);
		};
	},

	bindEvents: function() {
		$('#play-pause').click(ETV.handlePlayPause);
		$('#volume').on('input change', ETV.handleVolumeChange);
		$('#load-video').click(ETV.handleVideoLoad);
		$('#bpm').change(ETV.handleBpmChange);
		$('#disable-metronome').click(ETV.handleMetronomeDisable);
		
		$('#time-slider').mousedown(ETV.handleTimeSlide);
		$('#time-slider').mousemove(ETV.handleTimeSliderHover);
		$(document).mouseup(ETV.unsetDragging);

		$(document).bind("sectionChange", TIME_SLIDER.render);
		$(document).bind("tick", TIME_SLIDER.render);
		$(document).bind("videoLoad", TIME_SLIDER.render);

		// YT API has no events for a seek's competions so it gotta be this way QQ
		$(document).bind("seek", function() { setTimeout(TIME_SLIDER.render, 200); });	

		// Keyboard bindings
		var redirectKeyInput = function(e) {
			if (e.keyCode == 32) {
				e.preventDefault();
				ETV.handlePlayPause();
			} else if (e.keyCode == 84) { ETV.handleTempoTap();      
			} else if (e.keyCode == 37) { ETV.handleLeftArrowTap();  
			} else if (e.keyCode == 39) { ETV.handleRightArrowTap(); }
		}
		$(document).keydown(redirectKeyInput);
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
		var targetedSectionSlider = ETV._isSliderSelected(e);
		if (!ETV.dragging && targetedSectionSlider) {
			$(document).bind('mousemove', ETV.handleTimeSlide);
			ETV.dragging = true;
		}

		var time = ETV._getSliderTime(e);
		if (ETV.dragging) {
			ETM.editSection(time);
		} else {
			ETM.seek(time);
		}
	},

	handleTimeSliderHover: function(e) {
		var targetedSectionSlider = ETV._isSliderSelected(e);
		if (targetedSectionSlider) {
			e.currentTarget.style.cursor = 'ew-resize';
		} else {
			e.currentTarget.style.cursor = 'default';
		}
	},

	_isSliderSelected: function(e) {
		var time = ETV._getSliderTime(e);
		return (Math.abs(time - ETM.sectionStart) < 2.5 || Math.abs(time - ETM.sectionEnd) < 2.5);
	},

	_getSliderTime: function(e) {
		var $cvs = $('#time-slider');
		var relative_x = e.pageX - $cvs.offset().left;
		return (relative_x / $cvs.width()) * ETM.videoLength();
	},

	handleVolumeChange: function(e) {
		ETM.changeVolume(parseInt(e.currentTarget.value));
	},

	handlePlayPause: function() {
		if (ETM.player.getPlayerState() == 1) {
			ETM.pause();
			$('#play-pause').text('play');
		} else {
			ETM.play();
			$('#play-pause').text('pause');
		}
	},

	handleMetronomeDisable: function(e) { 
		var disabled = TEMPO_TAP.disabled 
		if (!disabled) {
			$(e.currentTarget).addClass('disabled');
		} else {
			$(e.currentTarget).removeClass('disabled');
		}
		TEMPO_TAP.disabled = !disabled;
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
		if (state.data == 1 && ETM.status == 'switching') {
			$('#player-container').addClass('loaded');
			ETM.afterVideoLoad();
		} else if (state.data == 1) {
			TIME_SLIDER.render();
		}
	},

	handleRightArrowTap: function() {
		ETM.seek(ETM.currentTime() + 2);
	},

	handleLeftArrowTap:function() {
		ETM.seek(ETM.currentTime() - 2);
	}
};
