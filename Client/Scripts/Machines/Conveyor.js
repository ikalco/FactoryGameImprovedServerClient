class Conveyor extends Machine {
  static MaxStackSize = 100;
  static Type = 0x100000;
  static MaxItemsPerSide = 4;

  #itemsLeft = [];
  #itemsRight = [];

  constructor(chunkX, chunkY, tile) {
    super(chunkX, chunkY, tile, Conveyor.Type);

    this.tileWidth = 1;
    this.tileHeight = 1;
  }

  update() {}

  moveConveyor(movingItems) {
    // every entity on top of this conveyor is moved in its direction
    /*
    for (item of movingItems) {
      item.y = constrain(item.y, this.y - Tile.Size, this.y + Tile.Size);
      item.y -= Conveyor.Speed;

      if (this.item.y == this.y - (Tile.Size + 1)) {
        this.item.arrNum[1]--;
      }
    }

    if (this.direction == "up") {
      this.movingItem.y = constrain(this.movingItem.y, this.y - this.h, this.y + this.h);
      this.movingItem.y -= player.conveyorSpeed;
      if (this.movingItem.y == this.y - (this.h + 1)) {
        this.movingItem.arrNum[1]--;
      }
    }
    if (this.direction == "down") {
      this.movingItem.y = constrain(this.movingItem.y, this.y - this.h, this.y + this.h);
      this.movingItem.y += player.conveyorSpeed;
      if (this.movingItem.y == this.y + (this.h + 1)) {
        this.movingItem.arrNum[1]++;
      }
    }
    if (this.direction == "right") {
      this.movingItem.x = constrain(this.movingItem.x, this.movingItem.x - this.w, this.x + this.w);
      this.movingItem.x += player.conveyorSpeed;
      if (this.movingItem.x == this.x + (this.w + 1)) {
        this.movingItem.arrNum[0]++;
      }
    }
    if (this.direction == "left") {
      this.movingItem.x = constrain(this.movingItem.x, this.movingItem.x - this.w, this.x + this.w);
      this.movingItem.x -= player.conveyorSpeed;
      if (this.movingItem.x == this.x - (this.w + 1)) {
        this.movingItem.arrNum[0]--;
      }
    }
    */
  }

  draw(x, y) {
    super.draw(x, y);
    //this.drawItems(x, y);
  }

  drawItems(x, y) {
    for (const item of this.#itemsLeft) {
      item.x = x;
      item.y = y;
      image(Item.Items[item.id], item.x, item.y, Item.Size, Item.Size);
    }
  }

  addItemLeft(item, numOfItems = 1) {
    if (!(item instanceof Item)) return;
    if (this.#itemsLeft.length + numOfItems <= Conveyor.MaxItemsPerSide) {
      let test = Math.min(Conveyor.MaxItemsPerSide - this.#itemsLeft.length, numOfItems);
      for (let i = 0; i < test; i++) {
        this.#itemsLeft.push(item);
      }
    }
  }

  addItemRight(item, numOfItems = 1) {
    if (!(item instanceof Item)) return;
    if (this.#itemsRight.length + numOfItems <= Conveyor.MaxItemsPerSide) {
      let test = Math.min(Conveyor.MaxItemsPerSide - this.#itemsRight.length, numOfItems);
      for (let i = 0; i < test; i++) {
        this.#itemsRight.push(item);
      }
    }
  }
}
/*
class Conveyor extends Cell {
  constructor(arrX, arrY, placeDir) {
    super(arrX, arrY);
    debug.numOfConveyors++;
    this.price = 5;
    gui.money -= this.price;
    this.whatAmI = 'Conveyor'
  }

  moveConveyor(movingItem) {
    this.movingItem = movingItem;
    if (this.direction == 'up') {
      this.movingItem.y = constrain(this.movingItem.y, this.y - this.h, this.y + this.h);
      this.movingItem.y -= player.conveyorSpeed;
      if (this.movingItem.y == this.y - (this.h+1)) {
        this.movingItem.arrNum[1]--;
      }
    }
    if (this.direction == 'down') {
      this.movingItem.y = constrain(this.movingItem.y, this.y - this.h, this.y + this.h);
      this.movingItem.y += player.conveyorSpeed;
      if (this.movingItem.y == this.y + (this.h+1)) {
        this.movingItem.arrNum[1]++;
      }
    }
    if (this.direction == 'right') {
      this.movingItem.x = constrain(this.movingItem.x, this.movingItem.x - this.w, this.x + this.w);
      this.movingItem.x += player.conveyorSpeed;
      if (this.movingItem.x == this.x + (this.w+1)) {
        this.movingItem.arrNum[0]++;
      }
    }
    if (this.direction == 'left') {
      this.movingItem.x = constrain(this.movingItem.x, this.movingItem.x - this.w, this.x + this.w);
      this.movingItem.x -= player.conveyorSpeed;
      if (this.movingItem.x == this.x - (this.w+1)) {
        this.movingItem.arrNum[0]--;
      }
    }
  }

  draw() {
    super.draw();
    drawPicture(conveyorPng, this.angle, this);
  }

  update() {
    super.update();
  }

}*/
