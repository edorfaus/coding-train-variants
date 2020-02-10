// Fire Effect
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/103-fire-effect.html
// https://youtu.be/X0kjv0MozuY

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

let buffer1;
let buffer2;
let cooling;
const w = 300;
const h = 200;

let ystart = 0.0;
let yoff = ystart; // Start yoff at 0
const increment = 0.02;

function setup() {
  pixelDensity(1);
  createCanvas(w * 2, h);
  buffer1 = createGraphics(w, h);
  buffer2 = createGraphics(w, h);
  cooling = createImage(w, h);
}

function cool() {
  cooling.loadPixels();
  yoff = ystart; // Start yoff at the top of the image
  // For every x,y coordinate in a 2D space, calculate a noise value and produce a brightness value
  for (let y = 0; y < h; y++) {
    yoff += increment; // Increment yoff

    let xoff = 0.0; // For every yoff, start xoff at 0
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

  cooling.updatePixels();
  ystart += increment;
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
