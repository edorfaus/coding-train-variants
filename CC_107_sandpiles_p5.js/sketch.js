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

function setup() {
	createCanvas(600, 600);
	pixelDensity(1);

	grainsSlider = createSlider(0, 100, 1, 1);
	grainsSpan = createSpan();

	sandpiles = new ExpandingRectangularSandpileGroup(0);

	background(colors[0][0], colors[0][1], colors[0][2]);
}

function render() {
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

function draw() {
	let grains = grainsSlider.value();
	grainsSpan.html(grains);

	sandpiles.addGrains(grains);

	render();
}
