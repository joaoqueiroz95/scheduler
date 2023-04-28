export const arrayToEnum = <T extends string>(arr: T[]): Record<T, T> => {
  return arr.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {} as Record<T, T>);
};
