export const validCronString = (value: string) => {
  const regexp = /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/;
  return regexp.test(value);
};
