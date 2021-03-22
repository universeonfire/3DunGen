import { range, shuffle } from "../utility/random";
import Grid from "../utility/grid";
import GridCollection from "../utility/gridCollection";
import {
  RG_DEFAULT as DEFAULTS,
  MIN_SIZE,
  MAX_SIZE,
  DECOR_LOC,
  FLOOR,
  MID,
  BLOCK
} from "../utility/defaultValues";

class RoomGenerator {
  constructor(defaults = {}) {
    defaults.width = Math.floor(defaults.width);
    defaults.height = Math.floor(defaults.height);

    if (defaults.width % 2 === 0) defaults.width--;
    if (defaults.height % 2 === 0) defaults.height--;

    if (defaults.width < MIN_SIZE) {
      defaults.width = MIN_SIZE;
    } else if (defaults.width > MAX_SIZE) {
      defaults.width = MAX_SIZE;
    }
    if (defaults.height < MIN_SIZE) {
      defaults.height = MIN_SIZE;
    } else if (defaults.height > MAX_SIZE) {
      defaults.height = MAX_SIZE;
    }

    this.defaults = defaults;
    this.doors = [];

    this.layers = {};
  }

  initialize = (options) => {
    let opts = Object.assign({}, DEFAULTS, this.defaults, options);

    this.width = opts.width;
    this.height = opts.height;
    this.type = opts.type;
    this.pillars = opts.pillars;
    this.chasm = !!opts.chasm;
    this.circle = !!opts.circle;
    this.gashes = Number(opts.gashes);
    this.litter = opts.litter;
    this.holes = opts.holes;
    this.decor = opts.decor && opts.decor.length ? opts.decor : [];

    this.center = {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2)
    };

    this.focalpoint = opts.focalpoint
      ? opts.focalpoint
      : {
          x: range(2, this.width - 3),
          y: range(2, this.height - 3)
        };

    this.freeSpace = new GridCollection();
    this.layers = this.emptyLayers();
    this.basic = this.basicLayout();

    if (opts.treasure) this.addTreasure();
    if (opts.gashes) this.addGashes();
    if (opts.pillars) this.addPillars();
    if (opts.holes) this.addHoles();
    const freeSpace = this.prepareFreeSpace();
    if (opts.decor) this.addDecor(freeSpace);
    if (opts.litter) this.addLitter(freeSpace);

    return {
      size: {
        width: this.width,
        height: this.height
      },
      center: this.center,
      focalpoint: this.focalpoint,
      freespace: Array.from(this.freeSpace.each()),
      type: this.type,
      chasm: this.chasm,
      doors: this.doors,
      layers: this.layers
    };
  };

  basicLayout = () => {
    const radius = Math.ceil(Math.max(this.width, this.height) / 2) - 1.5;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let door = this.getDoor(x, y);
        this.layers.composite[y][x] = RoomGenerator.roomTemplate({
          x,
          y,
          door
        });

        if (this.chasm && this.circle) {
          if (Grid.distance({ x, y }, this.center) <= radius) {
            this.layers.floor[y][x] = FLOOR.SOLID;
          } else {
            this.layers.floor[y][x] = FLOOR.CHASM;
            this.layers.composite[y][x].block = BLOCK.FALL;
          }
        } else if (
          this.chasm &&
          (y === 0 || x === 0 || y === this.height - 1 || x === this.width - 1)
        ) {
          this.layers.floor[y][x] = FLOOR.CHASM;
          this.layers.composite[y][x].block = BLOCK.FALL;
          this.layers.composite[y][x].bridge = true;
        } else {
          this.layers.floor[y][x] = FLOOR.SOLID;
        }

        if (door) {
          this.layers.mid[y][x] = MID.DOOR;
          this.layers.composite[y][x].block = BLOCK.SPECIAL;
          if (this.chasm) this.layers.floor[y][x] = FLOOR.BRIDGE;
        }

        if (this.layers.floor[y][x] === FLOOR.SOLID) {
          this.freeSpace.add({ x, y }, {});
        }
        if (
          !this.chasm &&
          !door &&
          (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1)
        ) {
          this.layers.composite[y][x].wall = true;
          this.layers.composite[y][x].block = true;
          this.layers.mid[y][x] = FLOOR.SOLID;
          this.freeSpace.destroyAtCoordinate({ x, y });
        }
      }
    }
  };

  getDoor = (x, y) => {
    for (let d of this.doors) {
      if (d.x === x && d.y === y) {
        return d.direction;
      }
    }
    return null;
  };

  emptyLayers = () => {
    let composite = [];
    let floor = [];
    let mid = [];
    let ceiling = [];

    for (let y = 0; y < this.height; y++) {
      composite[y] = [];
      floor[y] = [];
      mid[y] = [];
      ceiling[y] = [];
      for (let x = 0; x < this.width; x++) {
        composite[y][x] = null;
        floor[y][x] = null;
        mid[y][x] = null;
        ceiling[y][x] = null;
      }
    }

    return {
      composite,
      floor,
      mid,
      ceiling
    };
  };

  addTreasure = () => {
    let c = this.focalpoint;
    for (let y = c.y - 1; y <= c.y + 1; y++) {
      for (let x = c.x - 1; x <= c.x + 1; x++) {
        this.setProtect(x, y);
      }
    }
    this.layers.composite[c.y][c.x].treasure = true;
    this.layers.composite[c.y][c.x].block = BLOCK.SPECIAL;
    this.layers.mid[c.y][c.x] = MID.TREASURE;
  };

  prepareFreeSpace = () => {
    let freeSpace = shuffle(Array.from(this.freeSpace.each()));
    const dirs = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 }
    ];
    for (let fs of freeSpace) {
      fs.edge = false;
      for (let dir of dirs) {
        const d = {
          x: fs.x + dir.x,
          y: fs.y + dir.y
        };
        if (d.x < 0 || d.y < 0 || d.x >= this.width || d.y >= this.height) {
          continue;
        }
        if (this.layers.floor[d.y][d.x] === FLOOR.CHASM) {
          fs.edge = true;
          break;
        }
      }
    }

    return freeSpace;
  };

  addDecor = (freeSpace) => {
    let total = freeSpace.length;
    for (let decor of this.decor) {
      let count = decor.count
        ? decor.count
        : Math.ceil(decor.rate * total) || 0;
      const loc = decor.location;
      for (let fs of freeSpace) {
        if (fs.flush) continue;
        if (
          loc === DECOR_LOC.ANY ||
          (loc === DECOR_LOC.CENTRAL && !fs.edge) ||
          (loc === DECOR_LOC.EDGE && fs.edge)
        ) {
          this.layers.composite[fs.y][fs.x].decor = decor.id;
          this.layers.composite[fs.y][fs.x].block = BLOCK.DECOR;
          this.layers.mid[fs.y][fs.x] = decor.id;
          this.freeSpace.destroyAtCoordinate({ x: fs.x, y: fs.y });
          fs.flush = true;
          count--;
          if (count <= 0) break;
        }
      }
    }
  };
  addLitter = (freeSpace) => {
    let count = Math.ceil(this.litter * freeSpace.length);

    for (let fs of freeSpace) {
      if (fs.flush) continue;
      this.layers.floor[fs.y][fs.x] = FLOOR.LITTER;
      this.layers.composite[fs.y][fs.x].litter = true;
      count--;
      if (count <= 0) break;
    }
  };

  addGashes = () => {
    let potentials = [];
    for (let i = 0; i < Math.min(this.width, this.height) * 2; i++)
      potentials.push(i);
    potentials = shuffle(potentials).slice(0, this.gashes);
    for (let gash of potentials) {
      const anchor =
        gash <= Math.min(this.width, this.height) - 1
          ? { mode: "x", value: gash }
          : { mode: "y", value: gash - Math.min(this.width, this.height) };

      for (let i = 0; i < Math.min(this.width, this.height); i++) {
        const x = anchor.mode === "x" ? anchor.value : i;
        const y = anchor.mode === "y" ? anchor.value : i;
        if (anchor.mode === "x" && y === this.center.y) {
          this.setProtect(x, y);
          this.freeSpace.destroyAtCoordinate({ x, y });
          continue;
        } else if (anchor.mode === "y" && x === this.center.x) {
          this.setProtect(x, y);
          this.freeSpace.destroyAtCoordinate({ x, y });
          continue;
        }
        if (!this.isProtected(x, y) && !this.layers.composite[y][x].wall) {
          this.layers.floor[y][x] = FLOOR.CHASM;
          this.layers.composite[y][x].chasm = true;
          this.layers.composite[y][x].block = BLOCK.FALL;
          this.freeSpace.destroyAtCoordinate({ x, y });
        }
      }
    }
  };

  addHoles = () => {
    let holes = this.holes;
    let limit = Math.min(this.width, this.height) * 3;
    while (holes > 0 && limit > 0) {
      let x = range(0, this.width - 1);
      let y = range(0, this.height - 1);
      if (!this.isProtected(x, y) && !this.isBlocked(x, y)) {
        holes--;
        this.layers.floor[y][x] = FLOOR.CHASM;
        this.layers.composite[y][x].chasm = true;
        this.layers.composite[y][x].block = BLOCK.FALL;
        this.freeSpace.destroyAtCoordinate({ x, y });
      }
      limit--;
    }
  };

  addPillars = () => {
    let pillars = this.pillars;
    let limit = Math.min(this.width, this.height) * 3;
    while (pillars > 0 && limit > 0) {
      let x = range(0, this.width - 2);
      let y = range(0, this.height - 2);
      if (!this.isProtected(x, y) && !this.isBlocked(x, y)) {
        pillars--;
        this.layers.floor[y][x] = FLOOR.SOLID;
        this.layers.composite[y][x].pillar = true;
        this.layers.mid[y][x] = MID.PILLAR;
        this.freeSpace.destroyAtCoordinate({ x, y });
      }
      limit--;
    }
  };
  setProtect = (x, y, protect = true) => {
    if (protect) this.freeSpace.destroyAtCoordinate({ x, y });
    this.layers.composite[y][x].protected = protect;
  };
  isProtected = (x, y) => {
    return this.layers.composite[y][x].protected;
  };

  isBlocked = (x, y) => {
    return !!this.layers.composite[y][x].block;
  };
  static roomTemplate({ x, y, door }) {
    return {
      x,
      y,
      door,
      wall: false,
      block: BLOCK.FREE,
      protected: !!door
    };
  }
}
export default RoomGenerator;
