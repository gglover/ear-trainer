var TEMPO_TAP = {

	MIN_BPM: 30,
	MAX_BPM: 400,
	TAP_HISTORY_MAX: 20,
	METRONOME_CLICK: new Audio('click.wav'),

	lastTaps: [0],
	clickInterval: null,
	disabled: true,

	lastClickTime: 0,

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

	recordBpm: function() {
		if (this.lastTaps.length < 2) { return 0 };
		var bpm = 0;
		for (var i = this.lastTaps.length - 1; i > 0; i--) {
			bpm += this.lastTaps[i] - this.lastTaps[i - 1];
		}

		bpm = this._msToBpm(bpm / (this.lastTaps.length - 1));
		bpm = Math.round(bpm * 10) / 10;
		ETM.bpm = bpm;
		this.startMetronome();
		return ETM.bpm;
	},

	stopMetronome: function() {
		clearInterval(this.clickInterval);
		this.clickInterval = null;
	},

	startMetronome: function() {
		this.stopMetronome();
		this.clickInterval = setInterval(this._playClickFn, this._bpmToMs(ETM.bpm));
	},

	alignMetronomeToSection: function() {
		var sectionStartTime = ETM.sectionRestartTime - ((ETM.sectionEnd - ETM.sectionStart) * 1000);
		var offset = TEMPO_TAP.lastClickTime - ETM.sectionStart % TEMPO_TAP._bpmToMs(ETM.bpm);
		clearInterval(TEMPO_TAP.clickInterval);
		setTimeout(TEMPO_TAP._offsetPlayClickFn, offset);
		console.log(offset);
	},

	_offsetPlayClickFn: function() {
		TEMPO_TAP._playClickFn();
		TEMPO_TAP.clickInterval = setInterval(TEMPO_TAP._playClickFn, TEMPO_TAP._bpmToMs(ETM.bpm));
	},

	_playClickFn: function() {
		if (!TEMPO_TAP.disabled) {
			TEMPO_TAP.lastClickTime = Date.now();
			TEMPO_TAP.METRONOME_CLICK.play();
		}
	},

	_bpmToMs: function(bpm) {
		return (60 * 1000) / bpm;
	},

	_msToBpm: function(ms) {
		return (60 * 1000) / ms;
	}
};