// Fire Effect
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/103-fire-effect.html
// https://youtu.be/X0kjv0MozuY

// Modified by Frode Austvik

// Algorithm: https://web.archive.org/web/20160418004150/http://freespace.virgin.net/hugo.elias/models/m_fire.htm

// The biggest difference from the Processing version this is based on
// is that the pixel arrays do not have one index for each pixel, but
// instead have 4 indices for each pixel, representing the 4 color
// components for that pixel (red, green, blue and alpha).
//
// To set a single pixel, this code therefore has to multiply the
// indexes by 4, and then set 4 consecutive entries in the pixel array.

// The next problem is that this runs a lot slower than the Processing
// version does, so we need to do some optimization to get a decent
// framerate.
//
// One simple and very effective optimization we can do here is to
// improve the way the cooling map image is updated on every frame.
//
// In the original, the entire image is redrawn based on data from the
// noise() function on every frame, in such a way that the image is
// moved up by one pixel and the bottom row is filled in with new data.
//
// Here, we change that to only use the noise() function for that new
// row at the bottom, while moving the existing pixels up as they are.
//
// This is done in a sequence of steps:
// - swap the loops in cool() to have y as the outer loop, x as inner,
//   so that it draws one row at a time instead of a column at a time.
// - move the increment and yoff variables out to global scope.
// - move the inner loop (drawing a row) out to a new function.
// - move the outer loop to setup() so it is only done once.
// - add copy() call to move pixels up, and then draw the next row.
// - remove the unneeded ystart variable, and increase the resolution.

let buffer1;
let buffer2;
let cooling;
const w = 600;
const h = 400;

let yoff = 0.0; // Start yoff at 0
const increment = 0.02;

function setup() {
  pixelDensity(1);
  createCanvas(w * 2, h);
  buffer1 = createGraphics(w, h);
  buffer2 = createGraphics(w, h);
  cooling = createImage(w, h);

  cooling.loadPixels();
  // For every x,y coordinate in a 2D space, calculate a noise value and produce a brightness value
  for (let y = 0; y < h; y++) {
    yoff += increment; // Increment yoff

    drawCoolingRow(y);
  }
  cooling.updatePixels();

  createP(
    'This version applies a simple optimization: ' +
    'instead of recreating the entire cooling map for every frame, ' +
    'just scroll it up by a pixel and fill in the new bottom row.'
  );
  createP(
    'This is explained in more detail in the ' +
    '<a href="sketch.js">source code</a>.'
  );
}

function cool() {
  // Copy pixels within the image, to move everything up one row.
  //
  // The arguments here are the source rectangle followed by the target
  // rectangle (where to copy from followed by where to copy to), both
  // given as the top-left X,Y position then the width and height.
  //
  // So, this takes a rectangle that is as wide as the image, and one
  // pixel less tall than it, starting one pixel down from the top, and
  // copies that to the top of the image - thus moving it up one pixel.
  cooling.copy(0, 1, w, h - 1, 0, 0, w, h - 1);

  cooling.loadPixels();
  yoff += increment; // Increment yoff to move to the next row
  drawCoolingRow(h - 1); // Draw the new last row in the image
  cooling.updatePixels();
}

function drawCoolingRow(y) {
  let xoff = 0.0; // For every row, start xoff at 0
  for (let x = 0; x < w; x++) {
    xoff += increment; // Increment xoff

    // Calculate noise and scale by 255
    let n = noise(xoff, yoff);
    let bright = pow(n, 3) * 255;

    // Try using this line instead
    //float bright = random(0,255);

    // Set each pixel onscreen to a grayscale value
    let index = (x + y * w) * 4;
    cooling.pixels[index] = bright;
    cooling.pixels[index + 1] = bright;
    cooling.pixels[index + 2] = bright;
    cooling.pixels[index + 3] = 255;
  }
}

function fire(rows) {
  buffer1.loadPixels();
  for (let x = 0; x < w; x++) {
    for (let j = 0; j < rows; j++) {
      let y = h - (j + 1);
      let index = (x + y * w) * 4;
      buffer1.pixels[index] = 255;
      buffer1.pixels[index + 1] = 255;
      buffer1.pixels[index + 2] = 255;
      buffer1.pixels[index + 3] = 255;
    }
  }
  buffer1.updatePixels();
}

function draw() {
  fire(2);
  if (mouseIsPressed) {
    buffer1.fill(255);
    buffer1.noStroke();
    buffer1.ellipse(mouseX, mouseY, 100, 100);
  }
  cool();
  background(0);
  buffer1.loadPixels();
  buffer2.loadPixels();
  for (let x = 1; x < w - 1; x++) {
    for (let y = 1; y < h - 1; y++) {
      let index0 = (x + y * w) * 4; // x, y
      let index1 = (x + 1 + y * w) * 4; // (x + 1), y
      let index2 = (x - 1 + y * w) * 4; // (x - 1), y
      let index3 = (x + (y + 1) * w) * 4; // x, (y + 1)
      let index4 = (x + (y - 1) * w) * 4; // x, (y - 1)

      // Because we are using only gray colors, the value of the color
      // components are the same, and we can use that as brightness.
      let c1 = buffer1.pixels[index1];
      let c2 = buffer1.pixels[index2];
      let c3 = buffer1.pixels[index3];
      let c4 = buffer1.pixels[index4];

      let c5 = cooling.pixels[index0];
      let newC = c1 + c2 + c3 + c4;
      newC = newC * 0.25 - c5;

      buffer2.pixels[index4] = newC;
      buffer2.pixels[index4 + 1] = newC;
      buffer2.pixels[index4 + 2] = newC;
      buffer2.pixels[index4 + 3] = 255;
    }
  }
  buffer2.updatePixels();

  // Swap
  let temp = buffer1;
  buffer1 = buffer2;
  buffer2 = temp;

  image(buffer2, 0, 0);
  image(cooling, w, 0);
}
