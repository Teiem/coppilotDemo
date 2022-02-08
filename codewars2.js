/*
    Given two arrays a and b write a function comp(a, b) (orcompSame(a, b)) that checks whether the two arrays have the "same" elements, with the same multiplicities (the multiplicity of a member is the number of times it appears). "Same" means, here, that the elements in b are the elements in a squared, regardless of the order.
    a or b might be null
*/
function comp(a, b){
    if (a === null || b === null) return false;
    const a2 = a.map(x => x * x);
    return a2.sort().join('') === b.sort().join('');
}

// 6 - https://www.codewars.com/kata/550498447451fbbd7600041c/train/javascript