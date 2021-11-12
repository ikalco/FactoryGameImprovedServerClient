class TerrainGenrator {
  static #noiseScale = 0.05;

  static setup() {
    noiseDetail(5, 0.5);
  }

  static generateMap(mapWidth, mapHeight) {
    let map = [];
    for (let i = 0; i < mapWidth; i++) {
      map[i] = [];
      for (let j = 0; j < mapHeight; j++) {
        map[i][j] = TerrainGenrator.#generateTile(i, j);
      }
    }
    return map;
  }

  static generateChunkMap(mapChunkWidth, mapChunkHeight) {
    let map = [];
    for (let i = 0; i < mapChunkWidth; i++) {
      map[i] = [];
      for (let j = 0; j < mapChunkHeight; j++) {
        map[i][j] = this.generateChunk(i, j);
      }
    }
    return map;
  }

  static generateChunk(chunkX, chunkY) {
    let chunkTiles = [];
    for (let i = 0; i < Chunk.Size; i++) {
      chunkTiles[i] = [];
      for (let j = 0; j < Chunk.Size; j++) {
        chunkTiles[i][j] = TerrainGenrator.#generateTile(i + chunkX * Chunk.Size, j + chunkY * Chunk.Size);
      }
    }

    return new Chunk(chunkX, chunkY, chunkTiles);
  }

  static #generateTile(x, y) {
    //return new Tile(x, y, 0)
    const v = noise((x - 10000) * TerrainGenrator.#noiseScale, (y - 10000) * TerrainGenrator.#noiseScale);

    // 0 = grass
    // 1 = sand
    // 2 = water

    if (v > 0.85) {
      return new Tile(x, y, 2);
    } else if (v > 0.7) {
      return new Tile(x, y, 1);
    } else if (v > 0) {
      return new Tile(x, y, 0);
    }
  }

  static generateTileType(x, y) {
    //return new Tile(x, y, 0)
    const v = noise((x - 10000) * TerrainGenrator.#noiseScale, (y - 10000) * TerrainGenrator.#noiseScale);

    // 0 = grass
    // 1 = sand
    // 2 = water

    if (v > 0.85) {
      return 2;
    } else if (v > 0.7) {
      return 1;
    } else if (v > 0) {
      return 0;
    }
  }
}
