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
let grainsSpan;
let renderer;

function setup() {
	createCanvas(600, 600);
	pixelDensity(1);

	renderer = renderZoomed;
	createCheckbox('Zoom', true).changed(function() {
		renderer = this.checked() ? renderZoomed : renderPixels;
		background(colors[0][0], colors[0][1], colors[0][2]);
	});

	let div = createDiv();
	let label = createElement('label', 'Grains added per frame:');
	label.parent(createDiv().parent(div));
	grainsSlider = createSlider(0, 100, 1, 1).parent(div);
	grainsSpan = createSpan().parent(div);
	let id = createNewId();
	grainsSlider.elt.id = id;
	label.elt.htmlFor = id;

	sandpiles = new ExpandingRectangularSandpileGroup(0);

	background(colors[0][0], colors[0][1], colors[0][2]);
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
	let grains = grainsSlider.value();
	grainsSpan.html(grains);

	sandpiles.addGrains(grains);

	renderer();
}
