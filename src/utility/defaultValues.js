export const LVL_DEFAULT = {
  TILE_WIDTH: 50,
  TILE_HEIGHT: 2,
  TILE_DEPTH: 50,
  WALL_WIDTH: 50,
  WALL_HEIGHT: 100,
  WALL_DEPTH: 50,
  MAP_DEPTH: 100,
  MAP_WIDTH: 50
};

export const GEN_OPTIONS = {
  SHOW_TILES: true,
  SHOW_WALLS: true,
  FPS_CAM: false
};

/*************DUNGEON DEFAULT VALUES */
export const DG_DEFAULT = {
  WIDTH: 10,
  HEIGHT: 15,
  MIN_ROOM_WIDTH: 3,
  MAX_ROOM_WIDTH: 11,
  MIN_ROOM_HEIGHT: 3,
  MAX_ROOM_HEIGHT: 9,
  IDEAL_COUNT: 25,
  RETRY_COUNT: 100,
  ROOMIFY: false
};

export const TILE = {
  VOID: 0,
  FLOOR: 1,
  WALL: 2,
  DOOR: 3,
  SPECIAL_DOOR: 4,
  ENTER: 5,
  EXIT: 6
};

export const LM = {
  DARK: 0,
  SHADY: 1,
  OVERCAST: 2,
  BRIGHT: 4
};

export const ROOM_TYPES = [
  "A1",
  "B1",
  "B2",
  "B3",
  "B4",
  "C1",
  "C2",
  "D1",
  "D2",
  "D3",
  "D4",
  "E1",
  "E2",
  "E3",
  "E4"
];

export const DISTANCE_BETWEEN_ROOMS = 2;

/*************** ROOMGEN DEFAULT VALS ***************/
export const RG_DEFAULT = {
  width: 7,
  height: 7,
  treasure: false,
  litter: 0.0,
  chasm: false,
  holes: 0,
  circle: false,
  decor: false,
  gashes: 0
};

export const MIN_SIZE = 5;
export const MAX_SIZE = 17;

export const EDGE = {
  WALL: "wall",
  HOLE: "hole",
  NONE: "none"
};
export const DECOR_LOC = {
  ANY: "any",
  CENTRAL: "central",
  EDGE: "edge"
};

export const LAYERS = ["floor", "mid", "ceiling"];

export const RG_ROOM_TYPES = {
  A1: ["n", "e", "s", "w"],
  B1: ["n", "e"],
  B2: ["e", "s"],
  B3: ["s", "w"],
  B4: ["w", "n"],
  C1: ["n", "s"],
  C2: ["e", "w"],
  D1: ["n"],
  D2: ["e"],
  D3: ["s"],
  D4: ["w"],
  E1: ["n", "e", "w"],
  E2: ["n", "e", "s"],
  E3: ["e", "s", "w"],
  E4: ["n", "s", "w"]
};

export const FLOOR = {
  CHASM: "chasm",
  BRIDGE: "bridge",
  SOLID: "solid",
  LITTER: "litter"
};

export const MID = {
  WALL: "wall",
  DOOR: "door",
  PILLAR: "pillar",
  TREASURE: "treasure"
};

export const BLOCK = {
  BLOCK: true,
  DECOR: "decor",
  SPECIAL: "special",
  FALL: "fall",
  FREE: false
};

/**********GRID DEFAULT VALUES */
export const DIRS = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 }
};
