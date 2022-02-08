const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.addEventListener("click", e => {
    const xy = [e.clientX, e.clientY].map(Math.floor);
    console.log(xy);

    if (p1) drawFn(p1, xy);
    else p1 = xy;
});

const width = 800;
const height = 600;

canvas.width = width;
canvas.height = height;

let drawFn;
let p1 = null;

const main = data => {

    const [wh, valuesString] = data.split("\n");
    const [width, height] = wh.split(", ").map(Number);

    const values = valuesString.split(", ").map(Number);

    const map = Array(height).fill(null).map(() => []);

    values.forEach((value, i) => {
        const x = i % width;
        const y = Math.floor(i / width);

        map[y][x] = value;
    })

    const markerX = 550;
    const markerY = 500;

    map[markerY][markerX] = 1;
    map[markerY + 1][markerX] = 1;
    map[markerY][markerX + 1] = 1;
    map[markerY + 1][markerX + 1] = 1;

    const adjMap = map.map((el, y) => el.map((value, x) => ({
        pos: [x, y],
        value: value,
        isInWater: value <= 0.2,
        adjs: null,
        distTo: Infinity, // aka h
        costFrom: Infinity, // aka g
        parent: null,
        isClosed: false,

        get f() {
            return this.distTo + this.costFrom; // potential overall cost
        }
    })));

    console.log(map[600 - 1][800 - 1]);

    adjMap.forEach(oEl => oEl.forEach((el) => el.adjs = getAdjs(el.pos, adjMap)));

    drawFn = fromToDrawerFactory(map, adjMap);
    drawFn([478, 112], [330, 467]);
};

const fromToDrawerFactory = (map, adjMap) => (from, to) => {
    p1 = null;

    renderMap(map);

    const t0 = performance.now();
    pathFind(adjMap[from[0]][from[1]], adjMap[to[0]][to[1]]);
    const t1 = performance.now();

    console.log(t1 - t0 + ' ms');
}

const renderMap = map => {
    const id = ctx.getImageData(0, 0, width, height);
    const pixels = id.data;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            // console.log(x, y, map.length, map[0].length);

            const [r, g, b] = map[y][x] <= 0.2 ? [32, 32, map[y][x] * 5 * 255 * 3/4 + 64] : [map[y][x] * 255, 255 - map[y][x] * 255, 0];

            const off = (x * id.width + y) * 4;
            pixels[off] = r;
            pixels[off + 1] = g;
            pixels[off + 2] = b;
            pixels[off + 3] = 255;
        }
    }

    ctx.putImageData(id, 0, 0);
};

const pathFind = (start, goal) => {

    start.costFrom = 0;
    start.distTo = calcDistFromTo(start, goal);

    const prioOpenSet = new Set();
    const openSet = new Set();

    openSet.add(start);

    while (openSet.size) {
        // let minH = [...openSet].reduce((prev, cur) => prev.f < cur.f ? prev : cur); // q

        const curSet = prioOpenSet.size ? prioOpenSet : openSet;

        let minVal = Infinity;
        let minF;

        for (const el of curSet) {
            const elf = el.f;
            if (elf < minVal) {
                minVal = elf;
                minF = el;
            }
        }

        curSet.delete(minF);

        for (const successor of minF.adjs) {

            if (successor === goal) {
                console.log("Done!");

                successor.parent = minF
                drawPath(successor);
                return;
            }

            const costFrom = minF.costFrom + calcDistFromTo(minF, successor);
            const potentialDistTo = calcDistFromTo(successor, goal);
            let newF;

            let dontPushAgain = false;
            if (openSet.has(successor) || prioOpenSet.has(successor)) {
                if (successor.costFrom <= costFrom) {
                    continue;

                } else {
                    newF = costFrom + potentialDistTo;

                    if (newF < minF.f && !prioOpenSet.has(successor)) {
                        openSet.delete(successor);

                    } else {
                        dontPushAgain = true;

                    }

                }

            } else if (successor.isClosed) {
                newF = costFrom + potentialDistTo;
                if (successor.f <= newF) {
                    continue;

                } else {
                    successor.isClosed = false;

                }
            }

            newF = newF ?? costFrom + potentialDistTo;
            successor.parent = minF;
            successor.distTo = potentialDistTo;
            successor.costFrom = costFrom;
            if (!dontPushAgain) (newF <= minF.f ? prioOpenSet : openSet).add(successor);
        }

        minF.isClosed = true;
    };

    console.log("error");
}

const drawPath = root => {
    console.log(root);
    ctx.strokeStyle = "#ffff00"
    ctx.beginPath();
    ctx.moveTo(root.pos[1], root.pos[0]);

    let cur = root.parent;
    while (cur = cur.parent) {
        ctx.lineTo(cur.pos[1], cur.pos[0]);
    }

    ctx.stroke();
    console.log("draw Done");
};

const getAdjs = (pos, adjMap) => {
    const ret = [];

    if (pos[0] > 0) ret.push([pos[0] - 1, pos[1]]);
    if (pos[1] > 0) ret.push([pos[0], pos[1] - 1]);
    if (pos[0] < width - 1) ret.push([pos[0] + 1, pos[1]]);
    if (pos[1] < height - 1) ret.push([pos[0], pos[1] + 1]);
    // *1
    if (pos[0] > 0 && pos[1] > 0) ret.push([pos[0] - 1, pos[1] - 1]);
    if (pos[0] < width - 1 && pos[1] > 0) ret.push([pos[0] + 1, pos[1] - 1]);
    if (pos[0] > 0 && pos[1] < height - 1) ret.push([pos[0] - 1, pos[1] + 1]);
    if (pos[0] < width - 1 && pos[1] < height - 1) ret.push([pos[0] + 1, pos[1] + 1]);

    // console.log(ret);
    return ret.map((pos) => adjMap[pos[1]][pos[0]]);
};

const removeFromArr = (arr, toRemove) => {
    const i = arr.indexOf(toRemove);
    if (i !== -1) {
        arr.splice(i, 1);
    }
};

const calcDistFromTo = (from, to) => {
    // console.log(from, to);
    const dx = Math.abs(from.pos[1] - to.pos[1]);
    const dy = Math.abs(from.pos[0] - to.pos[0]);

    const dist = Math.min(dx, dy) * 1.414 + Math.abs(dx - dy);
    const adjDist = dist * (to.isInWater ? 10 : 1);

    const gradient = Math.abs(Math.max(0.2, from.value) - Math.max(0.2, to.value)) ** 2 * 500; // 1000 := how much do you want to avoid going up?

    return adjDist + gradient;
};

fetch("./map7.csv").then(res => res.text()).then(main);