let socket;
let connected = false;

let currentSplitMessage = "";
let currentlyMultiMessage = false;

let header = null;
let data = "";

let recievedMapWidth = false;
let recievedMapHeight = false;

function connectToServer() {
  // connect to server

  socket = new WebSocket("ws://" + window.location.hostname + ":2345");

  socket.onopen = function (event) {
    connected = true;
  };

  socket.onmessage = function (event) {
    if (header == null && !event.data.includes("HEADER")) {
      processIncomingData(event.data);
    }
    if (header == 0x3 && !recievedMapHeight && !recievedMapWidth) {
      recievedMapWidth = parseInt(event.data.split(",")[0]);
      recievedMapHeight = parseInt(event.data.split(",")[1]);
      header = null;
    }
    if (header == 0x0) {
      processIncomingData(event.data);
      header = null;
    }
    if (event.data == "HEADER:0x0") header = 0x0;
    if (event.data == "HEADER:0x3") header = 0x3;
    if (event.data == "HEADER:0x2") {
      processMultiMessage(`${currentSplitMessage}`);
      header = null;
      currentlyMultiMessage = false;
      currentSplitMessage = "";
    }
    if (currentlyMultiMessage) currentSplitMessage += event.data;
    if (event.data == "HEADER:0x1") {
      header = 0x2;
      currentlyMultiMessage = true;
    }
  };

  socket.onclose = function (event) {
    alert("You have been disconnected from the websocket server!");
    location.reload();
  };
}

function processMultiMessage(data_string) {
  let header = data_string.substr(0, 4);
  if (header == "0x00") world.loadTiles(data_string.substr(4, data_string.length));
  if (header == "0x01") OtherPlayer.loadOtherPlayers(data_string.substr(4, data_string.length));
}

let id = null;
let loggedIn = false;
let username = "anonymous";

function processIncomingData(msg) {
  if (msg == "[ntfcn,invalidUser]") {
    document.getElementById("uname").value = "";
    document.getElementById("uname").placeholder = "Username already in use.";
    loggedIn = false;
  } else if (msg == "[ntfcn,validUser]") {
    document.getElementById("loginform").style = "display: none;";
    document.getElementById("main_game_gui").style = "visibility: visible;";
    username = document.getElementById("uname").value;
    loggedIn = true;
  }

  if (loggedIn) {
    let header = msg.split(",")[0].slice(1);
    let data = msg.split(",")[1];
    data = data.slice(0, data.length - 1);

    if (header == "ID") id = parseInt(data);
    if (header.split(":")[0] == "ppos") {
      let pname = header.split(":")[1];
      if (pname == username) return;

      let x = parseInt(data.split(":")[0]);
      let y = parseInt(data.split(":")[1]);

      OtherPlayer.otherPlayers[pname].x = x;
      OtherPlayer.otherPlayers[pname].y = y;
    }
    if (header == "ADDPLAYER") {
      let playerName = data.split(";")[0];
      if (playerName == username) return;

      let playerX = parseInt(data.split(";")[1].split(":")[0]);
      let playerY = parseInt(data.split(";")[1].split(":")[1]);

      OtherPlayer.otherPlayers[playerName] = new OtherPlayer(playerX, playerY, playerName);
    }
    if (header == "DELETEPLAYER") {
      if (data == username) return;
      delete OtherPlayer.otherPlayers[data];
    }
    if (header == "addmac") {
      let tileType = parseInt(data.split(";")[0]);
      let chunkTilePos = data.split(";")[1].split(":");

      let chunkX = parseInt(chunkTilePos[0]);
      let chunkY = parseInt(chunkTilePos[1]);

      let tileX = parseInt(chunkTilePos[2]);
      let tileY = parseInt(chunkTilePos[3]);

      let tile = world.getChunk(chunkX, chunkY).getTile(tileX, tileY);

      tile.machine = new Machine.ConstructorsFromType[tileType](chunkX, chunkY, tile);
    }
    if (header == "delmac") {
      let chunkTilePos = data.split(":");

      let chunkX = parseInt(chunkTilePos[0]);
      let chunkY = parseInt(chunkTilePos[1]);

      let tileX = parseInt(chunkTilePos[2]);
      let tileY = parseInt(chunkTilePos[3]);

      world.getChunk(chunkX, chunkY).getTile(tileX, tileY).machine.delete();
    }
  }
}

class OtherPlayer {
  static otherPlayers = [];

  constructor(x, y, pname) {
    this.x = x;
    this.y = y;
    this.color = color(Math.random() * 255, Math.random() * 255, Math.random() * 255);

    this.pname = pname;
  }

  draw() {
    fill(this.color);
    rect(Math.floor(this.x - camera.getXOffset()), Math.floor(this.y - camera.getYOffset()), Tile.Size, Tile.Size);
  }

  static drawOtherPlayers() {
    for (let [key, value] of Object.entries(OtherPlayer.otherPlayers)) {
      value.draw();
    }
  }

  static loadOtherPlayers(data_string) {
    let players = data_string.split(",");

    for (const player of players) {
      let playerName = player.split(";")[0];
      if (playerName == username) continue;

      let playerX = parseInt(player.split(";")[1].split(":")[0]);
      let playerY = parseInt(player.split(";")[1].split(":")[1]);

      OtherPlayer.otherPlayers[playerName] = new OtherPlayer(playerX, playerY, playerName);
    }
  }
}

function login() {
  //let loginform = document.getElementById("loginform");
  //let messagingApp = document.getElementById("messagingapp");
  let usernameInput = document.getElementById("uname");
  //console.log(usernameInput.value);
  //let password = document.getElementsByName("psw");
  //<label for="psw"><b>Password</b></label>
  //<input type="password" placeholder="Enter Password" name="psw" required>

  if (usernameInput.value.length < 118) {
    socket.send(`[uname,${usernameInput.value};${player.x}:${player.y}]`);
  } else {
    usernameInput.value = "";
    usernameInput.placeholder = "That username is too big!";
  }
}
