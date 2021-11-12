require 'socket' # Provides TCPServer and TCPSocket classes
require 'digest/sha1'
require 'json'
require "zlib"
require 'base64'
require './perlin_noise.rb'
require './http_server.rb'

def sendMessage (socket, msg, default_header=false)
  if (socket.closed?) then return false end
  #STDERR.puts "Sending message : #{ msg.inspect }"
  if (!default_header) then sendMessage(socket, "HEADER:0x0", true) end

  output = [0b10000001, msg.size, msg]

  socket.write(output.pack("CCA#{ msg.size }"))
  socket.flush();
end

def sendLargeMessage (socket, header, msg)
  #STDERR.puts "Sending message : #{ msg.inspect }"
  split_size = 125

  split_msgs = []
  
  size_left = msg.size
  while (size_left > 0)
    msg_length = [size_left, split_size - 1].min()
    split_text = msg[(msg.size-size_left)..(msg.size-size_left+msg_length)]
    split_msgs.append(split_text)
    size_left -= split_size
  end
  
  sendMessage(socket, "HEADER:0x1", true)
  sendMessage(socket, header, true)

  split_msgs.each { |sMsg| sendMessage(socket, sMsg, true)}

  sendMessage(socket, "HEADER:0x2", true)
end

def recvMessage (socket)
  first_byte = socket.getbyte

  if first_byte == nil then return end
  fin = first_byte & 0b10000000
  opcode = first_byte & 0b00001111

  if (opcode == 8) then return socket.close() end

  #STDERR.puts "First Byte: 0b#{ first_byte.inspect }"
  #STDERR.puts "Fin: 0b#{ fin.to_s(2) }"
  #STDERR.puts "Opcode: #{ opcode }"

  #raise "We don't support continuations" unless fin
  if (opcode == 1)
    #raise "We only support opcode 1 and 8" unless opcode == 1 || opcode == 8

    second_byte = socket.getbyte
    is_masked = second_byte & 0b10000000
    payload_size = second_byte & 0b01111111

    #puts payload_size

    #raise "All incoming frames should be masked according to the websocket spec" unless is_masked
    raise "We only support payloads < 126 bytes in length" unless payload_size < 126

    #STDERR.puts "Payload size: #{ payload_size } bytes"

    mask = 4.times.map { socket.getbyte }
    #STDERR.puts "Got mask: #{ mask.inspect }"

    data = payload_size.times.map { socket.getbyte }
    #STDERR.puts "Got masked data: #{ data.inspect }"

    unmasked_data = data.each_with_index.map { |byte, i| byte ^ mask[i % 4] }
    #STDERR.puts "Unmasked the data: #{ unmasked_data.inspect }"

    plainMsg = unmasked_data.pack('C*').force_encoding('utf-8')

    #STDERR.puts "Recieve Message: #{ plainMsg.inspect }"

    return plainMsg
    #raise "We only support opcode 1 and 8"
  end
end

def websocketHandshake (socket)
  # Read the HTTP request. We know it's finished when we see a line with nothing but \r\n
  http_request = ""
  while (line = socket.gets) && (line != "\r\n")
    http_request += line
  end


  # Grab the security key from the headers. If one isn't present, close the connection.
  if matches = http_request.match(/^Sec-WebSocket-Key: (\S+)/)
    websocket_key = matches[1]
    #STDERR.puts "Websocket handshake detected with key: #{ websocket_key }"
  else
    STDERR.puts "Aborting non-websocket connection"
    socket.close
    return
  end


  response_key = Digest::SHA1.base64digest([websocket_key, "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"].join)
  #STDERR.puts "Responding to handshake with key: #{ response_key }"

  socket.write <<-eos
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: #{ response_key }

  eos

  #STDERR.puts "Handshake completed."
end

module TerrainGenerator
  @@noiseScale = 0.05

  def self.generateChunkMap(mapChunkWidth, mapChunkHeight)
    map = []
    for i in 0..mapChunkWidth - 1
      map[i] = []
      for j in 0..mapChunkHeight - 1
        map[i][j] = TerrainGenerator::generateChunk(i, j)
      end
    end
    return map
  end

  def self.generateChunk(chunkX, chunkY)
    chunkTiles = []
    for i in 0..Chunk.size - 1
      chunkTiles[i] = []
      for j in 0..Chunk.size - 1
        chunkTiles[i][j] = TerrainGenerator::generateTile(i + chunkX * Chunk.size, j + chunkY * Chunk.size)
        #puts chunkTiles[i][j].tileType
      end
    end

    return Chunk.new(chunkX, chunkY, chunkTiles)
  end

  def self.generateTile(x, y)
    #return new Tile(x, y, 0)
    v = Noise2D((x - 10000) * TerrainGenerator::noiseScale, (y - 10000) * TerrainGenerator::noiseScale)

    # 0 = grass
    # 1 = sand
    # 2 = water

    if (v > 0.85)
      #puts "#{v}a"
      return Tile.new(x, y, 2)
    elsif (v > 0.7)
      #puts "#{v}b"
      return Tile.new(x, y, 1)
    else (v > 0)
      #puts "#{v}c"
      return Tile.new(x, y, 0)
    end
  end

  def self.noiseScale
    return @@noiseScale
  end
end

class Tile
  @@tiles = []
  @@size = 32
  @@width = 0
  @@geight = 0

  def initialize(x, y, tileType)
    @x = x
    @y = y
    @tileType = tileType

    @machine = nil
  end

  attr_reader :x, :y, :tileType, :machine
  attr_writer :machine

  def self.tiles 
    return @@tiles 
  end
  def self.tiles=(tiles)
    @@tiles = tiles
  end

  def self.size
    return @@size
  end
  def self.size=(size)
    @@size = size
  end

  def self.width
    return @@width
  end
  def self.width=(width)
    @@width = width
  end

  def self.height
    return @@height
  end
  def self.height=(height)
    @@height = height
  end
end

class Chunk
  @@size = 16

  def initialize(x, y, tiles = nil)
    @x = x
    @y = y

    if ((tiles == nil)) then @tiles = Chunk.generateChunkTiles(x, y)
    else @tiles = tiles end
  end

  def update()
    for x in @tiles
      for y in @tiles[x]
        @tiles[x][y].update()
      end
    end
  end

  def getTile(x, y)
    if (!@tiles[x].nil?)
      if (!@tiles[x][y].nil?)
        return @tiles[x][y]
      end
    end
  end

  def encode_as_string()
    # we will count up the amount of types of tiles in a row
    # save the entire sequence of that and return it

    returnString = ""

    tileCount = 0
    currentType = nil

    for x in @tiles
      for tile in x
        if (currentType == nil)
          currentType = tile.tileType
        end
        if (tile.tileType == currentType) 
          tileCount += 1
        else
          returnString.concat("#{currentType}.#{tileCount},")
          currentType = tile.tileType
          tileCount = 1
        end
      end
    end

    returnString.concat("#{currentType}.#{tileCount}")

    return returnString
  end

  def encode_machines_as_string()
    # we will count up the amount of types of tiles in a row
    # save the entire sequence of that and return it

    returnString = ""

    tileCount = 0
    currentType = nil

    for x in @tiles
      for tile in x
        if (currentType == nil)
          currentType = tile.machine
        end
        if (tile.machine == currentType) 
          tileCount += 1
        else
          returnString.concat("#{currentType}.#{tileCount},")
          currentType = tile.machine
          tileCount = 1
        end
      end
    end

    returnString.concat("#{currentType}.#{tileCount}")

    return returnString
  end

  def self.size
    return @@size
  end

  def self.generateChunkTiles(chunkX, chunkY)
    tiles = []
    for x in 0..Chunk.size - 1
      tiles[x] = []
      for y in 0..Chunk.size - 1
        tiles[x][y] = Tile.new(x + chunkX * Chunk.size, y + chunkY * Chunk.size, 0)
      end
    end
    return tiles
  end

  attr_reader :tiles, :x, :y
end

class World 
  def initialize(chunkWidth, chunkHeight)
    @map = TerrainGenerator::generateChunkMap(chunkWidth, chunkHeight)
  end

  def update()
    chunkTileSize = Tile.size * Chunk.size
    xOffset = ($camera.getXOffset() / chunkTileSize).ceil()
    yOffset = ($camera.getYOffset() / chunkTileSize).ceil()

    for y in -1..@height
      for x in -1..@width
        newX = x + xOffset
        newY = y + yOffset

        if (@map[newX])
          if (!@map[newX][newY])
            @map[newX][newY] = TerrainGenerator::generateChunk(newX, newY)
          end
        else
          @map[newX] = []
          @map[newX][newY] = TerrainGenerator::generateChunk(newX, newY)
        end

        @map[newX][newY].update()
      end
    end
  end

  def getChunk(chunkX, chunkY)
    if (!@map[chunkX].nil?)
      if (!@map[chunkX][chunkY].nil?)
        return @map[chunkX][chunkY]
      end
    end
  end

  def getTilesAsString()
    # need to send size of chunks first (16x16)
    # then we can go through all our chunks
    # for each one we will count up the amount of types of tiles in a row
    # save the entire sequence of that and return it

    encodedChunks = ""

    # assuming the size of chunks has already been sent
    # and the width and height amounts of chunks have been sent
    for x in @map
      for chunk in x
        encodedChunks.concat("#{chunk.encode_as_string()}-")
      end
    end

    return encodedChunks
  end

  def getMachinesAsString()
    # need to send size of chunks first (16x16)
    # then we can go through all our chunks
    # for each one we will count up the amount of types of tiles in a row
    # save the entire sequence of that and return it

    encodedChunks = ""

    # assuming the size of chunks has already been sent
    # and the width and height amounts of chunks have been sent
    for x in @map
      for chunk in x
        encodedChunks.concat("#{chunk.encode_machines_as_string()}-")
      end
    end

    return encodedChunks
  end

  attr_reader :width, :height, :map
  attr_writer :width, :height
end

class Client
  def initialize(socket, id, name, x, y)
      @socket = socket
      @name = name
      @id = id

      @x = x;
      @y = y;
  end

  def updatePos(x, y)
    @x = x
    @y = y

    # send to all clients
    for selectClient in $clients
      if (selectClient == self) then next end
      sendMessage(selectClient.socket, "[ppos:#{@name},#{@x}:#{@y}]", true)
    end
  end

  def self.getAllClientsAsString()
    returnString = ""

    for client in $clients
      returnString.concat("#{client.name};#{client.x}:#{client.y},")
    end

    return returnString[0..-2]
  end

  attr_reader :socket, :name, :id, :x, :y
  attr_writer :socket, :name, :id, :x, :y
end

webSocketServer = TCPServer.new 2345

$clients = Array.new()
$usernames = Array.new()

worldWidth = 40
worldHeight = 40
world = World.new(worldWidth, worldHeight)

loop do
  # websocket loop  
  Thread.start(webSocketServer.accept) do |socket|
    websocketHandshake socket

    id = nil
    client = nil

    # determining client id and username
    while (true) do
      if (socket.closed?) then break end
      # when someone joins we wait until they send us a username
      # when they do then we send them an id and add them to the clients list

      userMsg = recvMessage socket
      if (userMsg == nil) then next end

      if userMsg[0] != "[" then next end
      if userMsg[-1] != "]" then next end        
      if !userMsg.include? "," then next end

      # gets the value [HERE,text]              
      header = userMsg.split(/,/)[0][1..-1]
      if header == nil then next end
      # gets the value [msg,HERE]        
      data = userMsg.split(/,/)[1][0..-2]
      if data == nil then next end

      username = data.split(/;/)[0]
      if username == nil then next end

      if header == "uname"
          # search through usernames list to see if the user is already made
          if $usernames.include? username
              # if it is then we send back a notification saying that the user is already made
              sendMessage(socket, "[ntfcn,invalidUser]")
              next
          else
              # if it isn't then we send an id (the length of the usernames list)
              xPos, yPos = data.split(/;/)[1].split(/:/)
              if (xPos == nil || yPos == nil) then next end
              id = $clients.length
              $clients[id] = Client.new(socket, id, username, xPos, yPos)
              client = $clients[id]
              $usernames[id] = username
              #STDERR.puts usernames.inspect
              STDERR.puts "Connected to Client #{ id }: #{ $usernames[id] }"
              sendMessage(socket, "[ntfcn,validUser]")
              sendMessage(socket, "[ID,#{ id }]")
              break
          end
      else
          next
      end
    end

    if (id == nil || client == nil || socket.closed?)
      socket.close
    else
      # send tiles
      sendMessage(client.socket, "HEADER:0x3", true)
      sendMessage(client.socket, "#{worldWidth},#{worldHeight}", true)
      sendLargeMessage(client.socket, "0x00", world.getTilesAsString())

      # send this new player to all other player
      for selectClient in $clients
        sendMessage(selectClient.socket, "[ADDPLAYER,#{client.name};#{client.x}:#{client.y}]")
      end

      # send all previous players to this player
      sendLargeMessage(client.socket, "0x01", Client.getAllClientsAsString())
    end

    while (true) do
      if (socket.closed?) then break end

      # recieve a message from the socket
      userMsg = recvMessage socket
      if (userMsg == nil) then next end

      if userMsg[0] != "[" then next end
      if userMsg[-1] != "]" then next end        
      if !userMsg.include? "," then next end

      # gets the value [HERE,text]              
      header = userMsg.split(/,/)[0][1..-1]
      if header == nil then next end
      # gets the value [msg,HERE]        
      data = userMsg.split(/,/)[1][0..-2]
      if data == nil then next end

      if (header == "ppos") 
        client.updatePos(data.split(/:/)[0].to_i(), data.split(/:/)[1].to_i())
      end

      if (header == "addmac")
        tileType = data.split(/;/)[0].to_i()
        chunkTilePos = data.split(/;/)[1].split(/:/)

        chunkX = chunkTilePos[0].to_i()
        chunkY = chunkTilePos[1].to_i()

        tileX = chunkTilePos[2].to_i()
        tileY = chunkTilePos[3].to_i()

        world.getChunk(chunkX, chunkY).getTile(tileX, tileY).machine = tileType

        for selectClient in $clients
          if (selectClient == client) then next end
          sendMessage(selectClient.socket, "[addmac,#{tileType};#{chunkX}:#{chunkY}:#{tileX}:#{tileY}]")
        end
      end

      if (header == "delmac")
        chunkTilePos = data.split(/:/)

        chunkX = chunkTilePos[0].to_i()
        chunkY = chunkTilePos[1].to_i()

        tileX = chunkTilePos[2].to_i()
        tileY = chunkTilePos[3].to_i()

        world.getChunk(chunkX, chunkY).getTile(tileX, tileY).machine = nil

        for selectClient in $clients
          if (selectClient == client) then next end
          sendMessage(selectClient.socket, "[delmac,#{chunkX}:#{chunkY}:#{tileX}:#{tileY}]")
        end
      end
    end

    if (client != nil)
      # the socket has been closed
      STDERR.puts "Disconnected from client #{client.id}: #{$usernames[id]}"

      nameToRemove = client.name

      $clients.delete_at(id)
      $usernames.delete_at(id)
      
      for selectClient in $clients
        sendMessage(selectClient.socket, "[DELETEPLAYER,#{nameToRemove}]")
      end

      # need to resend all ids since an id was destroyed
      
      for selectClient in 0...$clients.length
          $clients[selectClient].id = selectClient;
          sendMessage($clients[selectClient].socket, "[ID,#{ selectClient }]")
      end
    end

    socket.close()
  end
end

webSocketServer.close