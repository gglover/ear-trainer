var TIME_SLIDER = {
	
	canvas: null,
	context: null,

	initialize: function() {
		this.canvas = document.getElementById('time-slider');
		this.context = this.canvas.getContext('2d');
	},

	sizes: {
		startEndWidth: 2,
		currentTimeWidth: 1
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

		/*if (ETM.bpm != 0) {
			ctx.fillStyle = '#777777';
			var beatTime = 0;
			while (beatTime < ETM.videoLength()) {
				debugger
				beatTime += (60 / (ETM.bpm/4));
				var beatPos = TIME_SLIDER.time_to_offset(beatTime);
				ctx.fillRect(beatPos, 0, 1, cvs.height);
			}
		}*/
	},

	time_to_offset: function(time) {
		return (this.canvas.width / ETM.videoLength()) * time;
	}

};