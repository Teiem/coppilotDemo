const startArr = [
    "003020600",
    "900305001",
    "001806400",
    "008102900",
    "700000008",
    "006708200",
    "002609500",
    "800203009",
    "005010300",
]

const {floor} = Math;

const groups = [
    (x, _) => x,
    (_, y) => y,
    (x, y) => floor(x / 3) * 3 + floor(y / 3)
]

const compileGroup = groupRule => {
    let compiled = [];

    for (const x of Array(9).keys()) {
        for (const y of Array(9).keys()) {
            const groupID = groupRule(x, y);

            if (groupID >= 0) {
                compiled[groupID] ? compiled[groupID].push([x, y]) : compiled[groupID] = [[x, y]];
            }
        }
    }

    return compiled.filter(Boolean);
};

const startArrToOptionsArr = arr => arr.map(row => row.split("").map(el => +el)).map(row => row.map(el => el === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [el]));

// TODO add detection of e.g. [[12, 23, 13]] to remove all other options of 1, 2 and 3 in the same group
// implementation, check every cell in group, is there an other cell that has at most ...
const solveOneStep = (arr, compiledGroups) => {
    const newArr = arr.map(el => el.slice());

    let flagHadEffect = false;

    // for each given cell, remove its digit from all groups this cell is in
    compiledGroups.forEach(group => group.forEach(([x, y]) => {
        const possibleSingle = newArr[x][y];
        if (possibleSingle.length === 1) {

            group.forEach(([x, y]) => {

                const cellToRemoveFrom = newArr[x][y];

                if (cellToRemoveFrom.length === 1) return;

                const indexOfCellContent = cellToRemoveFrom.indexOf(possibleSingle[0]);
                if (indexOfCellContent !== -1) {
                    cellToRemoveFrom.splice(indexOfCellContent, 1);
                    flagHadEffect = true
                }
            })
        }
    }))

    if (flagHadEffect) {
        console.log("step Done");
        return [newArr, true]
    }

    compiledGroups.forEach(group => {
        const foundNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        group.map(([x, y]) => newArr[x][y]).forEach(cellOptions => cellOptions.length > 1 && cellOptions.forEach(cellOption => foundNumbers[cellOption]++));

        foundNumbers.forEach((count, numberToRemove) => {
            if (count === 1) {

                group.forEach(([x, y]) => {

                    const cellToRemoveFrom = newArr[x][y];

                    if (cellToRemoveFrom.length === 1) return;

                    const indexOfCellContent = cellToRemoveFrom.indexOf(numberToRemove);
                    if (indexOfCellContent !== -1) {
                        cellToRemoveFrom.splice(indexOfCellContent, 1);
                        flagHadEffect = true
                    }
                })

            } else if (count === 2 || count === 3) {
                // if a digit has <= 3 possible positions in a group, check if they are they are all in a same different group and if so, remove all other occurrences from this group

                const coordsOfPossiblePositions = group.filter(([x, y]) => numberToRemove === newArr[x][y]);
                compiledGroups
                // *3
                .filter(group => coordsOfPossiblePositions.every(([x1, y1]) => group.some(([x2, y2]) => x1 === x2 && y1 === y2)))
                .forEach(group => group.forEach(([x, y]) => {
                    // cells in group which include numberToRemove

                    // if x, y is not in coordsOfPossiblePositions, remove numberToRemove from newArr[x][y]
                    // *2
                    if (!coordsOfPossiblePositions.some(([x1, y1]) => x1 === x && y1 === y)) {
                        const cellToRemoveFrom = newArr[x][y];

                        if (cellToRemoveFrom.length === 1) {
                            throw new Error("shouldn't happen");
                        };
                        // *1
                        const indexOfCellContent = cellToRemoveFrom.indexOf(numberToRemove);
                        if (indexOfCellContent !== -1) {
                            cellToRemoveFrom.splice(indexOfCellContent, 1);
                            flagHadEffect = true
                        }
                    }
                }))

            }
        })
    })

    return [newArr, flagHadEffect];
};

const print = arr => console.table(arr.map(e1 => e1.map(e2 => e2.join(","))));

const bifurcate = arr => {
    let min = 10;
    let minX, minY;

    arr.forEach((dia, x) => dia.forEach((el, y) => {
        if (el.length < min && el.length > 1) {
            minY = x;
            minY = y;
        }
    }))

    return Array(min).keys().map(i => {
        const copy = arr.map(el => el.slice());
        copy[minX][minY] = [copy[minX][minY][i]];
        return copy
    })
};

const checkIsDone = arr => arr.every(dia => dia.every(el => el.length === 1));

const checkIsValid = (arr, compiledGroups) => compiledGroups.forEach(group => [1,2,3,4,5,6,7,8,9].some(number => group.some(([x, y]) => arr[x][y].includes(number))));



let optionsArr = startArrToOptionsArr(startArr);
const compiledGroups = groups.flatMap(compileGroup);

console.table(optionsArr.map(e1 => e1.map(e2 => e2.join(","))));

const bifurcations = [];
// I am surprised that worked... I wrote that without testing it once and only had 2 copy paste mistakes
for (let i = 0; i < 10; i++) {
    if (checkIsValid(optionsArr, compiledGroups)) {
        console.log("current State is invalid, loading bifurcation");

        if (bifurcation.length === 0) {
            throw new Error("the sudoku is not solvable");
        }

        optionsArr = bifurcations.pop();
    }


    const [newArr, flag] = solveOneStep(optionsArr, compiledGroups);

    console.table(newArr);

    if (flag === false) {
        // solver cant determine next step

        const isDone = checkIsDone(optionsArr);

        if (isDone) {
            console.log("done");
            if (bifurcations.length === 0) {
                console.log("this is also the only, unique solution");
            }
            break;

        } else {
            // use bifurcation

            const [newOptions, ...newBifurcations] = bifurcate(optionsArr);
            optionsArr = newOptions;

            bifurcations.push(...newBifurcations);
        }
    }

    optionsArr = newArr;

}