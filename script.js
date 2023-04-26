const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const graph = new Graph(50, 25);
graph.draw(ctx);

let recentlySelected = 2;
let mouseHold = false;

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function onMouseDown(e) {
  if (recentlySelected !== 1) {
    graph.setStartNodeAt(e.x, e.y);
    recentlySelected = 1;
  } else {
    graph.selectEndNodeAt(e.x, e.y);
    recentlySelected = 2;
  }

  if (graph.startEndSet()) {
    graph.findPath();
  }
  mouseHold = true;
}

function onMouseUp() {
  mouseHold = false;
}

const onMouseMove = throttle((e) => {
  if (mouseHold) {
    if (recentlySelected === 1) {
      graph.setStartNodeAt(e.x, e.y);
    } else {
      graph.selectEndNodeAt(e.x, e.y);
    }

    if (graph.startEndSet()) {
      graph.findPath();
    }
  }
}, 50);

function loop() {
  graph.draw(ctx);
  window.requestAnimationFrame(loop);
}

window.addEventListener("resize", onResize);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("mousemove", onMouseMove);

onResize();
loop();
