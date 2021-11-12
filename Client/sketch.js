let player, world, camera;
let atlasImage;
let mouseOverGui = false;

function preload() {
  atlasImage = loadImage("./assets/atlas.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // To be able to right click delete a block
  document.addEventListener("contextmenu", (event) => event.preventDefault());

  Tile.Width = Math.floor(width / Tile.Size);
  Tile.Height = Math.floor(height / Tile.Size);

  // Terrain Tiles
  let grassImage = atlasImage.get(0, 0, 32, 32);
  let sandImage = atlasImage.get(32, 0, 32, 32);
  let waterImage = atlasImage.get(64, 0, 32, 32);

  // Machines
  let conveyorImage = atlasImage.get(96, 0, 32, 32);

  // Items
  //let ironResourceItem = atlasImage.get(100, 100, Item.Size, Item.Size);

  // Terrain Tiles
  Tile.Tiles[0x000000] = grassImage;
  Tile.Tiles[0x000001] = sandImage;
  Tile.Tiles[0x000002] = waterImage;

  // Machines
  Tile.Tiles[0x100000] = conveyorImage;
  Machine.ConstructorsFromType[0x100000] = Conveyor;

  // Items
  //Item.Items[0x000001] = ironResourceItem;

  TerrainGenrator.setup();

  camera = new Camera(0, 0);

  world = new World(Tile.Width, Tile.Height);
  player = new Player(Math.floor(Tile.Width / 2) * Tile.Size - Tile.Size / 2, Math.floor(Tile.Height / 2) * Tile.Size - Tile.Size / 2);

  connectToServer();
}

function draw() {
  if (!world.isCreated) return;
  background(0);

  player.update();
  camera.centerOnPlayer(player);

  world.update();

  player.draw();

  OtherPlayer.drawOtherPlayers();

  Debug.drawFramerate();
}

function windowResized(e) {
  resizeCanvas(windowWidth, windowHeight);

  Tile.Width = Math.floor(width / Tile.Size);
  Tile.Height = Math.floor(height / Tile.Size);

  world.width = Math.ceil(Tile.Width / Chunk.Size);
  world.height = Math.ceil(Tile.Height / Chunk.Size);
}
