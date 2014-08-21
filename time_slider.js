var TIME_SLIDER = {
	
	canvas: null,
	context: null,

	initialize: function() {
		this.canvas = document.getElementById('time-slider');
		this.context = this.canvas.getContext('2d');
	},

	defaults: {
		startEndWidth: 3,
		currentTimeWidth: 2 ,
		timeFont: "15px Times New Roman",
		timeOffsetX: 5,
		timeOffsetY: 15
	},

	render: function() {
		var ctx = TIME_SLIDER.context;
		var cvs = TIME_SLIDER.canvas;
		
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, cvs.width, cvs.height);




		// Section start flag
		ctx.fillStyle = '#ffffff';
		start = TIME_SLIDER.time_to_offset(ETM.sectionStart);

		ctx.fillRect(start - TIME_SLIDER.defaults.startEndWidth / 2, 0, 
					 TIME_SLIDER.defaults.startEndWidth, cvs.height);

		var timeObj = TIME_SLIDER._secondsToTime(ETM.sectionStart);
		ctx.font = TIME_SLIDER.defaults.timeFont;

		var timeText = timeObj.m + ":" + timeObj.s;
		var textWidth = ctx.measureText(timeText).width;
		var textOffsetX = 0;

		if (textWidth > start) {
			textOffsetX = TIME_SLIDER.defaults.timeOffsetX + start;
		} else {
			textOffsetX = start - textWidth - TIME_SLIDER.defaults.timeOffsetX;
		}
	 
		ctx.fillText(timeText, textOffsetX, TIME_SLIDER.defaults.timeOffsetY);




		// Section end flag
		ctx.fillStyle = '#ffffff';
		end = TIME_SLIDER.time_to_offset(ETM.sectionEnd);

		ctx.fillRect(end - TIME_SLIDER.defaults.startEndWidth / 2, 0, 
					 TIME_SLIDER.defaults.startEndWidth, cvs.height);


		timeObj = TIME_SLIDER._secondsToTime(ETM.sectionEnd);

		timeText = timeObj.m + ":" + timeObj.s;
		textWidth = ctx.measureText(timeText).width;
		textOffsetX = 0;

		if (textWidth > cvs.width - end) {
			textOffsetX = end - textWidth - TIME_SLIDER.defaults.timeOffsetX;
		} else {
			textOffsetX = TIME_SLIDER.defaults.timeOffsetX + end;
		}
	 
		ctx.fillText(timeText, textOffsetX, TIME_SLIDER.defaults.timeOffsetY);




		// Current time flag
		ctx.fillStyle = '#00ff00';
		current = TIME_SLIDER.time_to_offset(ETM.currentTime());
		ctx.fillRect(current - TIME_SLIDER.defaults.currentTimeWidth / 2, 
					 0, TIME_SLIDER.defaults.currentTimeWidth, cvs.height);

		
	},

	time_to_offset: function(time) {
		return (this.canvas.width / ETM.videoLength()) * time;
	},

	_secondsToTime: function(secs)
	{
	    var divisor_for_minutes = secs % (60 * 60);
	    var minutes = Math.floor(divisor_for_minutes / 60);

	    var divisor_for_seconds = divisor_for_minutes % 60;
	    var seconds = Math.ceil(divisor_for_seconds);
	    if (seconds < 10) { seconds = '0' + seconds };

	    return { "m": minutes, "s": seconds };
	}

};