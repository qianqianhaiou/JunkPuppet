export const validCronString = (value: string) => {
  const regexp = /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/;
  return regexp.test(value);
};
export const validateMail = (value: string) => {
  const regexp = /(^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$)/;
  return regexp.test(value);
};
