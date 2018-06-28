// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Sandpiles
// https://youtu.be/diGjw5tghYU

// Modified by Frode Austvik to create a variant

let defaultColor = [255, 0, 0];
let colors = [
	[255, 255,   0],
	[  0, 185,  63],
	[  0, 104, 255],
	[122,   0, 229]
];

let sandpiles;
let grainsSlider;
let renderer;
let finishToppling;
let toppleCountSlider;
let runState;
let frameRateEstimator;

let wasComplete = true;

function setup() {
	createCanvas(600, 600);
	pixelDensity(1);

	renderer = renderZoomed;
	createCheckbox('Zoom', true).changed(function() {
		renderer = this.checked() ? renderZoomed : renderPixels;
		background(colors[0][0], colors[0][1], colors[0][2]);
		if (runState.state === STATE_STOPPED) {
			redraw();
		}
	});

	grainsSlider = createLabelledSlider(0, 100, 1, 1, 'Grains added each time:');

	toppleCountSlider = createLabelledSlider(
		0, 1000, 100, 1, 'Max piles to topple per frame:');

	finishToppling = false;
	createCheckbox('Finish toppling before rendering a frame', finishToppling)
		.changed(function() { finishToppling = this.checked(); });

	createLabelledSlider(1, 100, 60, 1, 'Target framerate:')
		.input(function() { frameRate(this.value()); });

	runState = new RunState();

	frameRateEstimator = new FrameRateEstimator(runState);

	let framerateSpan = createSpan()
		.parent(createDiv('Current est. framerate (while running): '));
	setInterval(() => framerateSpan.html(frameRateEstimator.frameRate()), 250);

	let startButton = createButton('Start');
	runState.addListener((newState, oldState) => {
		if (newState === STATE_STOPPED) {
			startButton.html('Start');
		} else {
			startButton.html('Stop');
		}
	});
	startButton.mouseClicked(() => {
		if (runState.state === STATE_STOPPED) {
			runState.start();
		} else {
			runState.stop();
		}
	});

	createButton('Single step').mouseClicked(() => runState.singleStep());

	createButton('Reset').mouseClicked(() => {
		sandpiles = new ExpandingRectangularSandpileGroup(1);

		background(colors[0][0], colors[0][1], colors[0][2]);

		// Ensure we draw a single step (without adding grains), to reset
		// things like the toppling-incomplete state
		wasComplete = false;
		runState.singleStep();
	});

	runState.stop();

	sandpiles = new ExpandingRectangularSandpileGroup(1);

	background(colors[0][0], colors[0][1], colors[0][2]);
}

function createLabelledSlider(min, max, start, step, labelText) {
	let div = createDiv();
	let label = createElement('label', labelText);
	label.parent(createDiv().parent(div));
	let slider = createSlider(min, max, start, step).parent(div);
	let span = createSpan(slider.value()).parent(div);
	let id = createNewId();
	slider.elt.id = id;
	label.elt.htmlFor = id;
	// For some reason, an event attached with slider.input() stops working if
	// someone else later calls slider.input() again, and we want to let them
	// use that if they want to, so we use the underlying API here.
	slider.elt.addEventListener('input', e => span.html(slider.value()), false);
	return slider;
}

function createNewId() {
	let id = Math.random().toString(36).slice(2);
	while (document.getElementById(id)) {
		id += Math.random().toString(36).slice(2);
	}
	return id;
}

function renderPixels() {
	loadPixels();

	let midX = Math.floor(width / 2), midY = Math.floor(height / 2);
	let startX = midX + sandpiles.minX, startY = midY + sandpiles.minY;
	let pilesWidth = sandpiles.maxX - sandpiles.minX + 1;
	let pixelIndex = (startX + startY * width) * 4;
	let pixelIndexStride = (width - pilesWidth) * 4;

	let leftPile = sandpiles.northWest;
	while (leftPile !== null) {
		for (let pile = leftPile; pile !== null; pile = pile.east) {
			let col = colors[pile.grains] || defaultColor;

			pixels[pixelIndex++] = col[0];
			pixels[pixelIndex++] = col[1];
			pixels[pixelIndex++] = col[2];
			pixelIndex++; //pixels[pixelIndex++] = 255;
		}
		pixelIndex += pixelIndexStride;
		leftPile = leftPile.south;
	}

	updatePixels();
}

function renderZoomed() {
	background(colors[0][0], colors[0][1], colors[0][2]);

	// Calculate size (rounded down to nearest pixel)
	let cellsX = sandpiles.maxX - sandpiles.minX + 1;
	let cellsY = sandpiles.maxY - sandpiles.minY + 1;
	let cellWidth = Math.max(1, Math.floor(width / cellsX));
	let cellHeight = Math.max(1, Math.floor(height / cellsY));

	// Center it
	let startX = Math.floor((width - cellWidth * cellsX) / 2);
	let startY = Math.floor((height - cellHeight * cellsY) / 2);

	// Render it
	noStroke();
	let x = startX, y = startY, leftPile = sandpiles.northWest;
	while (leftPile !== null) {
		for (let pile = leftPile; pile !== null; pile = pile.east) {
			let col = colors[pile.grains] || defaultColor;

			fill(col[0], col[1], col[2]);
			rect(x, y, cellWidth, cellHeight);

			x += cellWidth;
		}
		x = startX;
		y += cellHeight;
		leftPile = leftPile.south;
	}
}

function draw() {
	if (runState.doStep()) {
		frameRateEstimator.frame();

		let grains = grainsSlider.value();
		let toppleCount = toppleCountSlider.value();

		if (wasComplete) {
			sandpiles.addGrains(grains);
		}
		wasComplete = sandpiles.topple(finishToppling ? null : toppleCount);

		document.body.classList.toggle('incomplete', !wasComplete);
	}

	renderer();
}
