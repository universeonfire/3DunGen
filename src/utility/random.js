export const shuffle = (arr) => {
  let res = arr.slice(0);
  for (
    let j, x, i = res.length;
    i;
    j = Math.floor(Math.random() * i), x = res[--i], res[i] = res[j], res[j] = x
  );
  return res;
};

export const range = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};
