class Chunk {
  static Size = 16;
  static DrawBorders = true;

  #tiles = [];
  #x;
  #y;

  constructor(x, y, tiles = undefined) {
    this.#x = x;
    this.#y = y;

    if (!tiles) this.#tiles = Chunk.#generateChunkTiles(x, y);
    else this.#tiles = tiles;
  }

  update() {
    let xOffset = this.#x * Chunk.Size;
    let yOffset = this.#y * Chunk.Size;

    for (let y = 0; y < Chunk.Size; y++) {
      for (let x = 0; x < Chunk.Size; x++) {
        if (this.#tiles[x][y]) {
          let tile = this.#tiles[x][y];
          tile.x = Math.floor((x + xOffset) * Tile.Size - camera.getXOffset());
          tile.y = Math.floor((y + yOffset) * Tile.Size - camera.getYOffset());

          // if its outside of the screen dont draw it.
          if (tile.x > width || tile.x < -Tile.Size || tile.y < -Tile.Size || tile.y > height) continue;

          tile.draw();
        }
      }
    }

    // draw chunk borders
    if (!Chunk.DrawBorders) return;
    push();
    noFill();
    stroke(255, 0, 0);
    rect(
      this.#x * Chunk.Size * Tile.Size - camera.getXOffset(),
      this.#y * Chunk.Size * Tile.Size - camera.getYOffset(),
      Chunk.Size * Tile.Size,
      Chunk.Size * Tile.Size
    );
    pop();
  }

  highlightTile(x, y) {
    if (this.#tiles[x] && this.#tiles[x][y]) this.#tiles[x][y].highlight = true;
  }

  getTile(x, y) {
    return this.#tiles[x][y];
  }

  static #generateChunkTiles(chunkX, chunkY) {
    let tiles = [];
    for (let x = 0; x < Chunk.Size; x++) {
      tiles[x] = [];
      for (let y = 0; y < Chunk.Size; y++) {
        tiles[x][y] = new Tile(x + chunkX * Chunk.Size, y + chunkY * Chunk.Size, 0);
      }
    }
    return tiles;
  }

  static createChunkFromString(chunkX, chunkY, chunkString) {
    let tiles = [];
    for (let x = 0; x < Chunk.Size; x++) {
      tiles[x] = [];
      for (let y = 0; y < Chunk.Size; y++) {
        tiles[x][y] = new Tile(x + chunkX * Chunk.Size, y + chunkY * Chunk.Size, parseInt(chunkString.at(x * Chunk.Size + y)));
      }
    }
    return new Chunk(chunkX, chunkY, tiles);
  }
}
