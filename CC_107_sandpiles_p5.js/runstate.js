const STATE_RUNNING = 'running';
const STATE_STOPPED = 'stopped';
const STATE_SINGLE_STEP = 'single-step';

class RunState {
	constructor() {
		this.state = STATE_RUNNING;
		this.listeners = new Set();
	}
	addListener(listener) {
		this.listeners.add(listener);
	}
	_setState(newState) {
		let oldState = this.state;
		this.state = newState;
		this.listeners.forEach(listener => listener(newState, oldState));
	}
	start() {
		if (this.state !== STATE_RUNNING) {
			this._setState(STATE_RUNNING);
			loop();
		}
	}
	stop() {
		this._setState(STATE_STOPPED);
		noLoop();
	}
	singleStep() {
		this._setState(STATE_SINGLE_STEP);
		noLoop();
		redraw();
	}
	doStep() {
		if (this.state === STATE_SINGLE_STEP) {
			this._setState(STATE_STOPPED);
			return true;
		}
		return this.state === STATE_RUNNING;
	}
}
