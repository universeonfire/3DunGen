class GridCollection {
  constructor() {
    this.coords = new Map();
    this.entries = new Set();
  }

  add = ({ x, y }, entry) => {
    if (this.entries.has(entry)) return false;
    if (this.coords.has(`${x},${y}`)) return false;
    this.entries.add(entry);
    this.coords.set(`${x},${y}`, entry);
    entry.x = x;
    entry.y = y;
    return true;
  };

  get = ({ x, y }) => {
    return this.coords.get(`${x},${y}`) || null;
  };

  has = ({ x, y }) => {
    return !!this.coords.get(`${x},${y}`);
  };

  destroyAtCoordinate = ({ x, y }) => {
    const entry = this.coords.get(`${x},${y}`);
    if (!entry) return false;
    if (!this.entries.has(entry)) return false;
    this.destroy(entry);
    return true;
  };

  destroy = (entry) => {
    if (!this.coords.has(`${entry.x},${entry.y}`)) return false;
    if (!this.entries.has(entry)) return false;
    this.coords.delete(`${entry.x},${entry.y}`);
    this.entries.delete(entry);
    return true;
  };

  moveAtCoordinate = (old, neo) => {
    const entry = this.coords.get(`${old.x},${old.y}`);
    if (!entry) return false;
    if (this.coords.get(`${neo.x},${neo.y}`)) return false;
    this.coords.delete(`${old.x},${old.y}`);
    this.coords.set(`${neo.x},${neo.y}`, entry);
    entry.x = neo.x;
    entry.y = neo.y;
    return true;
  };

  move = (entry, neo) => {
    if (!this.coords.has(`${entry.x},${entry.y}`)) return false;
    if (this.coords.get(`${neo.x},${neo.y}`)) return false;
    this.coords.delete(`${entry.x},${entry.y}`);
    this.coords.set(`${neo.x},${neo.y}`, entry);
    entry.x = neo.x;
    entry.y = neo.y;
    return true;
  };

  each = () => {
    return this.entries.values();
  };

  clear = () => {
    const count = this.entries.size;
    this.entries.clear();
    this.coords.clear();
    return count;
  };

  size = () => {
    return this.entries.size;
  };
}

export default GridCollection;
