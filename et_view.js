// Ear trainer view
var ETV = {

	ID_REGEX: /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,

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
		};
	},

	bindEvents: function() {
		$('#play-pause').click(ETV.handlePlayPause);
		$('#volume').on('input change', ETV.handleVolumeChange);
		$('#load-video').click(ETV.handleVideoLoad);
		$('#bpm').change(ETV.handleBpmChange);
		$('#disable-metronome').click(ETV.handleMetronomeDisable);

		$('#tempo-tap').focus(function(e) { $(e.currentTarget).text('tap any key') });
		$('#tempo-tap').blur(function(e) { $(e.currentTarget).text('tap tempo') });
		
		$('#time-slider').mousedown(ETV.handleTimeSlide);
		$(document).mouseup(ETV.unsetDragging);

		$(document).bind("sectionChange", TIME_SLIDER.render);
		$(document).bind("tick", TIME_SLIDER.render);
		$(document).bind("videoLoad", TIME_SLIDER.render);	

		// Keyboard bindings
		var redirectKeyInput = function(e) {
			if (document.activeElement.id == 'tempo-tap') {
				ETV.handleTempoTap();
			} else if (e.keyCode == 32) {
				e.preventDefault();
				ETV.handlePlayPause();
			}
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
		debugger;
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
		}
	}
};
