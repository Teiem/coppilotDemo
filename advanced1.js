const constants = {
    pi: Math.PI,
    e: Math.E,
};

const regex = /(?<operation>(?:\*\*)|[-+*/])|(?<number>\d+(\.\d)?)|(?<identifier>\w+)|(?<open>\()|(?<close>\))/g;

const tokenize = string => {
    const formatted = string.replaceAll(" ", "").toLowerCase();
    const tokens = [];

    let depth = 0;
    while (true) {
        const cur = regex.exec(formatted);
        if (cur === null) break;

        let [ type, data ] = Object.entries(cur.groups).filter(([, vlaue]) => vlaue !== undefined)[0];
        const originalIndex = cur.index;

        if (type === "number") data = Number(data);
        if (type === "identifier") {
            if (constants.hasOwnProperty(data)) {
                type = "number";
                data = constants[data];

            } else {
                type = "function";

            }
        }

        if (type === "open") depth++;
        tokens.push({ type, data, depth, originalIndex });
        if (type === "close") depth--;

        if (depth < 0) throw new Error(`Brace at ${ originalIndex } has no matching opening brace`);
    }
    if (depth !== 0) throw new Error(`missing ${ depth } closing brace(s)`);


    return tokens;
}

const functions = {
    "sqrt": Math.sqrt,
    "sin": Math.sin,
    "cos": Math.cos,
    "tan": Math.tan,
    "log": Math.log,
};

const operations = [
    ["**", (a, b) => a ** b], // * 1
    ["*", (a, b) => a * b],
    ["/", (a, b) => a / b],
    ["+", (a, b) => a + b],
    ["-", (a, b) => a - b],
];

const reduce = tokens => {
    while (true) {
        const startIndex = tokens.findIndex(token => token.type === "open");
        if (startIndex === -1) break;

        const endIndex = tokens.findIndex(token => token.type === "close" && token.depth === tokens[startIndex].depth);

        const containedTokens = tokens.slice(startIndex + 1, endIndex);
        tokens.splice(startIndex, endIndex - startIndex + 1, reduce(containedTokens));
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === "function") {
            const funct = functions[tokens[i].data];
            const arg = tokens[i + 1].data;
            const res = funct(arg);

            tokens.splice(i, 2, { type: "number", data: res, depth: tokens[i].depth, originalIndex: tokens[i].originalIndex });
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].data === "-" && tokens[i - 1].type === "operation" && tokens[i + 1].type === "number") {
            const res = -tokens[i + 1].data;
            tokens.splice(i, 2, { type: "number", data: res, depth: tokens[i].depth, originalIndex: tokens[i].originalIndex });
        }
    }

    operations.forEach(([ identifier, operation ]) => {
        // *3
        for (let i = 1; i < tokens.length; i++) {
            if (tokens[i].data === identifier) {
                // *2
                const a = tokens[i - 1].data;
                const b = tokens[i + 1].data;
                const res = operation(a, b);
                tokens.splice(i - 1, 3, { type: "number", data: res, depth: tokens[i].depth, originalIndex: i - 1 });
                i -= 2;

            }
        }
    });

    return tokens[0];
};

export const calc = input => reduce(tokenize(input)).data;