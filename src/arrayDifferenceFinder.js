const findNewValue = (oldArr, newArr) => newArr.find((value) => !oldArr.includes(value));

const oldArr = [1, 2, 3];
const newArr = [2, 3, 4];

console.log(findNewValue(oldArr, newArr)); // 4
