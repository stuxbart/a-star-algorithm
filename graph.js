class Graph {
  nodes = [];
  startNode = null;
  endNode = null;
  path = [];

  constructor(rows = 50, cols = 25, spacing = 30) {
    // initialize grid
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const node = new GraphNode(
          i * spacing + 20 + (Math.random() - 0.5) * 20,
          j * spacing + 20 + (Math.random() - 0.5) * 20
        );
        if (Math.random() < 0.3) {
          node.wall = true;
        }
        this.nodes.push(node);
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const node = this.nodes[i * cols + j];
        if (j > 0) {
          node.addNeighbour(this.nodes[i * cols + j - 1]);
        }
        if (j < cols - 1) {
          node.addNeighbour(this.nodes[i * cols + j + 1]);
        }
        if (i > 0) {
          node.addNeighbour(this.nodes[(i - 1) * cols + j]);
        }
        if (i < rows - 1) {
          node.addNeighbour(this.nodes[(i + 1) * cols + j]);
        }

        if (j > 0 && i > 0) {
          node.addNeighbour(this.nodes[(i - 1) * cols + j - 1]);
        }
        if (j > 0 && i < rows - 1) {
          node.addNeighbour(this.nodes[(i + 1) * cols + j - 1]);
        }
        if (j < cols - 1 && i < rows - 1) {
          node.addNeighbour(this.nodes[(i + 1) * cols + j + 1]);
        }
        if (j < cols - 1 && i > 0) {
          node.addNeighbour(this.nodes[(i - 1) * cols + j + 1]);
        }
      }
    }

    // select start / end node
    l1: for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const node = this.nodes[i * cols + j];
        if (!node.wall) {
          this.startNode = node;
          break l1;
        }
      }
    }

    l2: for (let i = rows - 1; i > -1; i--) {
      for (let j = cols - 1; j > -1; j--) {
        const node = this.nodes[i * cols + j];
        if (!node.wall) {
          this.endNode = node;
          break l2;
        }
      }
    }
    this.findPath();
  }

  startEndSet() {
    return this.startNode !== null && this.endNode !== null;
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      for (let j = 0; j < node.neighbours.length; j++) {
        const neighbour = node.neighbours[j];
        ctx.strokeStyle = "rgb(200, 200, 200)";
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(neighbour.x, neighbour.y);
      }
    }
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgb(40, 70, 220)";
    ctx.beginPath();
    for (let i = 0; i < this.path.length - 1; i++) {
      const node = this.path[i];
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(this.path[i + 1].x, this.path[i + 1].y);
    }
    ctx.stroke();

    for (let i = 0; i < this.nodes.length; i++) {
      ctx.beginPath();
      const node = this.nodes[i];
      if (node === this.startNode) {
        ctx.fillStyle = "rgb(240, 20, 90)";
      } else if (node === this.endNode) {
        ctx.fillStyle = "rgb(0, 220, 220)";
      } else {
        ctx.fillStyle = "rgb(0, 0, 0)";
      }
      if (node.wall) {
        // ctx.arc(node.x, node.y, 8, 0, Math.PI * 2, true);
      } else {
        if (node === this.startNode || node === this.endNode) {
          ctx.arc(node.x, node.y, 5, 0, Math.PI * 2, true);
        }
      }
      ctx.fill();
    }
  }

  setStartNodeAt(x, y) {
    const node = this.getNodeAt(x, y);
    if (!node.wall) {
      this.startNode = node;
    }
  }

  selectEndNodeAt(x, y) {
    const node = this.getNodeAt(x, y);
    if (!node.wall) {
      this.endNode = node;
    }
  }

  getNodeAt(x, y) {
    let nearestNode = 0;
    let leastDistance = Infinity;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (!node.wall && _distance(x, y, node.x, node.y) < leastDistance) {
        leastDistance = _distance(x, y, node.x, node.y);
        nearestNode = i;
      }
    }
    return this.nodes[nearestNode];
  }

  findPath() {
    const start = this.startNode;
    const end = this.endNode;
    const closedSet = [];
    const openSet = [start];
    const g_score = new Map();
    const h_score = new Map();
    const f_score = new Map();
    const cameFrom = new Map();

    g_score.set(start, 0);
    h_score.set(start, distance(start, end));
    f_score.set(start, g_score.get(start) + h_score.get(start));

    while (openSet.length > 0) {
      let x = openSet.reduce((prev, current, i, arr) => {
        if (f_score.get(prev) > f_score.get(current)) {
          return current;
        } else {
          return prev;
        }
      }, openSet[0]);

      if (x === end) {
        console.log("Distance", Math.round(g_score.get(x)));
        this.setPath(cameFrom, end);
        return true;
      }

      openSet.splice(openSet.indexOf(x), 1);
      closedSet.push(x);

      for (const y of x.neighbours) {
        if (closedSet.includes(y)) {
          continue;
        }
        let tentative_g_score = g_score.get(x) + distance(x, y);
        let tentative_is_better = false;

        if (!openSet.includes(y)) {
          openSet.push(y);
          h_score.set(y, distance(y, end));
          tentative_is_better = true;
        } else if (tentative_g_score < g_score.get(y)) {
          tentative_is_better = true;
        }
        if (tentative_is_better) {
          cameFrom.set(y, x);
          g_score.set(y, tentative_g_score);
          f_score.set(g_score.get(y) + h_score.get(y));
        }
      }
    }
    console.log("Path not found");
    return false;
  }

  setPath(cameFrom, node) {
    this.path = [];

    while (cameFrom.has(node)) {
      this.path.push(node);
      node = cameFrom.get(node);
    }
    this.path.push(node);
  }
}

class GraphNode {
  x;
  y;
  wall = false;
  neighbours = [];

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  addNeighbour(node) {
    if (this.wall || node.wall) {
      return false;
    }
    if (!this.neighbours.includes(node)) {
      this.neighbours.push(node);
      return true;
    }
    return false;
  }
}

function distance(node1, node2) {
  return Math.sqrt(
    Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
  );
}

function _distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
