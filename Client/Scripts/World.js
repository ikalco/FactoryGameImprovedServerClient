class World {
  static placeAngle = 0;
  static placeDirection = { x: 0, y: -1 };
  static canRotate = true;

  #map = [];
  #width;
  #height;

  constructor(maxTileWidth, maxTileHeight) {
    this.#width = Math.ceil(maxTileWidth / Chunk.Size);
    this.#height = Math.ceil(maxTileHeight / Chunk.Size);

    this.isCreated = false;

    // this.#map = TerrainGenrator.generateChunkMap(this.#width, this.#height);
  }

  update() {
    // height and width are number of chunks that fit onto screen
    let chunkTileSize = Tile.Size * Chunk.Size;
    let xOffset = Math.ceil(camera.getXOffset() / chunkTileSize);
    let yOffset = Math.ceil(camera.getYOffset() / chunkTileSize);

    for (let y = -1; y < this.#height; y++) {
      for (let x = -1; x < this.#width; x++) {
        let newX = x + xOffset;
        let newY = y + yOffset;

        if (this.#map[newX]) {
          if (!this.#map[newX][newY]) {
            continue;
            //this.#map[newX][newY] = TerrainGenrator.generateChunk(newX, newY);
          }
        } else {
          continue;
          //this.#map[newX] = [];
          //this.#map[newX][newY] = TerrainGenrator.generateChunk(newX, newY);
        }

        this.#map[newX][newY].update();
      }
    }
  }

  getChunk(chunkX, chunkY) {
    if (this.#map[chunkX]) {
      if (this.#map[chunkX][chunkY]) {
        return this.#map[chunkX][chunkY];
      }
    }
  }

  loadTiles(data_string) {
    data_string = data_string.substring(0, data_string.length - 1);
    let chunks_data = data_string.split("-");

    let chunks = new Array(recievedMapWidth).fill(0).map((_) => new Array(recievedMapHeight));

    let x = 0;
    let y = 0;

    for (const chunk of chunks_data) {
      let encoded_chunk_pieces = chunk.split(",");

      let chunkString = "";

      for (const piece of encoded_chunk_pieces) {
        let tileType = piece.split(".")[0];
        let tileCount = piece.split(".")[1];

        for (let i = 0; i < tileCount; i++) chunkString += tileType;
      }
      if (chunkString.length < 256) console.log(chunks_data.indexOf(chunk), chunk);

      chunks[x][y] = Chunk.createChunkFromString(x, y, chunkString);

      x++;
      if (x == recievedMapWidth) {
        x = 0;
        y++;
      }
    }

    console.log(chunks);
    this.#map = chunks;

    player.updatePos(Chunk.Size * Tile.Size * 20 - Tile.Size / 2, Chunk.Size * Tile.Size * 20 - Tile.Size / 2);

    this.isCreated = true;
  }

  get width() {
    return this.#width;
  }
  set width(w) {
    this.#width = w;
  }

  get height() {
    return this.#height;
  }
  set height(h) {
    this.#height = h;
  }

  static worldCordsToRealCords(x, y) {
    return createVector(x * Tile.Size, y * Tile.Size);
  }

  static realCordsToWorldCords(x, y) {
    return createVector(Math.floor(x / Tile.Size), Math.floor(y / Tile.Size));
  }

  static realCordsToWorldChunkCords(x, y) {
    return createVector(Math.floor(x / Tile.Size / Chunk.Size), Math.floor(y / Tile.Size / Chunk.Size));
  }

  static resetPlaceRotation() {
    World.placeAngle = 0;
    World.placeDirection = { x: 0, y: -1 };
  }

  static rotateLeft() {
    World.placeAngle -= HALF_PI;
    if (World.placeAngle == 0) {
      World.placeDirection = { x: 0, y: -1 };
    } else if (World.placeAngle == 90) {
      World.placeDirection = { x: 1, y: 0 };
    } else if (World.placeAngle == 180) {
      World.placeDirection = { x: 0, y: 1 };
    } else if (World.placeAngle == 270) {
      World.placeDirection = { x: -1, y: 0 };
    }
  }

  static rotateRight() {
    World.placeAngle += HALF_PI;
    if (World.placeAngle == 0) {
      World.placeDirection = { x: 0, y: -1 };
    } else if (World.placeAngle == 90) {
      World.placeDirection = { x: 1, y: 0 };
    } else if (World.placeAngle == 180) {
      World.placeDirection = { x: 0, y: 1 };
    } else if (World.placeAngle == 270) {
      World.placeDirection = { x: -1, y: 0 };
    }
  }
}
