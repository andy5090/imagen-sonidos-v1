let cameraWidth = 640;
let cameraHeight = 360;
const blockSize = 40;
let numBlockHori;
let numBlockVert;
let totalblocks;

let capture;

let rectSize = 80;
const gap = 3;

let blockIndicator = 0;
let prevMilSec;
const timeStep = 500;

let osc;

let titleShowed = false;
let fadeIn = 0;
let textColor = 0;
const fadeStep = 1;
let fadeTime = 0;

function setup() {
  if (windowWidth < windowHeight) {
    cameraWidth = 360;
    cameraHeight = 640;
  }

  numBlockHori = floor(cameraWidth / blockSize);
  numBlockVert = floor(cameraHeight / blockSize);
  totalblocks = numBlockHori * numBlockVert;

  if (windowWidth < windowHeight) {
    rectSize = windowWidth / numBlockHori;
  } else {
    rectSize = windowHeight / numBlockVert;
  }

  createCanvas(rectSize * numBlockHori, rectSize * numBlockVert);
  capture = createCapture(VIDEO, ready);
  capture.size(cameraWidth, cameraHeight);
  capture.hide();

  noStroke();
  background(0);

  osc = new Array(numBlockVert);

  for (let i = 0; i < numBlockVert; i++) {
    osc[i] = new p5.Oscillator();
    osc[i].setType("sine");
    osc[i].start();
    osc[i].freq(240);
    osc[i].amp(0.1, 1);
  }
}

let onAir = false;

function ready() {
  onAir = true;
  prevMilSec = millis();
}

function drawBlocks(blocksColor) {
  for (let y = 0; y < numBlockVert; y++) {
    for (let x = 0; x < numBlockHori; x++) {
      fill(blocksColor[numBlockHori - 1 - x + y * numBlockHori]);
      rect(
        x * rectSize + gap,
        y * rectSize + gap,
        rectSize - gap,
        rectSize - gap,
        5
      );

      if (x === blockIndicator) {
        fill(255, 255, 255, 140);
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

function video2Mozaic() {
  let blocksColor = new Array(totalblocks);

  for (let blockCnt = 0; blockCnt < totalblocks; blockCnt++) {
    const blockLocX = blockCnt % numBlockHori;
    const blcokLocY = floor(blockCnt / numBlockHori);

    let sumRed, sumBlue, sumGreen;
    sumRed = 0;
    sumBlue = 0;
    sumGreen = 0;
    for (let y = blcokLocY * blockSize; y < (blcokLocY + 1) * blockSize; y++) {
      for (
        let x = blockLocX * blockSize;
        x < (blockLocX + 1) * blockSize;
        x++
      ) {
        const index = (x + y * capture.width) * 4;
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
  return blocksColor;
}

function soundGenerate(blocksColor) {
  for (let i = 0; i < numBlockVert; i++) {
    const freq = hue(blocksColor[blockIndicator + i * numBlockHori]);
    const brt = brightness(blocksColor[blockIndicator + i * numBlockHori]);

    osc[i].freq(map(freq, 0, 255, 50, 800));
    if (brt < 40) {
      osc[i].amp(0.06, 0.2);
    } else if (brt < 80) {
      osc[i].amp(0.1, 0.2);
    } else {
      osc[i].amp(0.08, 0.2);
    }
  }
}

function title() {
  textSize(50);
  textStyle(BOLD);
  textAlign(CENTER);
  text("Imagen Sonidos Web Op.1", 0, 200, width);

  textSize(30);
  textStyle(NORMAL);
  text("Created by Andy DK Lee", 0, 500, width);

  textSize(20);
  text("- Click or touch the screen to continue -", 0, 600, width);
}

function titleAnimation() {
  if (fadeIn === 0) {
    fill(textColor);
    title();
    fadeTime++;
    if (fadeTime === fadeStep) {
      textColor++;
      fadeTime = 0;
      if (textColor === 200) {
        fadeIn = 1;
      }
    }
  } else if (fadeIn === 1) {
    fill(200);
    title();
  } else {
    stroke(0);
    fill(textColor);
    title();
    fadeTime++;
    if (fadeTime === fadeStep) {
      textColor--;
      fadeTime = 0;
      if (textColor === 0) {
        clear();
        titleShowed = true;
        noStroke();
      }
    }
  }
}

function draw() {
  background(0);

  if (!titleShowed) {
    titleAnimation();
  }

  if (onAir && titleShowed) {
    capture.loadPixels();

    const blocksColor = video2Mozaic();
    drawBlocks(blocksColor);
    soundGenerate(blocksColor);

    if (prevMilSec + timeStep <= millis()) {
      blockIndicator++;
      if (blockIndicator === numBlockHori) {
        blockIndicator = 0;
      }
      prevMilSec = millis();
    }
  }
}

function mousePressed() {
  if (!titleShowed && fadeIn === 1) {
    getAudioContext().resume();
    fadeIn = 2;
  }
}

function mouseClicked() {
  if (titleShowed) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}
