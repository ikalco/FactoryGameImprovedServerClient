class Camera {
  #xOffset = 0;
  #yOffset = 0;

  constructor(xOffset, yOffset) {
    this.#xOffset = xOffset;
    this.#yOffset = yOffset;
  }

  centerOnPlayer(p) {
    this.#xOffset = p.x - width / 2 + Tile.Size / 2;
    this.#yOffset = p.y - height / 2 + Tile.Size / 2;
  }

  move(x, y) {
    this.#xOffset += x;
    this.#yOffset += y;
  }

  getXOffset() {
    return this.#xOffset;
  }

  getYOffset() {
    return this.#yOffset;
  }
}
