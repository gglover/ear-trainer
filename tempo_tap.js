var TEMPO_TAP = {

	MIN_BPM: 30,
	MAX_BPM: 400,
	TAP_HISTORY_MAX: 20,

	lastTaps: [0],

	registerTap: function() {
		var tapTime = Date.now();
		if (tapTime - this.lastTaps[this.lastTaps.length - 1] > this._bpmToMs(this.MIN_BPM)) { 
			this.lastTaps = [];
		}
		this.lastTaps.push(tapTime)

		// Truncate if we've recorded too many
		if (this.lastTaps.length >= this.TAP_HISTORY_MAX) {
			this.lastTaps = this.lastTaps.slice(1, this.TAP_HISTORY_MAX);
		}
	},

	getBpm: function() {
		if (this.lastTaps.length < 2) { return 0 };
		var bpm = 0;
		for (var i = this.lastTaps.length - 1; i > 0; i--) {
			bpm += this.lastTaps[i] - this.lastTaps[i - 1];
		}
		return this._msToBpm(bpm / (this.lastTaps.length - 1));
	},

	_bpmToMs: function(bpm) {
		return (60 * 1000) / bpm;
	},

	_msToBpm: function(ms) {
		return (60 * 1000) / ms;
	}
};