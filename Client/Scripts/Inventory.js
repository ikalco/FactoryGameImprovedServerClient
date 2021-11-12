class Inventory {
  static canSelect = true;
  static lastPlaced;

  constructor(player) {
    this.items = new Array(40);

    for (let i = 0; i < this.items.length; i++) {
      this.items[i] = new InventorySlot();
    }

    this.items[0].setItemType(Conveyor.MaxStackSize, Conveyor);
    this.player = player;

    this.selectedItem = null;
  }

  update() {
    let mouseWorldCords = World.realCordsToWorldCords(mouseX + camera.getXOffset(), mouseY + camera.getYOffset());

    let chunkX = Math.floor(mouseWorldCords.x / Chunk.Size);
    let chunkY = Math.floor(mouseWorldCords.y / Chunk.Size);

    let tileX = Math.floor(mouseWorldCords.x - chunkX * Chunk.Size);
    let tileY = Math.floor(mouseWorldCords.y - chunkY * Chunk.Size);

    let chunk = world.getChunk(chunkX, chunkY);

    if (chunk == undefined) return;

    let clickedTile = chunk.getTile(tileX, tileY);
    chunk.highlightTile(tileX, tileY);

    if (Player.keysPressed[81] && Inventory.canSelect) {
      if (this.selectedItem == null) {
        if (clickedTile.machine != null) {
          let containsItem = this.contains(clickedTile.machine);
          if (containsItem != null) {
            this.selectItem(containsItem);
            World.placeAngle = clickedTile.machine.drawAngle;
            World.placeDirection = clickedTile.machine.direction;
          }
        }
      } else this.selectItem(null);
      Inventory.canSelect = false;
    }

    if (mouseIsPressed && !mouseOverGui) {
      if (mouseButton == LEFT) {
        if (Inventory.lastPlaced != clickedTile) {
          if (this.selectedItem != null) {
            let selectedItemClass = this.items[this.selectedItem].getItemType();
            if (clickedTile.machine == null || clickedTile.machine instanceof selectedItemClass) {
              if (selectedItemClass) {
                socket.send(`[addmac,${selectedItemClass.Type};${chunkX}:${chunkY}:${tileX}:${tileY}]`);
                clickedTile.machine = new selectedItemClass(chunkX, chunkY, clickedTile);
                Inventory.lastPlaced = clickedTile;
              }
            }
          }
        }
      }
      if (mouseButton == RIGHT) {
        if (clickedTile.machine != null) {
          socket.send(`[delmac,${chunkX}:${chunkY}:${tileX}:${tileY}]`);
          clickedTile.machine.delete();
          clickedTile.machine = null;
        }
      }
    }
  }

  draw() {
    if (this.selectedItem != null) {
      if (!this.items[this.selectedItem].getItemType()) return;
      push();
      tint(0, 150, 0);
      rotatedImage(
        Tile.Tiles[this.items[this.selectedItem].getItemType().Type],
        mouseX - Tile.Size / 2,
        mouseY - Tile.Size / 2,
        Tile.Size,
        Tile.Size,
        World.placeAngle
      );
      pop();
    }
  }

  selectItem(itemIndex) {
    if (itemIndex == null) this.selectedItem = null;
    if (this.items[itemIndex]) {
      this.selectedItem = itemIndex;
    }
  }

  contains(machine) {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].specified && machine instanceof this.items[i].itemType) return i;
    }

    return null;
  }
}

class InventorySlot {
  constructor() {
    this.specified = false;
  }

  addItems(numOfItems) {
    if (!this.specified) return;

    //console.log(this.numOfItems + numOfItems, this.itemType.MaxStackSize);

    if (this.numOfItems + numOfItems >= this.itemType.MaxStackSize) {
      let extraNumOfItems = Math.abs(this.itemType.MaxStackSize - (this.numOfItems + numOfItems));

      this.numOfItems += numOfItems - extraNumOfItems;

      return extraNumOfItems;
    }

    this.numOfItems += numOfItems;
    return 0;
  }

  subtractItems(numOfItems) {
    if (!this.specified) return;

    if (this.numOfItems - numOfItems <= 0) return false;
    this.numOfItems -= numOfItems;
    return true;
  }

  setItemType(numOfItems, itemType) {
    if (this.specified) return;

    this.numOfItems = 0;
    this.itemType = itemType;

    this.specified = true;
    if (this.addItems(numOfItems) > 0) throw console.error("ItemStackError: You can only create an item stack with a lower numOfItems given than maxStackSize");
  }

  getItemType() {
    if (this.specified) {
      return this.itemType;
    }
  }
}
