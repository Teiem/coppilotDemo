export const getAdjacents = (x, y) => [
    [x, y - 1], // top
    [x, y + 1], // bot
    [x - 1, y], // left
    [x + 1, y], // right
    [x + 1, y + 1], // bottomRight
    [x - 1, y + 1], // bottomLeft
    [x + 1, y - 1], // topRight
    [x - 1, y - 1], // topLeft
];