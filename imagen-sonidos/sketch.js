const cameraWidth = 640;
const cameraHeight = 480;
const blockSize = 50;
let numBlockHori;
let numBlockVert;
let totalblocks;

let capture;

const rectSize = 80;

const gap = 3;

function setup() {
  createCanvas(displayWidth, displayHeight);
  capture = createCapture(VIDEO, ready);
  capture.size(cameraWidth, cameraHeight);
  capture.hide();

  numBlockHori = this.floor(cameraWidth / blockSize);
  numBlockVert = this.floor(cameraHeight / blockSize);
  totalblocks = numBlockHori * numBlockVert;

  noStroke();
}

let onAir = false;

function ready() {
  onAir = true;
}

function draw() {
  background(255);

  if (onAir) {
    capture.loadPixels();

    let blocksColor = new Array(totalblocks);

    for (let blockCnt = 0; blockCnt < totalblocks; blockCnt++) {
      const blockLocX = blockCnt % numBlockHori;
      const blcokLocY = floor(blockCnt / numBlockHori);

      let sumRed, sumBlue, sumGreen;
      sumRed = 0;
      sumBlue = 0;
      sumGreen = 0;
      for (
        let y = blcokLocY * blockSize;
        y < (blcokLocY + 1) * blockSize;
        y++
      ) {
        for (
          let x = blockLocX * blockSize;
          x < (blockLocX + 1) * blockSize;
          x++
        ) {
          const index = (capture.width - x + 1 + y * capture.width) * 4;
          sumRed += capture.pixels[index + 0];
          sumGreen += capture.pixels[index + 1];
          sumBlue += capture.pixels[index + 2];
        }
      }
      const meanColor = color(
        round(sumRed / (blockSize * blockSize)),
        round(sumGreen / (blockSize * blockSize)),
        round(sumBlue / (blockSize * blockSize))
      );

      blocksColor[blockCnt] = meanColor;
    }

    for (let y = 0; y < numBlockVert; y++) {
      for (let x = 0; x < numBlockHori; x++) {
        fill(blocksColor[x + y * numBlockHori]);
        rect(
          x * rectSize + gap,
          y * rectSize + gap,
          rectSize - gap,
          rectSize - gap,
          5
        );
      }
    }
  }
}

function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
}
