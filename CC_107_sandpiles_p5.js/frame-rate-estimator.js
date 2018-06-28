class FrameRateEstimator {
	constructor(runState) {
		this._frameRate = '?';
		this._previousFrameTime = null;
		this._currentFrameTime = null;
		this._frameCount = 0;
		this._runState = runState;

		runState.addListener(this._runStateChanged.bind(this));
	}
	_runStateChanged(newState, oldState) {
		if (newState === STATE_RUNNING && oldState !== STATE_RUNNING) {
			this._previousFrameTime = null;
			this._frameCount = 0;
		}
	}
	frame() {
		if (this._runState.state === STATE_RUNNING) {
			this._currentFrameTime = window.performance.now();
			this._frameCount++;
			if (this._previousFrameTime === null) {
				this._previousFrameTime = this._currentFrameTime;
				this._frameCount = 0;
			}
		}
	}
	frameRate() {
		if (this._previousFrameTime !== null && this._frameCount > 0) {
			let time = this._currentFrameTime - this._previousFrameTime;
			this._frameRate = this._frameCount * 1000 / time;
			this._previousFrameTime = this._currentFrameTime;
			this._frameCount = 0;
		}
		return this._frameRate;
	}
}
