class Debug {
  static #avgFps = 0;
  static #decay = 0.9;

  static drawFramerate() {
    Debug.#avgFps = Debug.#decay * Debug.#avgFps + (1.0 - Debug.#decay) * getFrameRate();
    let fpsString = "FPS: " + Math.floor(Debug.#avgFps);
    push();
    textSize(24);
    fill(255);
    text(fpsString, textWidth(""), textAscent(""));
    pop();
  }
}

function rotatedImage(img, x, y, w, h, angle) {
  push();
  imageMode(CENTER);
  translate(x + w / 2, y + h / 2);
  rotate(angle);
  translate(-(x + w / 2), -(y + h / 2));
  imageMode(CORNER);
  image(img, x, y, w, h);
  pop();
}
