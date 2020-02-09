// Hilbert Curve
// Coding in the Cabana
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingInTheCabana/003-hilbert-curve.html
// https://youtu.be/dSK-MW-zuAc
// https://editor.p5js.org/codingtrain/sketches/LPf9PLmp
//
// Modified by Frode Austvik, 2020-02-08

// The highest order of Hilbert Curve to render.
// This also determines the size of the canvas: 2^order
const order = 9;

// Whether to keep the same hue range throughout zooms.
const sameHue = false;

// Whether to do a crossfade during changes in order.
const doCrossfade = true;

// Current animation speed: set it to the initial speed.
let currentSpeed = 0.03;

// How much to increase the speed for each change in order.
const speedMultiplier = 3;

// -------- end of configuration

// This holds the coordinates for the highest-order curve
// (which are reused for the lower-order curves)
const path = [];

// The path index at which we start rendering the curve.
// This is a constant, but is set during setup().
let startIndex;

// Animation position counter, draw() adds currentSpeed.
let counter = 0;

// The order of curve that is currently being displayed.
let currentOrder = 0;

// Sub-animation position counter for the zoom-out while
// switching which order of curve is being displayed.
let orderSwitchAnimPos = 0;

// One createGraphics() context per order of curve.
const gfxs = [];

// Total number of vertices per order of curve.
const totals = [];

// The drawing position offset for each order of curve.
const offsets = [];

// The drawing position multipliers for each curve order.
const posMultipliers = [];

// The index into the path that each order starts at.
const indexStart = [];

// The index into the path that each order ends at.
const indexEnd = [];

function setup() {
  const size = int(pow(2, order));
  createCanvas(size, size);
  colorMode(HSB, 360, 255, 255, 1);
  background(0);

  let N = 1;
  for (let i = 0; i < order; i++) {
    const gfx = createGraphics(width, height);
    gfx.colorMode(HSB, 360, 255, 255, 1);
    gfx.background(0);
    gfx.noFill();
    const weight = max(1, order - i - 1);
    gfx.strokeWeight(weight);
    if (weight < 2) {
      gfx.noSmooth();
    }
    gfxs[i] = gfx;

    posMultipliers[order - i - 1] = N;
    N *= 2;
    totals[i] = N * N;
    offsets[i] = width / (N * 2);
  }

  let total = totals[order - 1];
  let len = width / N;
  for (let i = 0; i < total; i++) {
    path[i] = hilbert(i);
    path[i].mult(len);
    path[i].y -= width;
  }

  startIndex = int(total / 3);

  indexStart[0] = startIndex - 1;
  indexEnd[0] = indexStart[0] + totals[0];
  for (let i = 1; i < order; i++) {
    indexStart[i] = indexStart[i - 1] - totals[i - 1];
    indexEnd[i] = indexStart[i] + totals[i];
  }
}

function draw() {
  const nextCounter = counter + currentSpeed;
  const cur = int(counter);
  const next = int(nextCounter);
  counter = nextCounter;

  let fromIndex = max(0, startIndex - int(next / 2));
  let toIndex = max(0, startIndex - int(cur / 2) + 1);
  if (fromIndex != toIndex) {
    for (let i = currentOrder; i < order; i++) {
      drawSection(i, fromIndex, toIndex);
    }
  }

  const earliestIndex = fromIndex;

  fromIndex = min(path.length, startIndex + cur);
  toIndex = min(path.length, startIndex + next + 1);
  if (fromIndex != toIndex) {
    for (let i = currentOrder; i < order; i++) {
      drawSection(i, fromIndex, toIndex);
    }
  }

  if (toIndex - earliestIndex > totals[currentOrder]) {
    if (currentOrder < order - 1) {
      currentOrder++;
      currentSpeed *= speedMultiplier;
      orderSwitchAnimPos = 1;
    } else {
      noLoop();
    }
  } else if (earliestIndex == 0) {
    noLoop();
  }

  const gfx = gfxs[currentOrder];
  if (orderSwitchAnimPos > 0) {
    const ofs = map(orderSwitchAnimPos, 1, 0, width / 2, 0);
    image(gfx, 0, 0, width, height, 0, ofs, width - ofs, height - ofs);

    if (doCrossfade) {
      const pos = width / 2 - ofs;
      tint(255, orderSwitchAnimPos);
      image(gfxs[currentOrder - 1], 0, pos, width - pos, height - pos);
      noTint();
    }

    orderSwitchAnimPos -= deltaTime / 1000;
  } else {
    image(gfx, 0, 0);
  }
}

function drawSection(orderIndex, fromIndex, toIndex) {
  const gfx = gfxs[orderIndex];
  const mult = posMultipliers[orderIndex];
  const offsetX = offsets[orderIndex];
  const offsetY = width + offsetX;

  const hueMin = sameHue ? 0 : indexStart[orderIndex];
  const hueMax = sameHue ? path.length : indexEnd[orderIndex];

  const endIndex = min(toIndex, indexEnd[orderIndex]);

  let prevX = path[fromIndex].x * mult + offsetX;
  let prevY = path[fromIndex].y * mult + offsetY;
  for (let i = fromIndex + 1; i < endIndex; i++) {
    const hue = map(i, hueMin, hueMax, 0, 360);
    gfx.stroke(hue, 255, 255);

    let x = path[i].x * mult + offsetX;
    let y = path[i].y * mult + offsetY;
    gfx.line(prevX, prevY, x, y);
    prevX = x;
    prevY = y;
  }
}

const hilbertPoints = [
  new p5.Vector(0, 0),
  new p5.Vector(0, 1),
  new p5.Vector(1, 1),
  new p5.Vector(1, 0)
];

function hilbert(i) {
  let v = hilbertPoints[i & 3].copy();
  let len = 1;
  for (let j = 1; j < order; j++) {
    i = i >>> 2;
    len *= 2;
    switch (i & 3) {
      case 0: {
        let temp = v.x;
        v.x = v.y;
        v.y = temp;
        break;
      }
      case 1: {
        v.y += len;
        break;
      }
      case 2: {
        v.x += len;
        v.y += len;
        break;
      }
      case 3: {
        let temp = v.x;
        v.x = len - 1 - v.y;
        v.y = len - 1 - temp;
        v.x += len;
        break;
      }
    }
  }
  return v;
}
