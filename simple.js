const randomNumber = Math.floor(Math.random() * 10);

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const sumOfNumbers = numbers.reduce((acc, curr) => acc + curr);

const sumOfEvenNumbersDivisibleByThree = numbers.reduce((acc, curr) => {
    if (curr % 2 === 0 && curr % 3 === 0) {
        return acc + curr;
    } else {
        return acc;
    }
}, 0);

// get the numbers from 1 to 100 and log them. if they are divisible by 3, log fizz. if they are divisible by 5, log buzz. if they are divisible by 3 and 5, log fizzbuzz.
const fizzbuzz = numbers.reduce((acc, curr) => {
    if (curr % 3 === 0 && curr % 5 === 0) {
        return acc + "fizzbuzz";
    } else if (curr % 3 === 0) {
        return acc + "fizz";
    } else if (curr % 5 === 0) {
        return acc + "buzz";
    } else {
        return acc + curr;
    }
}, "");

const someFunction = (a, b) => b ? someFunction(b, a % b) : a; // Euclid's algorithm

const someOtherFunction = n => {
    let a = 0;
    let b = 1;
    // *
    for (let i = 0; i < n; i++) {
        [a, b] = [b, a + b];
    }

    return a;
} // *2 Fibonacci