class Tile {
  static Tiles = [];
  static Size = 32;
  static Width = 0;
  static Height = 0;

  constructor(x, y, tileType) {
    this.x = x;
    this.y = y;

    this.originalTileType = tileType;
    this.tileType = tileType;

    this.highlight = false;

    this.machine = null;
  }

  draw() {
    if (this.machine == null) {
      image(Tile.Tiles[this.tileType], this.x, this.y, Tile.Size, Tile.Size);
    } else {
      this.machine.draw(this.x, this.y);
    }

    if (this.highlight) {
      push();
      //fill(this.tileColor)
      noFill();
      strokeWeight(2);
      stroke(255);
      rect(this.x, this.y, Tile.Size, Tile.Size);
      this.highlight = false;
      pop();
    }
  }

  static getColorFromTileType(tileType) {
    if (tileType == 0) return color("#7ec850");
    else if (tileType == 1) return color("#eecda3");
    else if (tileType == 2) return color("#008dc4");
  }

  static getImageFromTileType(tileType) {
    if (tileType == 0) return grassImage;
    else if (tileType == 1) return sandImage;
    else if (tileType == 2) return waterImage;
  }
}
