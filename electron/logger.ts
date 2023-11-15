const log4js = require("log4js");
const events = require("events");
const fs = require("fs");
const readline = require("readline");

function initLogger(path: string) {
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
  console.log = (...data) => {
    data.map((item) => {
      logger.info(item);
    });
  };
  console.warn = (...data) => {
    data.map((item) => {
      logger.warn(item);
    });
  };
  console.error = (...data) => {
    data.map((item) => {
      logger.error(item);
    });
  };
}
initLogger("logs/system.log");
console.log("asdfs");
console.warn("asdfs");
console.error("asdfs");
console.log("asdfs");
console.warn("asdfs");
console.error("asdfs");
console.log("asdfs");
console.warn("asdfs");
console.error("asdfs");
console.log("asdfs");
console.warn("asdfs");
console.error("asdfs");
console.log("asdfs");
console.warn("asdfsasdddsasda");
console.error("asdfs");
console.error(new Error("hahsjlskkld"));

async function readFileByLine(path: string, bufferSize = 1024 * 24) {
  // 默认拿 24KB 数据  应该在300-500条
  const target: any = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(path, {
      start:
        fs.statSync(path).size - Math.min(fs.statSync(path).size, bufferSize),
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
  await events.once(rl, "close");
  return target;
}
const filePath1 = "logs/system.log";
readFileByLine(filePath1).then((res) => {
  console.debug(res);
});
