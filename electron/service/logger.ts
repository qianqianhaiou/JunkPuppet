import log4js from 'log4js';
import { once } from 'events';
import { createInterface } from 'readline';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { fsCheckFile, deleteFile, fswriteFile, readDir } from '../utils/file';

export const initLogger = (path: string) => {
  log4js.configure({
    appenders: {
      // console: {
      //   type: "console",
      // },
      file: {
        type: 'file',
        filename: path,
        maxLogSize: 1024 * 1024 * 1,
        // max log file 5 + 1
      },
    },
    categories: { default: { appenders: ['file'], level: 'info' } },
  });
  const logger = log4js.getLogger('system');
  return logger;
};

const readLogByLine = async (path: string, bufferSize = 1024 * 24) => {
  await fsCheckFile(path);
  // 默认拿 24KB 数据  应该在300-500条
  const target: LogItem[] = [];
  let count = 0;
  const rl = createInterface({
    input: createReadStream(path, {
      start: statSync(path).size - Math.min(statSync(path).size, bufferSize),
    }),
    crlfDelay: Infinity,
  });
  rl.on('line', (line: string) => {
    count++;
    const timeType = line.match(/^(\[(.+)\])/g);
    if (timeType && timeType.length) {
      const tag = timeType[0].split(' ');
      const text = line.replace(timeType[0], '');
      target.push({
        time: tag[0],
        type: tag[1],
        message: text,
        index: 'block-' + count,
      });
    }
  });
  await once(rl, 'close');
  return target;
};

// 读取最近的几条日志
export const getRecentLogs = async () => {
  return readLogByLine(join(process.env.DATA_PATH_LOG, 'system.log'));
};

// 清除所有日志
export const clearAllLogs = async () => {
  const files = await readDir(process.env.DATA_PATH_LOG);
  for (let i = 0; i < files.length; i++) {
    if (files[i] !== 'system.log') {
      await deleteFile(join(process.env.DATA_PATH_LOG, files[i]));
    }
  }
  await fswriteFile(join(process.env.DATA_PATH_LOG, 'system.log'), '');
  return 'success';
};
