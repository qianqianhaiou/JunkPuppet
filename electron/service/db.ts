import { join } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import lodash from 'lodash';
import { fsreadFile } from '../utils/file';

interface TaskList {
  list: TaskDetail[];
  updatedAt: number;
}
interface TaskDetail {
  name: string;
  targetUrl: string;
  auto: boolean;
  cron: string;
  cookies: any[];
  createdAt: number;
  updatedAt: number;
  autoMail: boolean;
  mail: string;
  mockDataId: string;
  _id: string;
}
interface TaskDataList {
  list: TaskDataDetail[];
  updatedAt: number;
}
interface TaskDataDetail {
  texts: any[];
  snapshots: any[];
  taskId: string;
  createdAt: number;
  taskMockId: number;
  _id: string;
}

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

export const taskListDb = (() => {
  let instance: LowWithLodash<TaskList> | null = null;
  return async () => {
    if (!instance) {
      const file: string = join(process.env.DATA_PATH_DB, 'taskList.json');
      const fileContent = await fsreadFile(file);
      const defaultData: TaskList = fileContent
        ? JSON.parse(fileContent)
        : { list: [], updatedAt: 0 };
      const adapter: any = new JSONFile(file);
      instance = new LowWithLodash(adapter, defaultData);
    }
    return instance;
  };
})();

export const taskDataDb = (() => {
  let instance: LowWithLodash<TaskDataList> | null = null;
  return async () => {
    if (!instance) {
      const file: string = join(process.env.DATA_PATH_DB, 'taskData.json');
      const fileContent = await fsreadFile(file);
      const defaultData: TaskDataList = fileContent
        ? JSON.parse(fileContent)
        : { list: [], updatedAt: 0 };
      const adapter: any = new JSONFile(file);
      instance = new LowWithLodash(adapter, defaultData);
    }
    return instance;
  };
})();
