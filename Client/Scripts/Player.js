function keyPressed() {
  Player.keysPressed[keyCode] = true;
  if (keyCode == 82 && World.canRotate) {
    if (World.placeAngle == 270) World.resetPlaceRotation();
    if (Player.keysPressed[16]) World.rotateLeft();
    else World.rotateRight();
    World.canRotate = false;
  }
}

function keyReleased() {
  Player.keysPressed[keyCode] = false;
  if (keyCode == 82) {
    World.canRotate = true;
  }
  if (keyCode >= 49 && keyCode <= 57) {
    player.inventory.selectItem(keyCode - 49);
    World.resetPlaceRotation();
  }
  if (keyCode == 48) {
    player.inventory.selectItem(9);
  }
  if (keyCode == 81) {
    Inventory.canSelect = true;
  }
}

class Player {
  static keysPressed = {};

  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.speed = 5;

    this.color = color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    this.inventory = new Inventory(this);
  }

  update() {
    if (Player.keysPressed[87]) {
      this.y -= this.speed;
      socket.send(`[ppos,${this.x}:${this.y}]`);
    }
    if (Player.keysPressed[83]) {
      this.y += this.speed;
      socket.send(`[ppos,${this.x}:${this.y}]`);
    }
    if (Player.keysPressed[65]) {
      this.x -= this.speed;
      socket.send(`[ppos,${this.x}:${this.y}]`);
    }
    if (Player.keysPressed[68]) {
      this.x += this.speed;
      socket.send(`[ppos,${this.x}:${this.y}]`);
    }

    this.inventory.update();
  }

  draw() {
    fill(this.color);
    rect(Math.floor(this.x - camera.getXOffset()), Math.floor(this.y - camera.getYOffset()), Tile.Size, Tile.Size);
    //text("admintest", this.x, this.y);
    this.inventory.draw();
  }

  updatePos(x, y) {
    this.x = x;
    this.y = y;

    socket.send(`[ppos,${this.x}:${this.y}]`);
  }
}
