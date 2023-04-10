export default (oldArr, newArr) => {
  const postTitle = oldArr.map((item) => item.title);
  const result = newArr.filter((item) => !postTitle.includes(item.title));
  return result;
};
