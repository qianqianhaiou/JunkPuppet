export const throttle = (fn: Function, delay: number) => {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
};
export const waitTime = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
