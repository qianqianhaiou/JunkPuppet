export const asyncFor = <T = any>(
  items: T[],
  fn: (item: T, i: number) => Promise<any>,
  limit = 1
): Promise<void> => {
  return new Promise((resolve) => {
    if (!items.length) return resolve();
    const [firstItems, restItems] = [items.slice(0, limit), items.slice(limit)];
    let runningItems: T[] = [];
    firstItems.forEach(handleItem);
    async function handleItem(item: T) {
      runningItems.push(item);
      await fn(item, items.indexOf(item)).catch((e) => {
        console.error(e);
      });
      runningItems = runningItems.filter((runItem) => {
        return runItem !== item;
      });
      const nextItem = restItems.shift();
      if (nextItem) {
        handleItem(nextItem);
      } else if (!runningItems.length) {
        resolve();
      }
    }
  });
};

export const getCurrentTime = (seconds?: number) => {
  let date = new Date(seconds || Date.now());
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0") +
    " " +
    String(date.getHours()).padStart(2, "0") +
    "-" +
    String(date.getMinutes()).padStart(2, "0") +
    "-" +
    String(date.getSeconds()).padStart(2, "0")
  );
};

export async function cb2Async(fn: Function, ...params: any[]) {
  return new Promise<any>((resolve, reject) => {
    fn(...params, (err: any, result: any) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}
