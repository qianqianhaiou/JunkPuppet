import log4js from "log4js";
import { once } from "events";
import { createInterface } from "readline";
import { createReadStream, statSync } from "fs";
import { fsCheckFile } from "./file";

export const initLogger = (path: string) => {
  log4js.configure({
    appenders: {
      // console: {
      //   type: "console",
      // },
      file: {
        type: "file",
        filename: path,
        maxLogSize: 1024 * 1024 * 1,
        // max log file 5 + 1
      },
    },
    categories: { default: { appenders: ["file"], level: "info" } },
  });
  const logger = log4js.getLogger("system");
  return logger;
};

interface LogItem {
  time: string;
  type: string;
  message: string;
}
export const readLogByLine = async (path: string, bufferSize = 1024 * 24) => {
  await fsCheckFile(path);
  // 默认拿 24KB 数据  应该在300-500条
  const target: LogItem[] = [];
  const rl = createInterface({
    input: createReadStream(path, {
      start: statSync(path).size - Math.min(statSync(path).size, bufferSize),
    }),
    crlfDelay: Infinity,
  });
  rl.on("line", (line: string) => {
    const timeType = line.match(/^(\[(.+)\])/g);
    if (timeType && timeType.length) {
      const tag = timeType[0].split(" ");
      const text = line.replace(timeType[0], "");
      target.push({
        time: tag[0],
        type: tag[1],
        message: text,
      });
    }
  });
  await once(rl, "close");
  return target;
};
