import RoomGenerator from "./roomGen";
import {
  DG_DEFAULT as DEFAULT,
  TILE,
  LM,
  ROOM_TYPES,
  DISTANCE_BETWEEN_ROOMS
} from "../utility/defaultValues";

class DungeonGenerator {
  constructor(config) {
    if (!config) config = {};
    if (!config.room) config.room = {};

    this.maxWidth = config.width || DEFAULT.WIDTH;
    this.maxHeight = config.height || DEFAULT.HEIGHT;
    this.roomMinWidth = config.room.minWidth || DEFAULT.MIN_ROOM_WIDTH;
    this.roomMaxWidth = config.room.maxWidth || DEFAULT.MAX_ROOM_WIDTH;
    this.roomMinHeight = config.room.minHeight || DEFAULT.MIN_ROOM_HEIGHT;
    this.roomMaxHeight = config.room.maxHeight || DEFAULT.MAX_ROOM_HEIGHT;
    this.roomIdealCount = config.room.ideal || DEFAULT.IDEAL_COUNT;
    this.retryCount = config.retry || DEFAULT.IDEAL_COUNT;
    this.specialRoom = !!config.special;
    this.roomify = config.roomify || DEFAULT.ROOMIFY;
  }
  initialize = () => {
    this.world = null;
    this.rooms = {};
    this.doors = {};
    this.walls = [];
    this.entrance = null;
    this.exit = null;
    this.special = null;
    this.deadends = [];
    this.roomId = 0;
    this.doorId = 0;
    this.worldLightMap = [];

    this.createVoid();
    this.addStarterRoom();
    this.generateRooms();
    this.addSpecialRooms();
    this.buildWalls();

    return {
      width: this.maxWidth,
      height: this.maxHeight,
      entrance: this.entrance,
      exit: this.exit,
      deadends: this.deadends,
      special: this.special,
      door_count: this.doorId,
      doors: this.doors,
      room_count: this.roomId,
      rooms: this.rooms,
      walls: this.walls,
      world: this.world,
      worldLightMap: this.worldLightMap
    };
  };

  createVoid = () => {
    let world = [];
    let lightMap = [];
    for (let y = 0; y < this.maxHeight; y++) {
      world[y] = [];
      lightMap[y] = [];
      for (let x = 0; x < this.maxWidth; x++) {
        world[y][x] = TILE.VOID;
        lightMap[y][x] = LM.DARK;
      }
    }
    this.world = world;
    this.worldLightMap = lightMap;
  };

  getRoomDimensions = () => {
    return {
      width: randomOdd(this.roomMinWidth, this.roomMaxWidth),
      height: randomOdd(this.roomMinHeight, this.roomMaxHeight)
    };
  };
  addStarterRoom = () => {
    let dimensions = this.getRoomDimensions();
    let min_left = DISTANCE_BETWEEN_ROOMS;
    let max_left =
      this.maxWidth -
      (dimensions.width + DISTANCE_BETWEEN_ROOMS * 2) +
      DISTANCE_BETWEEN_ROOMS;
    let min_top = DISTANCE_BETWEEN_ROOMS;
    let max_top =
      this.maxHeight -
      (dimensions.height + DISTANCE_BETWEEN_ROOMS * 2) +
      DISTANCE_BETWEEN_ROOMS;
    let left = randomOdd(min_left, max_left);
    let top = randomOdd(min_top, max_top);
    this.addRoom(left, top, dimensions.width, dimensions.height);
  };

  addRoom = (left, top, width, height) => {
    let roomId = this.roomId++;

    this.rooms[roomId] = {
      left: left,
      top: top,
      width: width,
      height: height,
      id: roomId,
      walls: [],
      neighbors: [],
      doors: []
    };
    let decoratedRoom = this.roomify ? this.decorateRoom(width, height) : [];
    for (let y = top; y < top + height; y++) {
      for (let x = left; x < left + width; x++) {
        if (!this.roomify) this.world[y][x] = TILE.FLOOR;
        else {
          if (y - top < height && x - left < width) {
            this.world[y][x] = decoratedRoom.layers.mid[y - top][x - left];
            if (this.world[y][x] === null)
              this.world[y][x] = decoratedRoom.layers.floor[y - top][x - left];
          }
        }
      }
    }

    return roomId;
  };

  addFloor = (x, y) => {
    this.world[y][x] = TILE.FLOOR;
  };
  generateRooms = () => {
    let retries = this.retryCount;

    while (this.roomId < this.roomIdealCount) {
      if (!this.generateRoom() && --retries <= 0) break;
    }
  };

  generateRoom = () => {
    let slide = random(0, 3);
    let xDir = slide === 1 ? +1 : slide === 3 ? -1 : 0;
    let yDir = slide === 0 ? +1 : slide === 2 ? -1 : 0;
    let dimensions = this.getRoomDimensions();

    let top, left, name;

    if (slide === 0) {
      name = "south";
      top = DISTANCE_BETWEEN_ROOMS;
      left = randomOdd(
        DISTANCE_BETWEEN_ROOMS,
        this.maxWidth - dimensions.width - DISTANCE_BETWEEN_ROOMS * 2
      );
    } else if (slide === 1) {
      name = "east";
      top = randomOdd(
        DISTANCE_BETWEEN_ROOMS,
        this.maxHeight - dimensions.height - DISTANCE_BETWEEN_ROOMS * 2
      );
      left = DISTANCE_BETWEEN_ROOMS;
    } else if (slide === 2) {
      name = "north";
      top = this.maxHeight - dimensions.height - DISTANCE_BETWEEN_ROOMS;
      left = randomOdd(
        DISTANCE_BETWEEN_ROOMS,
        this.maxWidth - dimensions.width - DISTANCE_BETWEEN_ROOMS * 2
      );
    } else if (slide === 3) {
      name = "west";
      top = randomOdd(
        DISTANCE_BETWEEN_ROOMS,
        this.maxHeight - dimensions.height - DISTANCE_BETWEEN_ROOMS * 2
      );
      left = this.maxWidth - dimensions.width - DISTANCE_BETWEEN_ROOMS;
    }

    if (
      false !== this.collides(top, left, dimensions.width, dimensions.height)
    ) {
      return false;
    }

    let collidingRoom = null;

    while (
      false ===
      (collidingRoom = this.collides(
        top + yDir,
        left + xDir,
        dimensions.width,
        dimensions.height
      ))
    ) {
      top += yDir;
      left += xDir;

      if (this.invalid(top, left, dimensions.width, dimensions.height)) {
        return false;
      }
    }

    let newRoomId = this.addRoom(
      left,
      top,
      dimensions.width,
      dimensions.height
    );

    this.addDoorBetweenRooms(xDir, yDir, collidingRoom, newRoomId);

    return true;
  };

  collides = (top, left, width, height) => {
    let target = {
      top: top,
      left: left,
      width: width,
      height: height
    };

    for (let i = 0; i < this.roomId; i++) {
      let room = this.rooms[i];

      if (
        !(
          target.left > room.left + room.width ||
          target.left + target.width < room.left ||
          target.top > room.top + room.height ||
          target.top + target.height < room.top
        )
      ) {
        return room.id;
      }
    }

    return false;
  };

  invalid = (top, left, width, height) => {
    if (top <= DISTANCE_BETWEEN_ROOMS) {
      return true;
    } else if (left <= DISTANCE_BETWEEN_ROOMS) {
      return true;
    } else if (top + height >= this.maxHeight - DISTANCE_BETWEEN_ROOMS) {
      return true;
    } else if (left + width >= this.maxWidth - DISTANCE_BETWEEN_ROOMS) {
      return true;
    }

    return false;
  };

  buildWalls = () => {
    let rooms = this.rooms;
    let world = this.world;

    for (let i = 0; i < this.roomId; i++) {
      let room = rooms[i];

      for (let tx = room.left - 1; tx < room.left + room.width + 1; tx++) {
        this.addWall(tx, room.top - 1, room);
      }

      for (let ry = room.top; ry < room.top + room.height; ry++) {
        this.addWall(room.left + room.width, ry, room);
      }

      for (let bx = room.left - 1; bx < room.left + room.width + 1; bx++) {
        this.addWall(bx, room.top + room.height, room);
      }
      for (let ly = room.top; ly < room.top + room.height; ly++) {
        this.addWall(room.left - 1, ly, room);
      }
    }
  };

  addWall = (x, y, room) => {
    if (this.world[y][x] === TILE.VOID) {
      this.world[y][x] = TILE.WALL;
      this.walls.push([x, y]);
    }

    if (this.world[y][x] === TILE.VOID || this.world[y][x] === TILE.WALL) {
      room.walls.push([x, y]);
    }
  };

  addDoorBetweenRooms = (xDir, yDir, existingRoomId, newRoomId) => {
    let existingRoom = this.rooms[existingRoomId];
    let newRoom = this.rooms[newRoomId];

    let x, y, orientation;
    if (xDir === 1) {
      x = existingRoom.left - 1;
      y = random(
        Math.max(existingRoom.top, newRoom.top) + 1,
        Math.min(
          existingRoom.top + existingRoom.height,
          newRoom.top + newRoom.height
        ) - 2
      );
      orientation = "h";
    } else if (xDir === -1) {
      x = newRoom.left - 1;
      y = random(
        Math.max(newRoom.top, existingRoom.top) + 1,
        Math.min(
          newRoom.top + newRoom.height,
          existingRoom.top + existingRoom.height
        ) - 2
      );
      orientation = "h";
    } else if (yDir === -1) {
      x = random(
        Math.max(existingRoom.left, newRoom.left) + 1,
        Math.min(
          existingRoom.left + existingRoom.width,
          newRoom.left + newRoom.width
        ) - 2
      );
      y = newRoom.top - 1;
      orientation = "v";
    } else if (yDir === 1) {
      x = random(
        Math.max(newRoom.left, existingRoom.left) + 1,
        Math.min(
          newRoom.left + newRoom.width,
          existingRoom.left + existingRoom.width
        ) - 2
      );
      y = existingRoom.top - 1;
      orientation = "v";
    }
    this.addDoor(x, y, existingRoomId, newRoomId, orientation);
    this.rooms[existingRoomId].neighbors.push(newRoomId);
    this.rooms[newRoomId].neighbors.push(existingRoomId);
  };

  addSpecialRooms = () => {
    let deadends = [];
    let smallest = {
      id: null,
      area: Infinity
    };

    let room, area;
    for (let i = 0; i < this.roomId; i++) {
      room = this.rooms[i];
      if (room.neighbors.length === 1) {
        this.rooms[i].deadend = true;
        deadends.push(i);
        area = room.width * room.height;
        if (area < smallest.area) {
          smallest.id = i;
        }
      }
    }

    if (this.specialRoom && deadends.length >= 2) {
      let index = deadends.indexOf(smallest.id);
      deadends.splice(index, 1);

      let doorId = this.rooms[smallest.id].doors[0];
      let roomId = smallest.id;
      this.special = {
        roomId: roomId,
        doorId: doorId
      };

      let door = this.doors[doorId];
      door.special = true;
      this.rooms[roomId].special = true;
      this.world[door.y][door.x] = TILE.SPECIAL_DOOR;
    }

    shuffle(deadends);

    let enterRoomId = deadends.pop();

    if (typeof enterRoomId === "undefined")
      throw new Error("can not find a dead end for entry");

    let enter = this.randomNonEdgeInRoom(enterRoomId);

    this.world[enter.y][enter.x] = TILE.ENTER;
    this.enter = {
      x: enter.x,
      y: enter.y,
      roomId: enterRoomId
    };

    this.rooms[enterRoomId].enter = true;
    let enterDoor = this.rooms[enterRoomId].doors[0];
    this.doors[enterDoor].enter = true;

    let exitRoomId = deadends.pop();

    if (typeof exitRoomId === "undefined")
      throw new Error("can not find a dead end for exit");

    let exit = this.randomNonEdgeInRoom(exitRoomId);

    this.world[exit.y][exit.x] = TILE.EXIT;
    this.exit = {
      x: exit.x,
      y: exit.y,
      roomId: exitRoomId
    };

    this.rooms[exitRoomId].exit = true;
    let exitDoor = this.rooms[exitRoomId].doors[0];
    this.doors[exitDoor].exit = true;

    this.deadends = deadends;
  };

  randomNonEdgeInRoom = (roomId) => {
    let room = this.rooms[roomId];

    return {
      x: random(room.left + 1, room.left + room.width - 2),
      y: random(room.top + 1, room.top + room.height - 2)
    };
  };

  addDoor = (x, y, room1, room2, orientation) => {
    this.world[y][x] = TILE.DOOR;

    let doorId = this.doorId++;

    this.doors[doorId] = {
      x: x,
      y: y,
      id: doorId,
      orientation: orientation,
      rooms: [room1, room2]
    };

    this.rooms[room1].doors.push(doorId);
    this.rooms[room2].doors.push(doorId);

    return doorId;
  };

  decorateRoom = (w, h) => {
    let roomType = ROOM_TYPES[random(0, ROOM_TYPES.length)];
    let room = new RoomGenerator({
      width: w,
      height: h,
      doors: [this.doors]
    }).initialize({
      type: roomType,
      pillars: Math.random() < 0.5,
      treasure: Math.random() < 0.5,
      litter: random(0, 0.25),
      chasm: false,
      holes: random(0, 2),
      circle: Math.random() < 0.5,
      gashes: random(0, 2),
      decor: [
        { id: "cobweb", rate: random(0, 0.25), location: "any" },
        { id: "desk", count: random(0, 3), location: "central" },
        { id: "books", rate: random(0, 0.15), location: "edge" }
      ]
    });
    return room;
  };
}

const shuffle = (o) => {
  for (
    let j, x, i = o.length;
    i;
    j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x
  );
};

const random = (minNum, maxNum) => {
  let min = Math.floor(minNum);
  let max = Math.floor(maxNum);

  return Math.floor(Math.random() * (max + 1 - min) + min);
};

const randomOdd = (minNum, maxNum) => {
  let min = Math.floor(minNum);
  let max = Math.floor(maxNum);

  if (min % 2 === 0) min++;
  if (max % 2 === 0) max--;

  min -= 1;
  max -= 1;

  min /= 2;
  max /= 2;

  let result = Math.floor(Math.random() * (max + 1 - min) + min);

  result *= 2;
  result += 1;

  return result;
};

export default DungeonGenerator;
