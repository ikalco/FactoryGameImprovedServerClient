/**
 * @param  {} x
 * @param  {} y
 * @param  {} tile
 * @param  {} machineType
 */
class Machine {
  static ConstructorsFromType = [];

  constructor(chunkX, chunkY, tile, machineType) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;
    this.tile = tile;
    this.machineType = machineType;

    this.tileWidth = 1;
    this.tileHeight = 1;

    this.highlight = false;

    this.direction = World.placeDirection;

    if (World.placeAngle == 0) {
      this.direction = createVector(0, -1);
    } else if (World.placeAngle == 90) {
      this.direction = createVector(1, 0);
    } else if (World.placeAngle == 180) {
      this.direction = createVector(0, 1);
    } else if (World.placeAngle == 270) {
      this.direction = createVector(-1, 0);
    }

    this.drawAngle = World.placeAngle;

    this.tile.tileType = this.machineType;
  }

  draw(x, y) {
    rotatedImage(Tile.Tiles[this.machineType], x, y, Tile.Size, Tile.Size, this.drawAngle);
  }

  delete() {
    this.tile.tileType = this.tile.originalTileType;
    this.tile.machine = null;
  }
}
